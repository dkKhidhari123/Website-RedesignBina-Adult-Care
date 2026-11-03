import type { VercelRequest, VercelResponse } from '@vercel/node';
import { normalizeVisit, SERVICE_INTERESTS, validateVisit } from '../src/lib/validation.js';
import { ensureConfigured, fail, insertRow, meta, notifyTeam, readBody, sendValidationErrors } from './_lib/server.js';

/** POST /api/visit — visit / consultation requests → visit_requests (status "requested", confirmed by staff) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = readBody(req, res, 20_000);
  if (!body) return;

  const data = normalizeVisit(body);
  // Allow "today" in the visitor's time zone, which can be a day behind the server (UTC).
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const errors = validateVisit(data, yesterday);
  if (Object.keys(errors).length) return sendValidationErrors(res, errors);
  if (!ensureConfigured(res)) return;

  try {
    await insertRow('visit_requests', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      care_type: data.service,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      visitors: data.visitors,
      message: data.message || null,
      ...meta(req, body),
    });
  } catch (err) {
    return fail(res, err);
  }

  await notifyTeam(
    `Visit request: ${data.preferredDate} ${data.preferredTime} — ${data.name}`,
    [
      'A visitor has REQUESTED a visit. Please contact them to confirm.',
      '',
      `Service: ${data.service ? SERVICE_INTERESTS[data.service] : '—'}`,
      `Preferred date: ${data.preferredDate}`,
      `Preferred time: ${data.preferredTime}`,
      `Visitors: ${data.visitors}`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      '',
      data.message || '(no message)',
    ],
    data.email,
  );
  return res.status(200).json({ ok: true });
}
