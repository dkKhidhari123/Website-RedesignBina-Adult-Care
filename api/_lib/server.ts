/**
 * Server-only helpers for the /api functions. Files in api/_lib are not routes.
 * Env: BLOB_READ_WRITE_TOKEN (private Vercel Blob store — see store.ts)
 *      RESEND_API_KEY, CONTACT_NOTIFY_EMAIL, CONTACT_FROM_EMAIL (optional email alerts)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { addRecord, storeConfigured, writeFile, type InboxTable } from './store.js';

const MIN_FILL_MS = 2500; // people take longer than this to fill in a form

export type Body = Record<string, unknown>;

/** Handles method, size and spam checks. Returns the parsed body, or null if a response was already sent. */
export function readBody(req: VercelRequest, res: VercelResponse, maxBytes: number): Body | null {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return null;
  }
  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'Invalid request' });
    return null;
  }
  if (JSON.stringify(body).length > maxBytes) {
    res.status(413).json({ ok: false, error: 'Request too large' });
    return null;
  }
  // Honeypot filled in, or submitted impossibly fast: pretend success so bots learn nothing.
  const b = body as Body;
  const startedAt = Number(b.startedAt);
  if (b.company || (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS)) {
    res.status(200).json({ ok: true });
    return null;
  }
  return b;
}

export function sendValidationErrors(res: VercelResponse, fields: object) {
  res.status(422).json({ ok: false, error: 'Please check the highlighted fields.', fields });
}

export function ensureConfigured(res: VercelResponse) {
  if (storeConfigured()) return true;
  console.error('[api] Missing BLOB_READ_WRITE_TOKEN (connect a private Blob store to the project)');
  res.status(503).json({ ok: false, error: 'Our online form is temporarily unavailable. Please call us instead.' });
  return false;
}

/** Saves one form submission privately (see store.ts). */
export async function insertRow(table: InboxTable, row: Record<string, unknown>) {
  await addRecord(table, row);
}

/** Saves an uploaded file privately. Returns the stored pathname. */
export async function uploadPrivateFile(folder: string, name: string, bytes: Buffer, contentType: string) {
  const pathname = `${folder}/${name}`;
  await writeFile(pathname, bytes, contentType);
  return pathname;
}

/** Best-effort email alert to the team via Resend. Never throws. */
export async function notifyTeam(subject: string, lines: string[], replyTo?: string) {
  const { RESEND_API_KEY, CONTACT_NOTIFY_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_NOTIFY_EMAIL || !CONTACT_FROM_EMAIL) return;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_NOTIFY_EMAIL.split(',').map((s) => s.trim()),
        reply_to: replyTo,
        subject,
        text: lines.join('\n'),
      }),
    });
    if (!r.ok) console.error('[api] Resend failed', r.status, await r.text());
  } catch (err) {
    console.error('[api] Resend request failed', err);
  }
}

export function meta(req: VercelRequest, body: Body) {
  return {
    source_page: typeof body.sourcePage === 'string' ? body.sourcePage.slice(0, 200) : null,
    user_agent: String(req.headers['user-agent'] ?? '').slice(0, 400) || null,
  };
}

export function fail(res: VercelResponse, err: unknown, message = 'We could not send your request. Please try again or call us.') {
  console.error('[api]', err);
  res.status(502).json({ ok: false, error: message });
}

/* ── Admin dashboard helpers ──────────────────────────────── */

/* ── Admin login: one Admin ID + password from environment variables ──
   ADMIN_USERNAME / ADMIN_PASSWORD are set in Vercel. After a successful login the
   server sets an HttpOnly, signed session cookie (8 hours). The signing key is derived
   from the password (plus ADMIN_SESSION_SECRET if set), so changing the password signs everyone out. */


export const SESSION_COOKIE = 'bina_admin';
const SESSION_SECONDS = 8 * 60 * 60;

export const adminLoginConfigured = () => Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);

function signingKey() {
  return createHash('sha256')
    .update(`bina-admin-session:${process.env.ADMIN_PASSWORD}:${process.env.ADMIN_SESSION_SECRET ?? ''}`)
    .digest();
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

/** Constant-time comparison of two strings. */
export function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(username: unknown, password: unknown) {
  if (!adminLoginConfigured() || typeof username !== 'string' || typeof password !== 'string') return false;
  // Evaluate both so timing does not reveal which one was wrong.
  const u = safeEqual(username.trim().toLowerCase(), process.env.ADMIN_USERNAME!.trim().toLowerCase());
  const p = safeEqual(password, process.env.ADMIN_PASSWORD!);
  return u && p;
}

export function createSessionCookie(req: { headers: Record<string, string | string[] | undefined> }) {
  const payload = b64url(JSON.stringify({ u: process.env.ADMIN_USERNAME, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }));
  const sig = b64url(createHmac('sha256', signingKey()).update(payload).digest());
  return cookie(req, `${payload}.${sig}`, SESSION_SECONDS);
}

export function clearSessionCookie(req: { headers: Record<string, string | string[] | undefined> }) {
  return cookie(req, '', 0);
}

function cookie(req: { headers: Record<string, string | string[] | undefined> }, value: string, maxAge: number) {
  const host = String(req.headers.host ?? '');
  const secure = !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host); // Secure everywhere except local development
  return `${SESSION_COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

/** Returns the signed-in admin from the session cookie, or null. */
export function verifyAdmin(cookieHeader: string | undefined) {
  if (!adminLoginConfigured()) return null;
  const raw = cookieHeader?.split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  const [payload, sig] = raw?.split('.') ?? [];
  if (!payload || !sig) return null;
  const expected = b64url(createHmac('sha256', signingKey()).update(payload).digest());
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { u: string; exp: number };
    if (data.exp < Date.now() / 1000) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}

/* Simple brute-force protection: after 5 failed logins from one IP within 15 minutes,
   further attempts are refused for the rest of that window. (Per server instance.) */
const failures = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;

export function loginBlocked(ip: string) {
  const f = failures.get(ip);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return f.count >= 5;
}

export function recordLoginFailure(ip: string) {
  const f = failures.get(ip);
  if (!f || Date.now() - f.first > WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() });
  else f.count++;
}

export function clearLoginFailures(ip: string) {
  failures.delete(ip);
}
