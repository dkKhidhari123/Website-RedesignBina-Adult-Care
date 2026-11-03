/**
 * What the live website currently shows, in dashboard format. Used as the
 * starting point for any section that has never been saved in the dashboard.
 */
import type { CmsContent, CmsKey } from '../lib/cms';
import cmsJson from '../data/cms.json';
import { site } from '../data/site';
import { serviceFaqs, serviceTabs, team, testimonials, vacancies } from '../data/content';
import { defaultGallery } from '../data/gallery';

const cms = cmsJson as CmsContent;

export const currentContent: { [K in CmsKey]-?: NonNullable<CmsContent[K]> } = {
  settings: {
    phone: site.phone.display,
    email: site.email,
    street: site.address.street,
    city: site.address.city,
    state: site.address.state,
    zip: site.address.zip,
    hours: site.hours,
    instagram: site.social.instagram?.url ?? '',
    facebook: site.social.facebook?.url ?? '',
    linkedin: site.social.linkedin?.url ?? '',
  },
  team: team.map((m) => ({ name: m.name, role: m.role, extra: m.extra ?? '', email: m.email ?? '', message: m.message ?? '' })),
  testimonials: testimonials.map((t) => ({ quote: t.quote, attribution: t.attribution, relationship: t.relationship ?? '', rating: t.rating ?? 0 })),
  vacancies: vacancies.map((v) => ({ ...v })),
  gallery: cms.gallery ?? defaultGallery.map((g) => ({ image: g.image, url: '', alt: g.alt, category: g.category, hidden: false })),
  services: {
    residential: serviceTabs.find((t) => t.care === 'residential')?.points ?? [],
    home: serviceTabs.find((t) => t.care === 'home')?.points ?? [],
  },
  faqs: serviceFaqs.map((f) => ({ ...f })),
};
