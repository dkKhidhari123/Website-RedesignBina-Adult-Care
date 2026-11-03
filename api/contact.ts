import type { VercelRequest, VercelResponse } from '@vercel/node';
import { normalizeContact, SERVICE_INTERESTS, validateContact } from '../src/lib/validation.js';
import { ensureConfigured, fail, insertRow, meta, notifyTeam, readBody, sendValidationErrors } from './_lib/server.js';

/** POST /api/contact — general inquiries → contact_submissions */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = readBody(req, res, 20_000);
  if (!body) return;

  const data = normalizeContact(body);
  const errors = validateContact(data);
  if (Object.keys(errors).length) return sendValidationErrors(res, errors);
  if (!ensureConfigured(res)) return;

  try {
    await insertRow('contact_submissions', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      inquiry_type: data.service || 'general',
      subject: data.subject,
      message: data.message,
      ...meta(req, body),
    });
  } catch (err) {
    return fail(res, err);
  }

  const interest = data.service ? SERVICE_INTERESTS[data.service] : '—';
  await notifyTeam(
    `Website message: ${data.subject} — ${data.name}`,
    [`Subject: ${data.subject}`, `Service interest: ${interest}`, `Name: ${data.name}`, `Phone: ${data.phone}`, `Email: ${data.email}`, '', data.message],
    data.email,
  );
  return res.status(200).json({ ok: true });
}
