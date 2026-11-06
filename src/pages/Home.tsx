import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Carousel } from '../components/Carousel';
import type { ImageName } from '../components/ResponsiveImage';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { PhotoMarquee } from '../components/PhotoMarquee';
import { SectionHeader } from '../components/SectionHeader';
import { CtaBand } from '../components/CtaBand';
import { bookVisitHref, site } from '../data/site';
import { heroSlides, homeIntro, testimonials, whyChoose } from '../data/content';

const p = (image: ImageName, alt: string) => ({ image, alt });
const aboutPhotos: Parameters<typeof PhotoMarquee>[0]['columns'] = [
  [
    p('gallery-0870', 'Bedroom with sliding doors and an armchair'),
    p('gallery-0879', 'Dining table beside sliding glass doors'),
    p('gallery-0859', 'Front entrance with an accessible ramp'),
    p('gallery-0880', 'Kitchen with breakfast bar and stools'),
    p('gallery-0858', 'Arched front porch and garden'),
    p('gallery-0889', 'Lounge with a cream sofa'),
  ],
  [
    p('gallery-0887', 'Living room with sofas, rug and fireplace'),
    p('gallery-0892', 'Sitting area with armchairs facing a garden window'),
    p('gallery-0876', 'Bright resident bedroom'),
    p('gallery-0866', 'Quiet sitting corner with two armchairs'),
    p('gallery-0869', 'Spacious bedroom with mirrored closet doors'),
    p('gallery-0888', 'Covered front porch with arched opening'),
  ],
];

const values = [
  { title: 'Dignity', text: 'Every person is treated with honor in every interaction.' },
  { title: 'Independence', text: 'We support what each person can do, and encourage it.' },
  { title: 'Respect', text: 'Choices, history and preferences always come first.' },
  { title: 'Quality of Life', text: 'Meaningful days, comfort and connection.' },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section id="home" className="py-16 sm:py-20">
        <div className="container grid items-center gap-14 lg:grid-cols-2">
          <div>
            {homeIntro.badge && <span className="pill-label mb-6">{homeIntro.badge}</span>}
            <h1 className="t-display">{homeIntro.headline}</h1>
            <p className="mt-5 max-w-[520px] text-[1.0625rem] text-slate-muted">{homeIntro.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={bookVisitHref} className="btn-primary">Book a Visit</Link>
              <Link to="/services" className="btn-secondary">Explore Our Services</Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-2 text-[0.8125rem] text-slate-muted">
              <li className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-700" strokeWidth={3} aria-hidden /> Licensed &amp; Certified
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-700" strokeWidth={3} aria-hidden /> 24/7 Support
              </li>
            </ul>
          </div>
          <Carousel
            slides={heroSlides}
            label="Photos of the Bina Adult Care home"
            sizes="(min-width: 1200px) 576px, (min-width: 1024px) 48vw, 100vw"
            aspect="aspect-square"
            interval={5000}
            showCaptions={false}
            priority
          />
        </div>
      </section>

      {/* ── Why choose ───────────────────────────────────── */}
      <section id="why" className="section">
        <div className="container">
          <SectionHeader title="Why Choose Bina Adult Care" className="mb-12">
            <p>Personalized attention, a comfortable environment and family-focused support.</p>
          </SectionHeader>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((w, i) => (
              <li key={w.title} className="card reveal p-7" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="mb-[18px] grid h-10 w-10 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">
                  {i + 1}
                </span>
                <h3 className="t-subtitle mb-2">{w.title}</h3>
                <p className="t-small">{w.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <section id="about" className="section bg-white">
        <div className="container grid items-center gap-16 lg:grid-cols-2">
          <div className="reveal">
            <span className="pill-label mb-5">About Bina Adult Care</span>
            <h2 className="t-section mb-5 text-[clamp(1.75rem,1.2rem+1.8vw,2.375rem)]">Providing Care to Senior Adults</h2>
            <p className="mb-4 text-slate-muted">
              At Bina Adult Care, we understand that choosing care for your loved one is one of the most important
              decisions you’ll make. Our mission is to provide compassionate, respectful and personalized care that
              honors the dignity and independence of every senior adult we serve.
            </p>
            <p className="mb-7 text-slate-muted">
              Our team works to create a warm, supportive environment where seniors can thrive, and families can feel at
              ease.
            </p>
            <Link to="/contact" className="btn-primary">
              Get in Touch <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="reveal">
            <PhotoMarquee columns={aboutPhotos} label="Photos of rooms in the Bina Adult Care home" />
          </div>
        </div>
      </section>

      {/* ── Services teaser ──────────────────────────────── */}
      <section id="services" className="section">
        <div className="container max-w-[1000px] text-center">
          <SectionHeader title="Our Care Services" className="mb-12">
            <p>Two care options designed to meet the unique needs of every senior and their family.</p>
          </SectionHeader>
          <Link to="/services" className="btn-primary reveal">
            View Our Services <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── Care philosophy ──────────────────────────────── */}
      <section id="philosophy" className="section bg-white">
        <div className="container">
          <SectionHeader title="Our Care Philosophy" className="mb-12">
            <p>Every day should be lived with dignity, and on one’s own terms.</p>
          </SectionHeader>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <li key={v.title} className="reveal card-soft p-7" style={{ transitionDelay: `${i * 70}ms` }}>
                <h3 className="t-subtitle mb-2 text-[1.125rem]">{v.title}</h3>
                <p className="t-small">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Visit CTA ────────────────────────────────────── */}
      <CtaBand
        title="Schedule a visit to Bina Adult Care"
        text="Meet our team, see our care environment and ask any question about Residential Care or Home Care."
      >
        <Link to={bookVisitHref} className="btn-accent">Book a Visit</Link>
        <a href={site.phone.href} className="btn-outline-light">Call Us Now</a>
      </CtaBand>

      {/* ── Testimonials ─────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="section bg-white">
          <div className="container max-w-[760px]">
            <SectionHeader title="What Families Say" className="mb-10">
              <p>Hear from the families who trust us with their care.</p>
            </SectionHeader>
            <div className="reveal">
              <TestimonialCarousel items={testimonials} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
