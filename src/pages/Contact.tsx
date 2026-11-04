import { Link } from 'react-router-dom';
import { Clock, ContactRound, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CtaBand } from '../components/CtaBand';
import { ContactForm } from '../components/forms/ContactForm';
import { bookVisitHref, businessCardHref, fullAddress, mapsEmbed, mapsLink, site } from '../data/site';

export function ContactDetails({ withHours = true }: { withHours?: boolean }) {
  const rows = [
    { Icon: Phone, label: 'Phone', value: site.phone.display, href: site.phone.href },
    { Icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
    ...(withHours ? [{ Icon: Clock, label: 'Hours', value: 'Open 24/7' }] : []),
    { Icon: MapPin, label: 'Address', value: `${fullAddress}, USA`, href: mapsLink, external: true },
  ];
  return (
    <ul className="space-y-5">
      {rows.map(({ Icon, label, value, href, external }) => (
        <li key={label} className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50">
            <Icon className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-slate-muted">{label}</p>
            {href ? (
              <a
                href={href}
                className="break-words font-medium text-navy hover:text-brand-700"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {value}
              </a>
            ) : (
              <span className="font-medium text-navy">{value}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Contact() {
  return (
    <>
      <PageHero title="We’re Here to Help">
        <p>Have questions about senior care? Our friendly team is here to help you find the right care for your loved ones.</p>
      </PageHero>

      <section className="section">
        <div className="container grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div id="message" className="card p-6 shadow-lift sm:p-10">
            <ContactForm />
          </div>
          <aside className="card p-8 sm:p-10">
            <h2 className="t-title text-[1.5rem]">Contact Information</h2>
            <p className="mb-7 mt-1.5 text-[0.9375rem] text-slate-muted">We’re available 24/7 to answer your questions and provide support.</p>
            <ContactDetails />
            <Link to={businessCardHref} className="btn-secondary mt-8 w-full">
              <ContactRound className="h-[18px] w-[18px]" aria-hidden />
              View Our Business Card
            </Link>
          </aside>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <h2 className="t-section reveal mb-8 text-center">Our Location</h2>
          <div className="media reveal border border-line">
            <iframe
              title={`Map showing Bina Adult Care at ${fullAddress}`}
              src={mapsEmbed}
              className="block h-[380px] w-full sm:h-[440px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-5 text-center">
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-link">
              Open in Google Maps <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <CtaBand title="Let’s Start a Conversation." text={<>For urgent matters, call us anytime at <a href={site.phone.href} className="font-semibold text-white underline underline-offset-4">{site.phone.display}</a>.</>}>
        <Link to={bookVisitHref} className="btn-accent">Book a Visit</Link>
      </CtaBand>
    </>
  );
}
