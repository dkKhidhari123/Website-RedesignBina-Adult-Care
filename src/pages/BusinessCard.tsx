import { ExternalLink, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { mapsLink, site, vistaprintCardUrl } from '../data/site';

const owner = { name: 'Manoj Gadal', title: 'Owner / Director' };

const licenses = [
  { label: 'HCO License', value: '074700219' },
  { label: 'RCFE Facility No.', value: '079201568' },
];

/** "510 710 4392" → "(510) 710-4392" */
function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : phone;
}

/**
 * Digital business card (/digital-business-card; /card redirects here) — front and back of the printed card, side by side
 * on desktop and stacked on phones. Contact details come from src/data/site.ts.
 */
export default function BusinessCard() {
  const web = site.url.replace(/^https?:\/\//, '');
  const rows = [
    { Icon: Phone, label: 'Phone', value: formatPhone(site.phone.display), href: site.phone.href },
    { Icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
    {
      Icon: MapPin,
      label: 'Address',
      value: (
        <>
          {site.address.street}
          <br />
          {site.address.city}, {site.address.state} {site.address.zip}
        </>
      ),
      href: mapsLink,
      external: true,
    },
    { Icon: Globe, label: 'Web', value: web, href: site.url, external: true },
  ];

  return (
    <section className="section bg-cream">
      <div className="container">
        <header className="section-head">
          <h1 className="t-page">Digital Business Card</h1>
          <span className="gold-rule" aria-hidden />
        </header>

        <div className="mx-auto grid max-w-[1040px] gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Front */}
          <article
            aria-label="Business card front"
            className="rounded-panel border border-line bg-[#FBFAF6] p-3 shadow-lift sm:p-4"
          >
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-card border border-brand-200 px-6 py-10 text-center sm:min-h-[340px]">
              <span className="grid h-[88px] w-[88px] place-items-center rounded-full bg-brand-50 ring-1 ring-brand-200">
                <img src="/binalogo.png" alt="" width={68} height={70} className="h-[70px] w-[68px] object-contain" />
              </span>
              <h2 className="mt-5 font-display text-[2rem] leading-tight text-navy sm:text-[2.25rem]">{site.name}</h2>
              <p className="mt-1 font-script text-[1.25rem] text-brand-600">Compassionate Senior Care</p>
              <span className="my-5 block h-px w-40 bg-brand-200" aria-hidden />
              <p className="text-[1.25rem] font-semibold text-navy">{owner.name}</p>
              <p className="mt-0.5 text-[0.9375rem] text-slate">{owner.title}</p>
            </div>
          </article>

          {/* Back */}
          <article aria-label="Business card back" className="rounded-panel bg-navy p-3 shadow-lift sm:p-4">
            <div className="flex h-full min-h-[300px] flex-col rounded-card border border-brand-200/60 px-6 py-8 sm:min-h-[340px] sm:px-9">
              <h2 className="inline-block self-start border-b-2 border-champagne pb-2 font-sans text-[0.875rem] font-semibold uppercase tracking-[0.14em] text-brand-200">
                Get in Touch
              </h2>

              <dl className="mt-6 space-y-4">
                {rows.map(({ Icon, label, value, href, external }) => (
                  <div key={label} className="flex items-start gap-3.5">
                    <Icon className="mt-[3px] h-[18px] w-[18px] shrink-0 text-brand-200" aria-hidden />
                    <dt className="sr-only">{label}</dt>
                    <dd className="min-w-0">
                      <a
                        href={href}
                        className="break-words text-[1.0625rem] text-white underline-offset-4 hover:text-champagne hover:underline"
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto pt-7">
                <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-white/15 pt-4 text-[0.8125rem] text-brand-200">
                  {licenses.map(({ label, value }) => (
                    <div key={label} className="flex gap-1.5">
                      <dt>{label}:</dt>
                      <dd className="font-semibold tracking-[0.04em] text-white/90">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-10 text-center">
          <a href={vistaprintCardUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            View on VistaPrint <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
