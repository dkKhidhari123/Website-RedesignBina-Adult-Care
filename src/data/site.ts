import cmsJson from './cms.json';
import { phoneHref, type CmsContent } from '../lib/cms';

const cms = cmsJson as CmsContent;
const cfg = cms.settings;

/**
 * Business information. Defaults are the verified details from the previous
 * binaadultcare.com; once "Business info" is published from the admin dashboard,
 * those values are used instead (src/data/cms.json, written at build time).
 */
const instagramUrl = cfg ? cfg.instagram : 'https://www.instagram.com/binasadultcare';

export const site = {
  name: 'Bina Adult Care',
  url: 'https://www.binaadultcare.com',
  description:
    'Compassionate residential and in-home care for senior adults in El Sobrante, California — with dignity, respect and support 24 hours a day.',
  phone: {
    display: cfg?.phone ?? '510 710 4392',
    href: phoneHref(cfg?.phone ?? '510 710 4392'),
  },
  email: cfg?.email ?? 'binasadultcare@gmail.com',
  address: {
    street: cfg?.street ?? '5667 San Pablo Dam Rd',
    city: cfg?.city ?? 'El Sobrante',
    state: cfg?.state ?? 'CA',
    zip: cfg?.zip ?? '94803',
    country: 'US',
  },
  hours: cfg?.hours ?? 'Open 24 hours, 7 days a week',
  hoursShort: 'Open 24/7',
  social: {
    instagram: instagramUrl
      ? { url: instagramUrl, handle: '@' + instagramUrl.replace(/\/+$/, '').split('/').pop() }
      : null,
    facebook: cfg?.facebook ? { url: cfg.facebook } : null,
    linkedin: cfg?.linkedin ? { url: cfg.linkedin } : null,
  },
};

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

export const nav = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/team', label: 'Our Team' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact' },
];

export const bookVisitHref = '/book-a-visit';
