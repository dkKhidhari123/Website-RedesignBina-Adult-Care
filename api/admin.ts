import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { CMS_KEYS, ContentError, sanitizeContent, type CmsKey } from '../src/lib/cms.js';
import {
  adminLoginConfigured,
  checkCredentials,
  clearLoginFailures,
  clearSessionCookie,
  createSessionCookie,
  loginBlocked,
  recordLoginFailure,
  verifyAdmin,
} from './_lib/server.js';
import {
  allRecords,
  ID_PATTERN,
  INBOX,
  listFiles,
  readFile,
  readJson,
  recordPath,
  removeFile,
  storeConfigured,
  writeFile,
  writeJson,
  type InboxRecord,
  type InboxTable,
} from './_lib/store.js';

/**
 * /api/admin — every admin dashboard action.
 *
 * POST { action, ...params }: "login" checks the Admin ID and password and sets an HttpOnly
 * session cookie; every other action requires that cookie.
 * GET ?resume=<id> / ?image=<cms-id>: streams a private file to a signed-in admin.
 *
 * Env: ADMIN_USERNAME, ADMIN_PASSWORD, BLOB_READ_WRITE_TOKEN,
 *      VERCEL_DEPLOY_HOOK_URL (for "Publish")
 */

const PAGE_SIZE = 25;

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const asTable = (v: unknown): InboxTable => {
  if (typeof v === 'string' && v in INBOX) return v as InboxTable;
  throw new HttpError(400, 'Unknown list.');
};
const asId = (v: unknown): string => {
  if (typeof v === 'string' && ID_PATTERN.test(v)) return v;
  throw new HttpError(400, 'Invalid id.');
};

interface ContentDoc {
  value: unknown;
  updated_at: string;
  updated_by: string;
}
const contentPath = (key: string) => `content/${key}.json`;

const getMeta = async () => ((await readJson<ContentDoc>(contentPath('meta')))?.value ?? {}) as Record<string, unknown>;
const putContent = (key: string, value: unknown, by: string) =>
  writeJson(contentPath(key), { value, updated_at: new Date().toISOString(), updated_by: by } satisfies ContentDoc);

async function getRecord(table: InboxTable, id: string) {
  const r = await readJson<InboxRecord>(recordPath(table, id));
  if (!r) throw new HttpError(404, 'That entry no longer exists.');
  return r;
}

const IMAGE_TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', magic: (b) => b.subarray(0, 4).toString('hex') === '89504e47' },
  'image/webp': { ext: 'webp', magic: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
};

