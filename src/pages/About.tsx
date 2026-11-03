import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart, ShieldCheck, Sprout, UserRound } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { SectionHeader } from '../components/SectionHeader';
import { CtaBand } from '../components/CtaBand';
import { team } from '../data/content';
import { bookVisitHref, site } from '../data/site';

const principles = [
  {
    Icon: UserRound,
    title: 'Dignity',
    text: 'We treat every person as an individual with a lifetime of experiences, preferences and opinions — and we listen to them.',
  },
  {
    Icon: Sprout,
    title: 'Independence',
    text: 'We help with what is needed and encourage what residents can still do for themselves, so they keep confidence and choice.',
  },
  {
    Icon: HandHeart,
    title: 'Compassion',
    text: 'Patience, kindness and a gentle presence guide every interaction — from morning routines to late-night reassurance.',
  },
];

const approach = [
  { title: 'We get to know the person', text: 'Their history, routines, likes and dislikes shape how we care for them.' },
  { title: 'We involve the family', text: 'Families are partners. We listen, share updates and agree on decisions together.' },
  { title: 'We adapt as needs change', text: 'Care is reviewed and adjusted so it always fits the person today.' },
];

const commitments = [
  'Round-the-clock supervision and support, 24 hours a day, 7 days a week',
  'A secure, accessible home with ramp access at the entrance',
  'Care tailored to each person’s routines, needs and preferences',
  'Help with daily activities, delivered respectfully and privately',
  'Regular, honest communication with families',
  'Nutritious meals and a clean, comfortable living environment',
];

export default function About() {
  return (
    <>
      <PageHero
        label="About Us"
        title={
          <>
            Caring for seniors the way we would care for <em className="accent">our own family</em>
          </>
        }
        image={{ name: 'home-exterior', alt: 'The Bina Adult Care home in El Sobrante, with its arched porch and garden' }}
      >
        <p>
          Bina Adult Care provides compassionate care to senior adults through residential and home care services —
          with dignity, respect and a genuine sense of home.
        </p>
      </PageHero>

      {/* Introduction */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader label="Who we are" title="A senior care home rooted in community" align="left" />
          </div>
          <div className="reveal space-y-5 text-lg lg:col-span-7 lg:pt-10">
            <p>
              Bina Adult Care is a senior care provider based in <strong>El Sobrante, California</strong>. We offer two
              kinds of support: <strong>residential care</strong> in our own welcoming home, and{' '}
              <strong>home care</strong> for seniors who wish to stay in the place they know best.
            </p>
            <p>
              Whichever path a family chooses, our approach is the same. We take time to understand the person — their
              history, their routines and what makes a good day for them — and build their care around it.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="section bg-white">
        <div className="container grid gap-6 md:grid-cols-2">
          {[
            {
              label: 'Our Mission',
              text: 'To provide compassionate, professional care to senior adults who need support — through residential and home care that protects their dignity, comfort and independence.',
            },
            {
              label: 'Our Vision',
              text: 'A community where every older adult can age safely and with respect, and every family feels confident in the care their loved one receives.',
            },
          ].map((b, i) => (
            <div key={b.label} className="reveal card-soft p-9 sm:p-12" style={{ transitionDelay: `${i * 90}ms` }}>
              <p className="eyebrow">{b.label}</p>
              <p className="mt-6 font-display text-[1.375rem] leading-snug text-navy sm:text-[1.5rem]">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy: dignity & independence */}
      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader label="Our care philosophy" title="Dignity and independence at the heart of everything" align="left" />
            <div className="reveal media mt-10 shadow-lift">
              <ResponsiveImage
                name="sitting-area"
                alt="Sitting area with two armchairs facing a garden window"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <ul className="lg:col-span-7 lg:pt-14">
            {principles.map(({ Icon, title, text }) => (
              <li key={title} className="reveal flex gap-6 border-b border-line py-9 first:pt-0 lg:first:pt-9 lg:first:border-t">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="t-title">{title}</h3>
                  <p className="mt-3 text-lg text-slate-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compassionate approach */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeader label="Our approach" title="How compassionate care works in practice" className="mb-14" />
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {approach.map((step, i) => (
              <li key={step.title} className="reveal border-t-2 border-champagne pt-7" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="font-display text-[2.5rem] italic leading-none text-brand-400">0{i + 1}</span>
                <h3 className="t-subtitle mt-4">{step.title}</h3>
                <p className="t-small mt-2">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team intro */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="reveal media order-2 shadow-lift lg:order-1">
            <ResponsiveImage
              name="dining-room"
              alt="Dining table set beside sliding glass doors to the garden"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeader label="Our team" title="Experienced people you can rely on" align="left">
              <p>
                Our caregivers bring years of hands-on experience in senior care. They are supported by a leadership
                team that is closely involved in daily life at the home and always available to families.
              </p>
            </SectionHeader>
            <ul className="reveal mt-8 divide-y divide-line border-y border-line">
              {team.map((m) => (
                <li key={m.name} className="flex items-baseline justify-between gap-4 py-4">
                  <span className="font-display text-xl text-navy">{m.name}</span>
                  <span className="text-right text-[0.9375rem] text-slate-muted">{m.role}</span>
                </li>
              ))}
            </ul>
            <Link to="/team" className="text-link reveal mt-8">
              Meet our team <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Quality & safety */}
      <section className="section bg-navy text-white">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <p className="eyebrow-plain text-brand-300">Quality &amp; safety</p>
            <h2 className="t-section mt-4 text-white">Our commitment to every resident and family</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Safety and quality are part of every routine. These are the standards we hold ourselves to, every day.
            </p>
            <ShieldCheck className="mt-10 h-14 w-14 text-brand-300" strokeWidth={1.25} aria-hidden />
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {commitments.map((c, i) => (
              <li key={c} className="reveal flex gap-4 border-b border-white/15 py-5 text-white/85" style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-300" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Come and meet us"
        text="The best way to know if we are the right fit is to visit. We would be glad to show you around and answer your questions."
      >
        <Link to={bookVisitHref} className="btn-accent">Book a Visit</Link>
        <a href={site.phone.href} className="btn-outline-light">Call Us Now</a>
      </CtaBand>
    </>
  );
}
