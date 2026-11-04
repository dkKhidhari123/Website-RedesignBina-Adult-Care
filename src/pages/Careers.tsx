import { useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeader } from '../components/SectionHeader';
import { CtaBand } from '../components/CtaBand';
import { ApplicationForm, type ApplicationFormHandle } from '../components/forms/ApplicationForm';
import { CAREER_PERKS, GENERAL_APPLICATION, vacancies } from '../data/content';

export default function Careers() {
  const form = useRef<ApplicationFormHandle>(null);
  const apply = (position: string) => {
    form.current?.choosePosition(position);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <PageHero
        label="Careers"
        title="Build a Career with Compassion"
        image={{
          name: 'careers-hero',
          alt: 'A smiling caregiver sharing a laugh with a senior woman',
          natural: true,
        }}
        actions={<a href="#opportunities" className="btn-primary">Explore Opportunities</a>}
      >
        <p>Join our caring team and make a meaningful difference in the lives of seniors and their families.</p>
      </PageHero>

      <section className="section bg-white">
        <div className="container max-w-[1000px]">
          <SectionHeader title="Why Work With Us?" className="mb-12">
            <p>A workplace built on care for residents and for each other.</p>
          </SectionHeader>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_PERKS.map((p, i) => (
              <li key={p} className="reveal flex items-center gap-3.5 card-soft p-5 font-medium" style={{ transitionDelay: `${i * 60}ms` }}>
                <CheckCircle2 className="h-[22px] w-[22px] shrink-0 text-brand-700" strokeWidth={2} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="opportunities" className="section">
        <div className="container max-w-[1000px]">
          <SectionHeader title="Career Opportunities" className="mb-10">
            <p>Current vacancies appear here as soon as they are confirmed.</p>
          </SectionHeader>
          {vacancies.length === 0 ? (
            <div className="card reveal mx-auto max-w-[640px] p-10 text-center">
              <h3 className="t-title">No Current Openings</h3>
              <p className="mt-3 text-slate-muted">
                Submit your resume for future opportunities. We keep applications in mind as positions become available.
              </p>
              <button type="button" onClick={() => apply(GENERAL_APPLICATION)} className="btn-primary mt-7">
                Submit Your Resume
              </button>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {vacancies.map((j) => (
                <li key={j.title} className="card reveal flex flex-col p-7">
                  <h3 className="t-title">{j.title}</h3>
                  <p className="t-small mt-2">{j.description}</p>
                  <p className="mt-3 text-[0.8125rem] font-medium text-brand-700">{j.type} · {j.location}</p>
                  <div className="mt-auto pt-6">
                    <button type="button" onClick={() => apply(j.title)} className="btn-primary btn-sm">Apply Now</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="apply" className="section bg-white">
        <div className="container max-w-[760px]">
          <div className="card p-6 shadow-lift sm:p-10">
            <ApplicationForm ref={form} />
          </div>
        </div>
      </section>

      <CtaBand title="Your Next Opportunity Starts Here." text="Become part of a team that believes in compassionate senior care.">
        <a href="#apply" className="btn-accent">Apply Now</a>
      </CtaBand>
    </>
  );
}
