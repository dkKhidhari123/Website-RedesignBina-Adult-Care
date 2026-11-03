import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeader } from '../components/SectionHeader';
import { VisitForm } from '../components/forms/VisitForm';
import { ContactDetails } from './Contact';

const reasons = [
  'Explore our residential care environment',
  'Meet our dedicated team',
  'Learn about our care services',
  'Discuss your loved one’s individual needs',
  'Get answers to your questions',
];

const steps = [
  { t: 'Submit Your Visit Request', d: 'Tell us your preferred date and time using the form.' },
  { t: 'Our Team Contacts You', d: 'We will reach out to discuss your request and answer questions.' },
  { t: 'Confirm Your Visit', d: 'Once we agree on a time, your visit is confirmed.' },
];

export default function BookVisit() {
  return (
    <>
      <PageHero label="Book a Visit" title="Schedule a Visit to Bina Adult Care">
        <p>Meet our team, see our care environment and ask any question about Residential Care or Home Care.</p>
      </PageHero>

      <section className="section">
        <div className="container grid items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="t-section">Why Schedule a Visit?</h2>
            <p className="mt-3 text-slate-muted">Seeing a place in person helps families feel confident about the next step.</p>
            <ul className="mt-7 space-y-3.5">
              {reasons.map((r) => (
                <li key={r} className="flex items-center gap-3 font-medium">
                  <CheckCircle2 className="h-[22px] w-[22px] shrink-0 text-brand-700" strokeWidth={2} aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
            <div className="card mt-9 p-7">
              <ContactDetails withHours={false} />
            </div>
          </div>
          <div id="request" className="card p-6 shadow-lift sm:p-10">
            <VisitForm />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionHeader title="What Happens Next?" className="mb-12" />
          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.t} className="reveal border-t-2 border-champagne pt-5" style={{ transitionDelay: `${i * 70}ms` }}>
                <p className="text-[0.8125rem] font-semibold text-brand-700">Step {i + 1}</p>
                <h3 className="t-subtitle mt-2 text-[1.125rem]">{s.t}</h3>
                <p className="t-small mt-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
