import type { ImageName } from '../components/ResponsiveImage';
import cmsJson from './cms.json';
import type { CmsContent } from '../lib/cms';

// Content published from the admin dashboard (written at build time); empty until first publish.
const cms = cmsJson as CmsContent;
const opt = (s: string) => s || undefined;
export { EXPERIENCE_OPTIONS, VISIT_TIMES, VISITOR_COUNTS } from './options';

/* ── Team ──────────────────────────────────────────────────────
   Leadership from the previous site. Add `photo` (an image name from
   src-images/) or `bio` once available and they will appear on /team. */
export interface TeamMember {
  name: string;
  role: string;
  extra?: string;
  email?: string;
  /** Short personal message shown on /team. Have each person approve their own words. */
  message?: string;
  bio?: string;
  photo?: ImageName;
}

const defaultTeam: TeamMember[] = [
  {
    name: 'Manoj Gadal',
    role: 'Administrator',
    email: 'manojgadal29@gmail.com',
    message:
      'Choosing care for someone you love is a big decision. My door is always open — I’m here to answer your questions and make sure every family feels heard and supported.',
  },
  {
    name: 'Suraj Gurung',
    role: 'Facility Manager',
    extra: 'Head CNA',
    email: 'surajgrg1284@gmail.com',
    message:
      'Our goal every day is simple: help each resident feel safe, comfortable and cared for. I take pride in the small details that make our house feel like home.',
  },
  {
    name: 'Bina Bishwokarma',
    role: 'House Manager',
    email: 'binakarma534@gmail.com',
    message:
      'I want every resident to feel they truly belong here. A warm meal, a clean room and a friendly face — these everyday moments mean everything.',
  },
];

export const team: TeamMember[] = cms.team
  ? cms.team.map((m) => ({ name: m.name, role: m.role, extra: opt(m.extra), email: opt(m.email), message: opt(m.message) }))
  : defaultTeam;

/* ── Testimonials ──────────────────────────────────────────────
   From the previous site, as shown in the approved design. Only publish
   testimonials that are genuine and approved by the person quoted —
   remove any that are not. With an empty list the section is hidden. */
export interface Testimonial {
  quote: string;
  attribution: string;
  relationship?: string;
  /** Only if the person actually gave a rating. */
  rating?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: 'Bina Adult Care has been a blessing for our family. The staff treats my mother with such love and respect.',
    attribution: 'Rajesh Sharma',
    relationship: 'Family Member',
    rating: 5,
  },
  {
    quote: 'The compassionate care and attention to detail is outstanding. I feel safe, valued, and part of a warm community.',
    attribution: 'Sita Devi',
    relationship: 'Resident',
    rating: 5,
  },
  {
    quote: 'Professional, caring, and always going above and beyond. They have exceeded all our expectations.',
    attribution: 'Prakash Thapa',
    relationship: 'Family Member',
    rating: 5,
  },
];

export const testimonials: Testimonial[] = cms.testimonials
  ? cms.testimonials.map((t) => ({ quote: t.quote, attribution: t.attribution, relationship: opt(t.relationship), rating: t.rating || undefined }))
  : defaultTestimonials;

/* ── Careers ───────────────────────────────────────────────────
   Add confirmed vacancies here; while empty, /careers shows "No Current Openings". */
export interface Vacancy {
  title: string;
  description: string;
  type: string; // e.g. "Full-time"
  location: string;
}
export const vacancies: Vacancy[] = cms.vacancies ?? [];

export const GENERAL_APPLICATION = 'General application: future opportunities';
export const POSITION_SUGGESTIONS = [
  GENERAL_APPLICATION,
  'Caregiver',
  'Certified Nursing Assistant (CNA)',
  'Home Care Assistant',
];



export const CAREER_PERKS = [
  'Meaningful and rewarding work',
  'Supportive team environment',
  'Opportunities for professional growth',
  'Making a positive difference in people’s lives',
  'Compassionate workplace culture',
];


