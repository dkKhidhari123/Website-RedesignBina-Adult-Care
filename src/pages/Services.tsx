import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, CheckCircle2, Heart, Home as HomeIcon, Minus, Plus } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeader } from '../components/SectionHeader';
import { CtaBand } from '../components/CtaBand';
import { bookVisitHref } from '../data/site';
import { careSteps, serviceCompare, serviceFaqs, serviceTabs, serviceValues } from '../data/content';

const icons = { residential: HomeIcon, 'home-care': Heart };

function CareTabs() {
  const { hash } = useLocation();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // /services#home-care and /services#residential open the matching tab.
  useEffect(() => {
    const i = serviceTabs.findIndex((t) => `#${t.id}` === hash);
    if (i >= 0) setTab(i);
  }, [hash]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (tab + (e.key === 'ArrowRight' ? 1 : -1) + serviceTabs.length) % serviceTabs.length;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const cur = serviceTabs[tab];
  const CurIcon = icons[cur.id];

  return (
    <section id="care-tabs" className="pb-24">
      {/* Anchor targets for deep links */}
      {serviceTabs.map((t) => (
        <span key={t.id} id={t.id} className="block -translate-y-24" aria-hidden />
      ))}
      <div className="container max-w-[1000px]">
        <div role="tablist" aria-label="Care services" className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl bg-brand-50 p-1.5 ring-1 ring-line" onKeyDown={onKey}>
          {serviceTabs.map((t, i) => {
            const Icon = icons[t.id];
            const active = i === tab;
            return (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls="care-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(i)}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-3 text-[0.9375rem] font-medium text-navy transition-all ${
                  active ? 'bg-white shadow-[0_1px_4px_rgba(38,62,82,0.12)]' : 'hover:bg-white/50'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden /> {t.label}
              </button>
            );
          })}
        </div>

        <div id="care-panel" role="tabpanel" aria-labelledby={`tab-${cur.id}`} className="card p-6 shadow-lift sm:p-12" key={cur.id}>
          <div className="mx-auto mb-10 max-w-[620px] text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50">
              <CurIcon className="h-7 w-7 text-brand-700" strokeWidth={2} aria-hidden />
            </span>
            <p className="font-medium text-brand-700">{cur.label} Services</p>
            <p className="mt-3 text-[1.0625rem] text-slate-muted">{cur.intro}</p>
          </div>
          <h3 className="t-title mb-5">{cur.listTitle}</h3>
          <ul className="grid gap-x-10 gap-y-3.5 border-b border-line pb-9 sm:grid-cols-2">
            {cur.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[0.9375rem]">
                <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-400" strokeWidth={2} aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-9 rounded-card bg-cream p-6 sm:p-8">
            <h3 className="t-title mb-2">{cur.infoTitle}</h3>
            <p className="text-slate-muted">{cur.info}</p>
            <p className="mt-3 text-slate-muted">
              <strong>Pricing:</strong> {cur.pricing}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`${bookVisitHref}?service=${cur.care}`} className="btn-primary">{cur.cta1}</Link>
              <Link to={`/contact?service=${cur.care}`} className="btn-secondary">{cur.cta2}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqList() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-[800px] space-y-3">
      {serviceFaqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="card overflow-hidden">
            <h3 className="font-sans text-base font-medium">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-navy hover:text-brand-700"
              >
                <span>{f.q}</span>
                {isOpen ? <Minus className="h-4 w-4 shrink-0" aria-hidden /> : <Plus className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={!isOpen} className="border-t border-line px-6 py-5 text-[0.9375rem] text-slate-muted">
              {f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Services() {
  return (
    <>
      <PageHero
        label="Our Services"
        title="Care That Feels Like Home"
        image={{
          name: 'services-hero',
          alt: 'A caregiver supporting a smiling senior woman with her walker in a bright, homely lounge',
          natural: true,
        }}
        actions={<Link to={bookVisitHref} className="btn-primary">Book a Visit</Link>}
      >
        <p>
          At Bina Adult Care, every senior is supported with compassion, respect and personalized attention — whether in
          our residential setting or in the comfort of their own home.
        </p>
      </PageHero>

      <section className="bg-white py-20">
        <div className="container max-w-[760px] text-center">
          <h2 className="t-section reveal">Two ways to receive care, one standard of compassion</h2>
          <p className="reveal mt-5 text-slate-muted">
            Choosing care for a loved one is an important decision. We take time to listen to seniors and their families,
            so the support we recommend fits the person — their needs, routines and preferences.
          </p>
          <p className="reveal mt-3 text-slate-muted">Below, you can compare our two services and see which may suit your loved one best.</p>
          <div className="reveal mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/services#residential" className="btn-primary">Residential Care</Link>
            <Link to="/services#home-care" className="btn-secondary">Home Care</Link>
          </div>
        </div>
      </section>

      <div className="pt-20">
        <CareTabs />
      </div>

      <section className="section bg-white">
        <div className="container max-w-[1000px]">
          <SectionHeader title="Which option may suit your loved one?" className="mb-12">
            <p>Every situation is different. Our team will help you decide together.</p>
          </SectionHeader>
          <div className="grid gap-5 md:grid-cols-2">
            {serviceCompare.map((c) => (
              <div key={c.title} className="card reveal p-8">
                <h3 className="t-title">{c.title}</h3>
                <p className="mb-5 mt-1 text-[0.9375rem] text-brand-700">{c.sub}</p>
                <ul className="space-y-3 text-[0.9375rem]">
                  {c.items.map((i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-brand-700" strokeWidth={3} aria-hidden />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader title="Why Choose Bina Adult Care" className="mb-12">
            <p>The values behind every day of care.</p>
          </SectionHeader>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {serviceValues.map((w, i) => (
              <li key={w.title} className="reveal card-soft p-6" style={{ transitionDelay: `${i * 60}ms` }}>
                <h3 className="t-subtitle mb-2">{w.title}</h3>
                <p className="t-small">{w.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionHeader title="Our Care Approach" className="mb-12">
            <p>A simple, caring path from first conversation to daily support.</p>
          </SectionHeader>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {careSteps.map((s, i) => (
              <li key={s.title} className="reveal border-t-2 border-champagne pt-5" style={{ transitionDelay: `${i * 70}ms` }}>
                <p className="text-[0.8125rem] font-semibold text-brand-700">Step {i + 1}</p>
                <h3 className="t-subtitle mt-2">{s.title}</h3>
                <p className="t-small mt-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container">
          <SectionHeader title="Frequently Asked Questions" className="mb-10" />
          <FaqList />
        </div>
      </section>

      <CtaBand title="Let’s Find the Right Care for Your Loved One." text="Our team is here to answer your questions and help you plan the next step.">
        <Link to={bookVisitHref} className="btn-accent">Book a Visit</Link>
        <Link to="/contact" className="btn-outline-light">Contact Us</Link>
      </CtaBand>
    </>
  );
}
