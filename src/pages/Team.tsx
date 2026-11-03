import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { SectionHeader } from '../components/SectionHeader';
import { CtaBand } from '../components/CtaBand';
import { bookVisitHref } from '../data/site';
import { team } from '../data/content';

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('');

export default function Team() {
  return (
    <>
      <PageHero
        label="Our Team"
        title="Meet Our Caring Team"
        image={{
          name: 'team-hero',
          alt: 'Illustration of a caring team sitting with a smiling senior woman in a bright living room',
          natural: true,
        }}
      >
        <p>
          Our dedicated professionals bring expertise, compassion, and commitment to every interaction. Get to know the
          team that makes Bina Adult Care special.
        </p>
      </PageHero>

      <section className="section bg-white">
        <div className="container max-w-[1000px]">
          <SectionHeader title="The People Behind Your Loved One’s Care" className="mb-12" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <li key={m.name} className="card reveal flex flex-col items-center p-8 text-center" style={{ transitionDelay: `${i * 80}ms` }}>
                {m.photo ? (
                  <div className="mb-5 h-24 w-24 overflow-hidden rounded-full">
                    <ResponsiveImage name={m.photo} alt={`Portrait of ${m.name}`} sizes="96px" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div aria-hidden className="mb-5 grid h-24 w-24 place-items-center rounded-full bg-brand-50 font-display text-[1.75rem] text-brand-700">
                    {initials(m.name)}
                  </div>
                )}
                <h3 className="t-title">{m.name}</h3>
                <p className="mt-1 font-medium text-brand-700">{m.role}</p>
                {m.extra && <p className="mt-0.5 text-[0.875rem] text-slate-muted">{m.extra}</p>}
                {m.message && (
                  <blockquote className="mt-5 border-t border-line pt-5 text-[0.9375rem] italic leading-relaxed text-slate-muted">
                    “{m.message}”
                  </blockquote>
                )}
                {m.bio && <p className="t-small mt-3">{m.bio}</p>}
                {m.email && (
                  <a href={`mailto:${m.email}`} className="btn-secondary btn-sm mt-6 font-sans font-medium" aria-label={`Email ${m.name}`}>
                    <Mail className="h-4 w-4" aria-hidden /> Email
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-[760px] text-center">
          <span aria-hidden className="mx-auto mb-6 block h-[3px] w-12 rounded-full bg-champagne" />
          <h2 className="t-section reveal">Care Comes from the Heart</h2>
          <p className="reveal mt-5 text-[1.0625rem] text-slate-muted">
            Every member of our team shares the same purpose: to make each resident feel respected, comfortable and cared
            for. We work together, communicate openly and listen closely, so that the support we give is personal to the
            individual.
          </p>
          <p className="reveal mt-4 text-[1.0625rem] text-slate-muted">
            Families are part of that care. We welcome your questions, and we are always glad to hear from you.
          </p>
        </div>
      </section>

      <CtaBand title="We’re Here to Help Your Family." text="Have questions about our care services? Our team would be happy to connect with you.">
        <Link to="/contact" className="btn-accent">Contact Our Team</Link>
        <Link to={bookVisitHref} className="btn-outline-light">Book a Visit</Link>
      </CtaBand>
    </>
  );
}
