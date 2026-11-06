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
  supabase,
  supabaseConfigured,
  verifyAdmin,
} from './_lib/server.js';

/**
 * POST /api/admin — every admin dashboard action.
 * Body: { action: string, ...params }.
 * "login" checks the Admin ID and password and sets an HttpOnly session cookie;
 * every other action requires that cookie.
 *
 * Env: ADMIN_USERNAME, ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      VERCEL_DEPLOY_HOOK_URL (for "Publish")
 */

const TABLES = {
  contact_submissions: ['new', 'contacted', 'closed'],
  visit_requests: ['requested', 'confirmed', 'completed', 'cancelled'],
  job_applications: ['new', 'reviewing', 'interview', 'hired', 'closed'],
} as const;
type Table = keyof typeof TABLES;

const NEW_STATUS: Record<Table, string> = {
  contact_submissions: 'new',
  visit_requests: 'requested',
  job_applications: 'new',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 25;

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const asTable = (v: unknown): Table => {
  if (typeof v === 'string' && v in TABLES) return v as Table;
  throw new HttpError(400, 'Unknown list.');
};
const asId = (v: unknown): string => {
  if (typeof v === 'string' && UUID.test(v)) return v;
  throw new HttpError(400, 'Invalid id.');
};

async function count(table: Table, status?: string) {
  const filter = status ? `&status=eq.${status}` : '';
  const r = await supabase(`/rest/v1/${table}?select=id${filter}&limit=1`, { headers: { Prefer: 'count=exact' } });
  return Number(r.headers.get('content-range')?.split('/')[1] ?? 0);
}

async function recent(table: Table) {
  const r = await supabase(`/rest/v1/${table}?select=*&order=created_at.desc&limit=5`);
  return r.json();
}

async function getMeta() {
  const r = await supabase(`/rest/v1/site_content?key=eq.meta&select=value`);
  const rows = (await r.json()) as { value: Record<string, unknown> }[];
  return rows[0]?.value ?? {};
}

async function putContent(key: string, value: unknown, by: string) {
  await supabase(`/rest/v1/site_content`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString(), updated_by: by }),
  });
}

const IMAGE_TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', magic: (b) => b.subarray(0, 4).toString('hex') === '89504e47' },
  'image/webp': { ext: 'webp', magic: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!adminLoginConfigured())
    return res.status(503).json({ ok: false, error: 'The admin login is not set up yet (ADMIN_USERNAME / ADMIN_PASSWORD).' });

  try {
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

    // Everything below reads or writes the database.
    if (!supabaseConfigured())
      throw new HttpError(503, 'The database is not connected yet (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');

    switch (action) {

      case 'dashboard': {
        const tables = Object.keys(TABLES) as Table[];
        const [counts, recents, meta] = await Promise.all([
          Promise.all(tables.map(async (t) => [t, { open: await count(t, NEW_STATUS[t]), total: await count(t) }] as const)),
          Promise.all(tables.map(async (t) => [t, await recent(t)] as const)),
          getMeta(),
        ]);
        return res.status(200).json({ ok: true, counts: Object.fromEntries(counts), recent: Object.fromEntries(recents), meta });
      }

      case 'list': {
        const table = asTable(body.table);
        const page = Math.max(0, Math.floor(Number(body.page) || 0));
        const status = typeof body.status === 'string' && (TABLES[table] as readonly string[]).includes(body.status) ? body.status : '';
        const filter = status ? `&status=eq.${status}` : '';
        const r = await supabase(
          `/rest/v1/${table}?select=*${filter}&order=created_at.desc&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
          { headers: { Prefer: 'count=exact' } },
        );
        const total = Number(r.headers.get('content-range')?.split('/')[1] ?? 0);
        return res.status(200).json({ ok: true, rows: await r.json(), total, pageSize: PAGE_SIZE, statuses: TABLES[table] });
      }

      case 'update': {
        const table = asTable(body.table);
        const id = asId(body.id);
        const patch: Record<string, string> = {};
        if (body.status !== undefined) {
          if (!(TABLES[table] as readonly string[]).includes(body.status)) throw new HttpError(400, 'Invalid status.');
          patch.status = body.status;
        }
        if (body.staff_notes !== undefined) patch.staff_notes = String(body.staff_notes).slice(0, 4000);
        if (!Object.keys(patch).length) throw new HttpError(400, 'Nothing to update.');
        await supabase(`/rest/v1/${table}?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
        return res.status(200).json({ ok: true });
      }

      case 'delete': {
        const table = asTable(body.table);
        const id = asId(body.id);
        if (table === 'job_applications') {
          const r = await supabase(`/rest/v1/job_applications?id=eq.${id}&select=resume_path`);
          const [row] = (await r.json()) as { resume_path: string | null }[];
          if (row?.resume_path) await supabase(`/storage/v1/object/resumes/${row.resume_path}`, { method: 'DELETE' }).catch(() => {});
        }
        await supabase(`/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        return res.status(200).json({ ok: true });
      }

      case 'resumeUrl': {
        const id = asId(body.id);
        const r = await supabase(`/rest/v1/job_applications?id=eq.${id}&select=resume_path,resume_filename`);
        const [row] = (await r.json()) as { resume_path: string | null; resume_filename: string | null }[];
        if (!row?.resume_path) throw new HttpError(404, 'No resume on file.');
        const s = await supabase(`/storage/v1/object/sign/resumes/${row.resume_path}`, {
          method: 'POST',
          body: JSON.stringify({ expiresIn: 300 }),
        });
        const { signedURL } = (await s.json()) as { signedURL: string };
        const base = process.env.SUPABASE_URL!.replace(/\/$/, '');
        const download = row.resume_filename ? `&download=${encodeURIComponent(row.resume_filename)}` : '';
        return res.status(200).json({ ok: true, url: `${base}/storage/v1${signedURL}${download}` });
      }

      case 'getContent': {
        const r = await supabase(`/rest/v1/site_content?select=key,value,updated_at,updated_by`);
        const rows = (await r.json()) as { key: string; value: unknown; updated_at: string; updated_by: string }[];
        return res.status(200).json({ ok: true, content: Object.fromEntries(rows.map((x) => [x.key, x])) });
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
        const id = randomUUID().slice(0, 12);
        const path = `gallery/cms-${id}.${type.ext}`;
        await supabase(`/storage/v1/object/site-images/${path}`, {
          method: 'POST',
          headers: { 'Content-Type': String(body.type), 'x-upsert': 'false' },
          body: bytes,
        });
        const base = process.env.SUPABASE_URL!.replace(/\/$/, '');
        return res.status(200).json({ ok: true, image: `cms-${id}`, url: `${base}/storage/v1/object/public/site-images/${path}` });
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
