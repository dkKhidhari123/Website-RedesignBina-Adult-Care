/**
 * Content managed in the admin dashboard.
 *
 * Each section is stored as one JSON document in the Supabase `site_content` table.
 * At build time scripts/fetch-content.mjs writes the published documents to
 * src/data/cms.json, and the site's data files use them in place of their defaults.
 *
 * The sanitizers below run on the server for every save, so the dashboard can never
 * store malformed or oversized content. Dependency-free on purpose (used by /api).
 */

export interface Settings {
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  instagram: string;
  facebook: string;
  linkedin: string;
}

export interface TeamItem {
  name: string;
  role: string;
  extra: string;
  email: string;
  message: string;
}

export interface TestimonialItem {
  quote: string;
  attribution: string;
  relationship: string;
  rating: number; // 0 = no rating shown
}

export interface VacancyItem {
  title: string;
  description: string;
  type: string;
  location: string;
}

export interface GalleryItem {
  /** Image name in the optimized set (local photos) or `cms-<id>` for uploads. */
  image: string;
  /** Public URL of an uploaded photo (empty for photos that ship with the site). */
  url: string;
  alt: string;
  category: 'outdoor' | 'living' | 'rooms' | 'dining';
  hidden: boolean;
}

export interface ServicesContent {
  residential: string[];
  home: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CmsContent {
  settings?: Settings;
  team?: TeamItem[];
  testimonials?: TestimonialItem[];
  vacancies?: VacancyItem[];
  gallery?: GalleryItem[];
  services?: ServicesContent;
  faqs?: FaqItem[];
}

export type CmsKey = keyof CmsContent;
export const CMS_KEYS: CmsKey[] = ['settings', 'team', 'testimonials', 'vacancies', 'gallery', 'services', 'faqs'];

export const GALLERY_CATEGORY_KEYS = ['outdoor', 'living', 'rooms', 'dining'] as const;

/* ── Sanitizers ────────────────────────────────────────────── */

export class ContentError extends Error {}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

function text(v: unknown, max: number, label: string, required = false): string {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length > max) throw new ContentError(`${label} is too long (max ${max} characters).`);
  if (required && !s) throw new ContentError(`${label} is required.`);
  return s;
}

function url(v: unknown, label: string): string {
  const s = text(v, 300, label);
  // https only — plus http://localhost so the dashboard can be tested locally.
  if (s && !/^(https:\/\/|http:\/\/localhost(:\d+)?\/)[^\s]+$/i.test(s)) throw new ContentError(`${label} must be a full https:// link.`);
  return s;
}

function list<T>(v: unknown, max: number, label: string, item: (x: Obj, i: number) => T): T[] {
  if (!Array.isArray(v)) throw new ContentError(`${label} must be a list.`);
  if (v.length > max) throw new ContentError(`${label} can have at most ${max} items.`);
  return v.map((x, i) => {
    if (!isObj(x)) throw new ContentError(`${label} item ${i + 1} is invalid.`);
    return item(x, i);
  });
}

const sanitizers: { [K in CmsKey]-?: (v: unknown) => NonNullable<CmsContent[K]> } = {
  settings(v) {
    if (!isObj(v)) throw new ContentError('Business information is invalid.');
    const phone = text(v.phone, 30, 'Phone', true);
    if (phone.replace(/\D/g, '').length < 10) throw new ContentError('Phone must include the area code.');
    const email = text(v.email, 254, 'Email', true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new ContentError('Email is not a valid address.');
    return {
      phone,
      email: email.toLowerCase(),
      street: text(v.street, 120, 'Street', true),
      city: text(v.city, 60, 'City', true),
      state: text(v.state, 30, 'State', true),
      zip: text(v.zip, 12, 'ZIP code', true),
      hours: text(v.hours, 80, 'Hours', true),
      instagram: url(v.instagram, 'Instagram'),
      facebook: url(v.facebook, 'Facebook'),
      linkedin: url(v.linkedin, 'LinkedIn'),
    };
  },
  team: (v) =>
    list(v, 30, 'Team', (x, i) => ({
      name: text(x.name, 80, `Team member ${i + 1} name`, true),
      role: text(x.role, 80, `Team member ${i + 1} role`, true),
      extra: text(x.extra, 80, 'Credential'),
      email: text(x.email, 254, 'Email').toLowerCase(),
      message: text(x.message, 400, 'Message'),
    })),
  testimonials: (v) =>
    list(v, 30, 'Testimonials', (x, i) => {
      const rating = Math.round(Number(x.rating) || 0);
      return {
        quote: text(x.quote, 600, `Testimonial ${i + 1} quote`, true),
        attribution: text(x.attribution, 80, `Testimonial ${i + 1} name`, true),
        relationship: text(x.relationship, 80, 'Relationship'),
        rating: Math.min(5, Math.max(0, rating)),
      };
    }),
  vacancies: (v) =>
    list(v, 30, 'Vacancies', (x, i) => ({
      title: text(x.title, 100, `Vacancy ${i + 1} title`, true),
      description: text(x.description, 600, 'Description'),
      type: text(x.type, 40, 'Type'),
      location: text(x.location, 80, 'Location'),
    })),
  gallery: (v) =>
    list(v, 200, 'Gallery', (x, i) => {
      const image = text(x.image, 80, `Photo ${i + 1}`, true);
      if (!/^[a-z0-9-]+$/.test(image)) throw new ContentError(`Photo ${i + 1} has an invalid name.`);
      const category = GALLERY_CATEGORY_KEYS.includes(x.category as never) ? (x.category as GalleryItem['category']) : 'living';
      return {
        image,
        url: url(x.url, `Photo ${i + 1} link`),
        alt: text(x.alt, 160, `Photo ${i + 1} description`, true),
        category,
        hidden: x.hidden === true,
      };
    }),
  services(v) {
    if (!isObj(v)) throw new ContentError('Services are invalid.');
    const points = (arr: unknown, label: string) => {
      if (!Array.isArray(arr) || arr.length > 30) throw new ContentError(`${label} must be a list of at most 30 items.`);
      return arr.map((p, i) => text(p, 160, `${label} item ${i + 1}`, true));
    };
    return { residential: points(v.residential, 'Residential Care'), home: points(v.home, 'Home Care') };
  },
  faqs: (v) =>
    list(v, 30, 'FAQs', (x, i) => ({
      q: text(x.q, 200, `Question ${i + 1}`, true),
      a: text(x.a, 1200, `Answer ${i + 1}`, true),
    })),
};

export function sanitizeContent<K extends CmsKey>(key: K, value: unknown): NonNullable<CmsContent[K]> {
  return sanitizers[key](value) as NonNullable<CmsContent[K]>;
}

/** "510 710 4392" → "tel:+15107104392" */
export function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return `tel:+${digits.length === 10 ? '1' + digits : digits}`;
}