/* ── Homepage hero slider: real photos of the home ─────────── */
const defaultHeroSlides: { image: ImageName; alt: string; caption?: string }[] = [
  { image: 'home-entrance', alt: 'Front entrance of the Bina Adult Care home with an accessible ramp' },
  { image: 'living-room', alt: 'Bright living room with sofas, rug and fireplace' },
  { image: 'dining-room', alt: 'Dining table beside sliding glass doors to the garden' },
  { image: 'sitting-area', alt: 'Sitting area with armchairs facing a garden window' },
  { image: 'bedroom', alt: 'Furnished bedroom with natural light' },
  { image: 'gallery-0869', alt: 'Spacious bedroom with mirrored closet doors' },
  { image: 'home-exterior', alt: 'Exterior of the home with arched porch and garden' },
];
export const heroSlides = cms.hero
  ? cms.hero.filter((h) => !h.hidden).map((h) => ({ image: h.image as ImageName, alt: h.alt }))
  : defaultHeroSlides;
export const defaultHeroImages = defaultHeroSlides.map((h) => ({ image: h.image as string, alt: h.alt, hidden: false }));

/* ── Homepage headline and "Why Choose" reasons ─────────────── */
export const homeIntro = cms.home ?? {
  badge: 'Trusted Senior Care',
  headline: 'Compassionate Care. Comfortable Living. Peace of Mind.',
  intro:
    'Personalized Residential Care and Home Care for senior adults, with dignity, respect and compassion. Available 24/7 in El Sobrante, California.',
};

export const whyChoose = cms.why ?? [
  { title: 'Personalized Attention', text: 'Care shaped around each person, not a standard routine.' },
  { title: 'Comfortable Environment', text: 'A calm, homelike setting that feels safe and familiar.' },
  { title: 'Compassionate Caregivers', text: 'Every resident receives attention with dignity and respect.' },
  { title: 'Family-Focused Support', text: 'Open communication so families stay informed and involved.' },
];

/* ── Services ──────────────────────────────────────────────────
   Lists follow the approved design. These items from the design are held back
   until confirmed, because they describe clinical services:
     Residential: "24/7 nursing care and medical supervision" (shown as "24/7 care and supervision"),
                  "Physical therapy and rehabilitation services", "Emergency response systems"
     Home care:   "Health monitoring and reporting", "Alzheimer's and dementia care",
                  "Post-surgery recovery support", "Chronic condition management"
   To publish any of them, add it back to the list below. */
export interface ServiceTab {
  id: 'residential' | 'home-care';
  label: string;
  intro: string;
  listTitle: string;
  points: string[];
  infoTitle: string;
  info: string;
  pricing: string;
  cta1: string;
  cta2: string;
  care: 'residential' | 'home';
}

const defaultServiceTabs: ServiceTab[] = [
  {
    id: 'residential',
    label: 'Residential Care',
    care: 'residential',
    intro:
      'Our residential home provides a safe, comfortable and engaging environment where seniors can enjoy their golden years with dignity and independence.',
    listTitle: 'What We Offer:',
    points: [
      'Private and semi-private accommodation',
      '24/7 care and supervision',
      'Nutritious meals tailored to dietary needs',
      'Daily activities and recreational programs',
      'Medication management',
      'Personal care assistance (bathing, dressing, grooming)',
      'Housekeeping and laundry services',
      'Social events and community engagement',
      'Family visitation areas',
      'Beautiful gardens and common spaces',
    ],
    infoTitle: 'Eligibility & Admission:',
    info: 'Our residential care is suitable for seniors who need assistance with daily activities. We meet with each family to make sure we can meet their loved one’s individual needs.',
    pricing: 'Contact us for detailed pricing information based on accommodation type and care level required.',
    cta1: 'Schedule a Tour',
    cta2: 'Ask Questions',
  },
  {
    id: 'home-care',
    label: 'Home Care',
    care: 'home',
    intro:
      'Professional care delivered in the comfort and familiarity of your loved one’s own home. We create personalized care plans that respect independence while ensuring safety and wellbeing.',
    listTitle: 'Our Home Care Services Include:',
    points: [
      'Personal care (bathing, grooming, dressing)',
      'Companionship and emotional support',
      'Meal preparation and nutrition support',
      'Medication reminders',
      'Light housekeeping and laundry',
      'Transportation to appointments',
      'Mobility assistance',
      'Respite care for family caregivers',
    ],
    infoTitle: 'Flexible Care Plans:',
    info: 'We offer flexible scheduling from a few hours per week to 24/7 live-in care. Our caregivers are carefully matched to each client’s personality and needs.',
    pricing: 'Rates vary based on care hours and services required. Contact us for a personalized quote.',
    cta1: 'Request Consultation',
    cta2: 'Learn More',
  },
];

