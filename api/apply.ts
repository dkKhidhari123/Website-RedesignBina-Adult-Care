import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { normalizeApplication, RESUME, validateApplication } from '../src/lib/validation.js';
import { ensureConfigured, fail, insertRow, meta, notifyTeam, readBody, sendValidationErrors, uploadPrivateFile } from './_lib/server.js';

/** POST /api/apply — job applications → job_applications, resume → private resumes/ folder (Vercel Blob) */

const TYPES: Record<string, { mime: string; magic: number[] }> = {
  pdf: { mime: 'application/pdf', magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', magic: [0x50, 0x4b, 0x03, 0x04] }, // ZIP
  doc: { mime: 'application/msword', magic: [0xd0, 0xcf, 0x11, 0xe0] }, // OLE2
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel accepts request bodies up to 4.5 MB; a 3 MB file is ~4 MB as base64.
  const body = readBody(req, res, 4_400_000);
  if (!body) return;

  const data = normalizeApplication(body);
  let bytes: Buffer | null = null;
  let ext = '';
  if (data.resume) {
    bytes = Buffer.from(data.resume.data, 'base64');
    data.resume.size = bytes.length; // trust the bytes, not the client
    ext = data.resume.name.split('.').pop()?.toLowerCase() ?? '';
  }
  const errors = validateApplication(data);
  if (bytes && !errors.resume) {
    const t = TYPES[ext];
    if (!t || bytes.length > RESUME.maxBytes || !t.magic.every((b, i) => bytes![i] === b)) {
      errors.resume = 'That file does not look like a valid PDF or Word document.';
    }
  }
  if (Object.keys(errors).length) return sendValidationErrors(res, errors);
  if (!ensureConfigured(res)) return;

  let resumePath: string | null = null;
  try {
    if (bytes) {
      const safeName = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'applicant';
      const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}-${safeName}.${ext}`;
      resumePath = await uploadPrivateFile('resumes', path, bytes, TYPES[ext].mime);
    }
    await insertRow('job_applications', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      experience: data.experience || null,
      message: data.message || null,
      resume_path: resumePath,
      resume_filename: data.resume?.name ?? null,
      ...meta(req, body),
    });
  } catch (err) {
    return fail(res, err, 'We could not submit your application. Please try again or email us.');
  }

  await notifyTeam(
    `Job application: ${data.position} — ${data.name}`,
    [
      `Position: ${data.position}`,
      `Experience: ${data.experience || '—'}`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      `Resume: ${resumePath ? 'attached — download it in the admin dashboard' : 'not provided'}`,
      '',
      data.message || '(no message)',
    ],
    data.email,
  );
  return res.status(200).json({ ok: true });
}
