/**
 * Per-page SEO metadata. Used at runtime by usePageMeta() and at build time
 * by scripts/prerender.mjs, which writes it into each page's static HTML.
 */
export interface RouteMeta {
  title: string;
  description: string;
}

export const routeMeta: Record<string, RouteMeta> = {
  '/': {
    title: 'Bina Adult Care | Residential & Home Care for Seniors in El Sobrante, CA',
    description:
      'Compassionate residential and in-home senior care in El Sobrante, California. 24/7 support, personalized care and a warm, home-like environment. Call (510) 710-4392.',
  },
  '/about': {
    title: 'About Us | Bina Adult Care',
    description:
      'Learn about Bina Adult Care in El Sobrante, California — our mission, vision and care philosophy built on dignity, independence and compassion.',
  },
  '/services': {
    title: 'Residential Care & Home Care Services | Bina Adult Care',
    description:
      'Residential care with 24/7 support in a home-like setting, and personalized in-home care with flexible scheduling for senior adults in the El Sobrante area.',
  },
  '/team': {
    title: 'Our Team | Bina Adult Care',
    description:
      'Meet the leadership team at Bina Adult Care, El Sobrante — experienced people dedicated to compassionate, respectful senior care.',
  },
  '/gallery': {
    title: 'Photo Gallery | Our Home in El Sobrante | Bina Adult Care',
    description:
      'Take a look inside the Bina Adult Care residential home in El Sobrante, California — living spaces, bedrooms, dining area and outdoor spaces.',
  },
  '/careers': {
    title: 'Careers | Join Our Care Team | Bina Adult Care',
    description:
      'Join the Bina Adult Care team in El Sobrante, CA. We are looking for caring professionals — nurses, CNAs, caregivers and support staff. Apply online.',
  },
  '/contact': {
    title: 'Contact Us | Bina Adult Care, El Sobrante CA',
    description:
      'Contact Bina Adult Care in El Sobrante, CA. Call (510) 710-4392 or send us a message. Open 24 hours, 7 days a week.',
  },
  '/book-a-visit': {
    title: 'Book a Visit | Tour Our Home | Bina Adult Care',
    description:
      'Request a visit to the Bina Adult Care residential home in El Sobrante, or a consultation about in-home care. We will call you to confirm a time.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Bina Adult Care',
    description: 'How Bina Adult Care collects, uses and protects information submitted through this website.',
  },
  '/terms': {
    title: 'Terms & Conditions | Bina Adult Care',
    description: 'Terms and conditions for using the Bina Adult Care website.',
  },
  '/card': {
    title: 'Manoj Gadal, Owner / Director | Bina Adult Care',
    description:
      'Virtual business card for Bina Adult Care, El Sobrante, CA. Call (510) 710-4392 or email binasadultcare@gmail.com.',
  },
};

export const notFoundMeta: RouteMeta = {
  title: 'Page not found | Bina Adult Care',
  description: 'The page you were looking for could not be found.',
};