export const serviceTabs: ServiceTab[] = defaultServiceTabs.map((t) => ({
  ...t,
  points: cms.services ? (t.care === 'residential' ? cms.services.residential : cms.services.home) : t.points,
}));

export const serviceCompare = [
  {
    title: 'Residential Care',
    sub: 'A supportive place to live',
    items: [
      'May suit seniors who would benefit from daily assistance in a shared, welcoming home',
      'Offers companionship and social interaction',
      'Gives families peace of mind through a safe setting',
    ],
  },
  {
    title: 'Home Care',
    sub: 'Support where they already live',
    items: [
      'May suit seniors who prefer to remain in their own home',
      'Flexible arrangements built around individual needs',
      'Keeps family close, with regular communication',
    ],
  },
];

export const serviceValues = [
  { title: 'Compassion & Respect', text: 'Kindness in every interaction, every day.' },
  { title: 'Individual Attention', text: 'Care shaped around the person, not a routine.' },
  { title: 'Comfortable Environment', text: 'A calm, homelike setting that feels familiar.' },
  { title: 'Family-Focused', text: 'Families are informed, heard and involved.' },
  { title: 'Senior Dignity', text: 'A steady commitment to independence and honor.' },
];

export const careSteps = [
  { title: 'Understand Your Needs', text: 'We listen to you and your loved one to learn about needs, routines and preferences.' },
  { title: 'Discuss Care Options', text: 'We walk through Residential Care and Home Care and answer your questions.' },
  { title: 'Plan Personalized Support', text: 'Together we shape support that fits your loved one.' },
  { title: 'Begin Your Care Journey', text: 'Our team welcomes your loved one and stays in touch with your family.' },
];

export interface Faq {
  q: string;
  a: string;
}

const defaultFaqs: Faq[] = [
  {
    q: 'What is Residential Care?',
    a: 'Residential Care provides a comfortable, safe and welcoming living environment with personalized daily assistance, meals, and opportunities for social interaction.',
  },
  {
    q: 'What is Home Care?',
    a: 'Home Care brings personalized support to your loved one at home, including help with daily living, companionship and emotional support, arranged around their individual needs.',
  },
  {
    q: 'How do I choose between Residential Care and Home Care?',
    a: 'It depends on your loved one’s needs, routines and preferences. Contact our team and we will talk through the options with you and your family.',
  },
  {
    q: 'How can I schedule a visit?',
    a: 'Use the Book a Visit button, call us at 510 710 4392, or email binasadultcare@gmail.com, and our team will arrange a time with you.',
  },
  {
    q: 'What does care cost?',
    a: 'Please contact us for details. We are happy to discuss your situation and answer your questions directly.',
  },
  {
    q: 'How can I contact your team?',
    a: 'You can call 510 710 4392, email binasadultcare@gmail.com, or visit us at 5667 San Pablo Dam Rd, El Sobrante, CA 94803.',
  },
];

export const serviceFaqs: Faq[] = cms.faqs ?? defaultFaqs;
