/**
 * Private file storage for form submissions, resumes, website content and uploaded photos.
 *
 * On Vercel: a **private** Vercel Blob store (env BLOB_READ_WRITE_TOKEN, added automatically when
 * the store is connected to the project). Nothing in it has a public URL — every read goes through
 * the /api functions, which check the admin session first.
 *
 * Local development (not on Vercel, no token): files are kept in ./.data instead (gitignored),
 * so the forms and admin dashboard can be tried without any cloud setup.
 *
 * Layout:
 *   inbox/<table>/<id>.json      one form submission
 *   resumes/<id>.<ext>           resume uploaded with a job application
 *   content/<key>.json           a section edited in the admin dashboard
 *   uploads/cms-<id>.<ext>       photo uploaded in the admin dashboard
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { del, get, list, put } from '@vercel/blob';

const LOCAL_DIR = path.resolve(process.cwd(), '.data');
const local = () => !process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL;

export const storeConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN) || local();

/** Pathnames are built by our code only; this guards against anything unexpected slipping through. */
function safe(pathname: string) {
  if (!/^[a-z]+\/[A-Za-z0-9._/-]+$/.test(pathname) || pathname.includes('..')) throw new Error(`Bad pathname: ${pathname}`);
  return pathname;
}

export async function writeFile(pathname: string, body: Buffer | string, contentType: string) {
  safe(pathname);
  if (local()) {
    const file = path.join(LOCAL_DIR, pathname);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    return;
  }
  await put(pathname, body, { access: 'private', contentType, addRandomSuffix: false, allowOverwrite: true });
}

export async function readFile(pathname: string): Promise<{ body: Buffer; contentType: string } | null> {
  safe(pathname);
  if (local()) {
    try {
      return { body: await fs.readFile(path.join(LOCAL_DIR, pathname)), contentType: CONTENT_TYPES[path.extname(pathname)] ?? 'application/octet-stream' };
    } catch {
      return null;
    }
  }
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return { body: Buffer.from(await new Response(r.stream).arrayBuffer()), contentType: r.blob.contentType };
}

export async function listFiles(prefix: string): Promise<string[]> {
  safe(prefix + 'x');
  if (local()) {
    const dir = path.join(LOCAL_DIR, prefix);
    try {
      return (await fs.readdir(dir)).map((f) => prefix + f);
    } catch {
      return [];
    }
  }
  const out: string[] = [];
  let cursor: string | undefined;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    out.push(...r.blobs.map((b) => b.pathname));
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

export async function removeFile(pathname: string) {
  safe(pathname);
  if (local()) return fs.rm(path.join(LOCAL_DIR, pathname), { force: true });
  await del(pathname);
}

export async function readJson<T>(pathname: string): Promise<T | null> {
  const f = await readFile(pathname);
  return f ? (JSON.parse(f.body.toString('utf8')) as T) : null;
}

export const writeJson = (pathname: string, value: unknown) => writeFile(pathname, JSON.stringify(value), 'application/json');

const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/* ── Inbox records ─────────────────────────────────────────── */

export const INBOX = {
  contact_submissions: ['new', 'contacted', 'closed'],
  visit_requests: ['requested', 'confirmed', 'completed', 'cancelled'],
  job_applications: ['new', 'reviewing', 'interview', 'hired', 'closed'],
} as const;
export type InboxTable = keyof typeof INBOX;

/** Sortable id: UTC timestamp + random part, e.g. 20261106T120102123Z-1a2b3c4d */
export const newId = () => `${new Date().toISOString().replace(/[-:.]/g, '')}-${randomUUID().slice(0, 8)}`;
export const ID_PATTERN = /^\d{8}T\d{9}Z-[0-9a-f]{8}$/;

export type InboxRecord = Record<string, unknown> & { id: string; created_at: string; status: string };

export const recordPath = (table: InboxTable, id: string) => `inbox/${table}/${id}.json`;

/** Saves a new submission with its table's starting status. */
export async function addRecord(table: InboxTable, fields: Record<string, unknown>, id = newId()) {
  const record: InboxRecord = { id, created_at: new Date().toISOString(), status: INBOX[table][0], staff_notes: null, ...fields };
  await writeJson(recordPath(table, id), record);
  return record;
}

/** All submissions in a table, newest first. Fine for the volume a single care home receives. */
export async function allRecords(table: InboxTable): Promise<InboxRecord[]> {
  const paths = (await listFiles(`inbox/${table}/`)).filter((p) => p.endsWith('.json'));
  const records = await Promise.all(paths.map((p) => readJson<InboxRecord>(p)));
  return records.filter((r): r is InboxRecord => r !== null).sort((a, b) => (a.id < b.id ? 1 : -1));
}