/** GET: private files for signed-in admins only. */
async function download(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdmin(req.headers.cookie)) throw new HttpError(401, 'Please sign in.');
  const { resume, image } = req.query;

  if (typeof resume === 'string') {
    const rec = await getRecord('job_applications', asId(resume));
    const file = typeof rec.resume_path === 'string' ? await readFile(rec.resume_path) : null;
    if (!file) throw new HttpError(404, 'No resume on file.');
    const name = String(rec.resume_filename || 'resume').replace(/[^\w.\- ]+/g, '_');
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(file.body);
  }

  if (typeof image === 'string' && /^cms-[a-z0-9-]+$/.test(image)) {
    const pathname = (await listFiles('uploads/')).find((p) => p.startsWith(`uploads/${image}.`));
    const file = pathname ? await readFile(pathname) : null;
    if (!file) throw new HttpError(404, 'Photo not found.');
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).send(file.body);
  }

  throw new HttpError(400, 'Unknown file.');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!adminLoginConfigured())
    return res.status(503).json({ ok: false, error: 'The admin login is not set up yet (ADMIN_USERNAME / ADMIN_PASSWORD).' });

  try {
    if (req.method === 'GET') {
      if (!storeConfigured()) throw new HttpError(503, 'Storage is not connected yet.');
      return await download(req, res);
    }

    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
    const action = String(body.action ?? '');
    // x-real-ip is set by Vercel's edge (clients cannot override it).
    const ip = String(req.headers['x-real-ip'] ?? '') || req.socket?.remoteAddress || 'unknown';

    if (action === 'login') {
      if (loginBlocked(ip)) throw new HttpError(429, 'Too many attempts. Please wait 15 minutes and try again.');
      if (!checkCredentials(body.username, body.password)) {
        recordLoginFailure(ip);
        await new Promise((r) => setTimeout(r, 700)); // slow down guessing
        throw new HttpError(401, 'Admin ID or password is incorrect.');
      }
      clearLoginFailures(ip);
      res.setHeader('Set-Cookie', createSessionCookie(req));
      return res.status(200).json({ ok: true, username: process.env.ADMIN_USERNAME });
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', clearSessionCookie(req));
      return res.status(200).json({ ok: true });
    }

    const admin = verifyAdmin(req.headers.cookie);
    if (!admin) throw new HttpError(401, 'Please sign in.');

    if (action === 'me') return res.status(200).json({ ok: true, username: admin.username });

    // Everything below reads or writes stored data.
    if (!storeConfigured())
      throw new HttpError(503, 'Storage is not connected yet. In Vercel → Storage, create a private Blob store and connect it to this project.');

    switch (action) {
      case 'dashboard': {
        const tables = Object.keys(INBOX) as InboxTable[];
        const all = await Promise.all(tables.map((t) => allRecords(t)));
        const counts = Object.fromEntries(tables.map((t, i) => [t, { open: all[i].filter((r) => r.status === INBOX[t][0]).length, total: all[i].length }]));
        const recent = Object.fromEntries(tables.map((t, i) => [t, all[i].slice(0, 5)]));
        return res.status(200).json({ ok: true, counts, recent });
      }

      case 'list': {
        const table = asTable(body.table);
        const page = Math.max(0, Math.floor(Number(body.page) || 0));
        const status = typeof body.status === 'string' && (INBOX[table] as readonly string[]).includes(body.status) ? body.status : '';
        const rows = (await allRecords(table)).filter((r) => !status || r.status === status);
        return res.status(200).json({
          ok: true,
          rows: rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
          total: rows.length,
          pageSize: PAGE_SIZE,
          statuses: INBOX[table],
        });
      }

      case 'update': {
        const table = asTable(body.table);
        const rec = await getRecord(table, asId(body.id));
        if (body.status !== undefined) {
          if (!(INBOX[table] as readonly string[]).includes(body.status)) throw new HttpError(400, 'Invalid status.');
          rec.status = body.status;
        }
        if (body.staff_notes !== undefined) rec.staff_notes = String(body.staff_notes).slice(0, 4000);
        await writeJson(recordPath(table, rec.id), rec);
        return res.status(200).json({ ok: true });
      }

      case 'delete': {
        const table = asTable(body.table);
        const rec = await getRecord(table, asId(body.id));
        if (typeof rec.resume_path === 'string') await removeFile(rec.resume_path).catch(() => {});
        await removeFile(recordPath(table, rec.id));
        return res.status(200).json({ ok: true });
      }

      case 'resumeUrl': {
        const id = asId(body.id);
        return res.status(200).json({ ok: true, url: `/api/admin?resume=${id}` });
      }

      case 'getContent': {
        const paths = (await listFiles('content/')).filter((p) => p.endsWith('.json'));
        const docs = await Promise.all(paths.map(async (p) => [p.slice(8, -5), await readJson<ContentDoc>(p)] as const));
        return res.status(200).json({ ok: true, content: Object.fromEntries(docs.filter(([, d]) => d)) });
      }

      case 'saveContent': {
        const key = body.key as CmsKey;
        if (!CMS_KEYS.includes(key)) throw new HttpError(400, 'Unknown section.');
        const value = sanitizeContent(key, body.value);
        await putContent(key, value, admin.username);
        return res.status(200).json({ ok: true, value });
      }

      case 'upload': {
        const type = IMAGE_TYPES[String(body.type)];
        if (!type || typeof body.data !== 'string') throw new HttpError(400, 'Please upload a JPG, PNG or WebP photo.');
        const bytes = Buffer.from(body.data, 'base64');
        if (bytes.length > 3 * 1024 * 1024) throw new HttpError(400, 'Please upload a photo smaller than 3 MB.');
        if (!type.magic(bytes)) throw new HttpError(400, 'That file does not look like a valid photo.');
        const image = `cms-${randomUUID().slice(0, 12)}`;
        await writeFile(`uploads/${image}.${type.ext}`, bytes, String(body.type));
        return res.status(200).json({ ok: true, image, url: `/api/admin?image=${image}` });
      }

      case 'publish': {
        const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
        if (!hook) throw new HttpError(503, 'Publishing is not set up yet (VERCEL_DEPLOY_HOOK_URL is missing).');
        const r = await fetch(hook, { method: 'POST' });
        if (!r.ok) throw new HttpError(502, 'The website could not be rebuilt. Please try again.');
        const meta = { ...(await getMeta()), lastPublishedAt: new Date().toISOString(), lastPublishedBy: admin.username };
        await putContent('meta', meta, admin.username);
        return res.status(200).json({ ok: true, meta });
      }

      default:
        throw new HttpError(400, 'Unknown action.');
    }
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ ok: false, error: err.message });
    if (err instanceof ContentError) return res.status(422).json({ ok: false, error: err.message });
    console.error('[admin]', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }
}
