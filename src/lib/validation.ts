/**
 * Form validation shared by the browser (instant feedback) and the /api
 * functions (the source of truth). Dependency-free on purpose.
 */
import { EXPERIENCE_OPTIONS, VISIT_TIMES, VISITOR_COUNTS } from '../data/options.js'; // .js: required for Node ESM in Vercel functions

export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

function checkPerson(d: { name: string; email: string; phone: string }, phoneRequired: boolean) {
  const e: Record<string, string> = {};
  if (d.name.length < 2) e.name = 'Please enter your full name.';
  const digits = d.phone.replace(/\D/g, '');
  if (phoneRequired && !digits) e.phone = 'Please enter a phone number so we can reach you.';
  else if (d.phone && (digits.length < 10 || digits.length > 15)) e.phone = 'Please enter a valid phone number, including area code.';
  if (!EMAIL_RE.test(d.email)) e.email = 'Please enter a valid email address.';
  return e;
}

/** Local date as YYYY-MM-DD (avoids UTC rolling the date forward in the evening). */
export function todayISO(now = new Date()) {
  const tz = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

/* ── Contact ──────────────────────────────────────────────── */
export const SERVICE_INTERESTS = {
  residential: 'Residential Care',
  home: 'Home Care',
  unsure: 'Not sure yet',
} as const;
export type ServiceInterest = keyof typeof SERVICE_INTERESTS;
const INTEREST_KEYS = Object.keys(SERVICE_INTERESTS) as ServiceInterest[];

export interface ContactData {
  name: string;
  phone: string;
  email: string;
  service: '' | ServiceInterest;
  subject: string;
  message: string;
}

export function normalizeContact(i: Record<string, unknown>): ContactData {
  return {
    name: str(i.name, 120),
    phone: str(i.phone, 40),
    email: str(i.email, 254).toLowerCase(),
    service: pick(i.service, ['', ...INTEREST_KEYS], ''),
    subject: str(i.subject, 150),
    message: str(i.message, 4000),
  };
}

export function validateContact(d: ContactData): Errors<ContactData> {
  const e: Errors<ContactData> = checkPerson(d, true);
  if (!d.subject) e.subject = 'Please add a subject.';
  if (d.message.length < 5) e.message = 'Please tell us how we can help.';
  return e;
}

/* ── Visit request ────────────────────────────────────────── */
export interface VisitData {
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  service: '' | ServiceInterest;
  visitors: string;
  message: string;
}

export function normalizeVisit(i: Record<string, unknown>): VisitData {
  return {
    name: str(i.name, 120),
    phone: str(i.phone, 40),
    email: str(i.email, 254).toLowerCase(),
    preferredDate: str(i.preferredDate, 10),
    preferredTime: pick(i.preferredTime, ['', ...VISIT_TIMES], ''),
    service: pick(i.service, ['', ...INTEREST_KEYS], ''),
    visitors: pick(i.visitors, VISITOR_COUNTS, '1'),
    message: str(i.message, 2000),
  };
}

export function validateVisit(d: VisitData, today = todayISO()): Errors<VisitData> {
  const e: Errors<VisitData> = checkPerson(d, true);
  if (!d.preferredDate) e.preferredDate = 'Please choose a date.';
  else if (!DATE_RE.test(d.preferredDate) || Number.isNaN(Date.parse(d.preferredDate))) e.preferredDate = 'Please choose a valid date.';
  else if (d.preferredDate < today) e.preferredDate = 'Please choose today or a future date.';
  else {
    const max = new Date(Date.parse(today) + 180 * 86_400_000).toISOString().slice(0, 10);
    if (d.preferredDate > max) e.preferredDate = 'Please choose a date within the next six months.';
  }
  if (!d.preferredTime) e.preferredTime = 'Please choose a time.';
  if (!d.service) e.service = 'Please select a service.';
  return e;
}

/* ── Job application ──────────────────────────────────────── */
export const RESUME = {
  maxBytes: 3 * 1024 * 1024,
  extensions: ['pdf', 'doc', 'docx'],
  accept: '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export interface ResumeFile {
  name: string;
  size: number;
  /** base64, no data: prefix */
  data: string;
}

export interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  message: string;
  resume: ResumeFile | null;
}

export function normalizeApplication(i: Record<string, unknown>): ApplicationData {
  const r = i.resume as Record<string, unknown> | null | undefined;
  return {
    name: str(i.name, 120),
    email: str(i.email, 254).toLowerCase(),
    phone: str(i.phone, 40),
    position: str(i.position, 120),
    experience: pick(i.experience, ['', ...EXPERIENCE_OPTIONS], ''),
    message: str(i.message, 3000),
    resume:
      r && typeof r.data === 'string' && typeof r.name === 'string'
        ? { name: str(r.name, 150), size: Number(r.size) || 0, data: r.data }
        : null,
  };
}

export function validateResumeMeta(name: string, size: number): string | undefined {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!(RESUME.extensions as readonly string[]).includes(ext)) return 'Please upload a PDF or Word document (.pdf, .doc, .docx).';
  if (size > RESUME.maxBytes) return 'Please upload a file smaller than 3 MB.';
  return undefined;
}

export function validateApplication(d: ApplicationData): Errors<ApplicationData> {
  const e: Errors<ApplicationData> = checkPerson(d, true);
  if (!d.position) e.position = 'Please tell us the position you are applying for.';
  if (!d.experience) e.experience = 'Please select your experience level.';
  if (!d.resume) e.resume = 'Please upload your resume (PDF, DOC or DOCX).';
  else {
    const err = validateResumeMeta(d.resume.name, d.resume.size);
    if (err) e.resume = err;
  }
  return e;
}
