import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Expand } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { Lightbox } from '../components/Lightbox';
import { CtaBand } from '../components/CtaBand';
import { bookVisitHref } from '../data/site';
import { gallery } from '../data/gallery';

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <PageHero title="Our Facility & Activities">
        <p>Take a look at our warm, welcoming environment and the engaging activities we offer to our residents.</p>
      </PageHero>

      <section className="section">
        <div className="container">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {gallery.map((photo, i) => (
              <li key={photo.image}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="card group relative block aspect-square w-full overflow-hidden"
                  aria-label={`View larger: ${photo.alt}`}
                >
                  <ResponsiveImage
                    name={photo.image}
                    alt=""
                    sizes="(min-width: 1200px) 276px, (min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw"
                    className="h-full w-full object-cover transition-transform duration-700 ease-gentle group-hover:scale-[1.05]"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-navy/0 transition-colors duration-300 group-hover:bg-navy/25">
                    <Expand className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Lightbox photos={gallery} index={active} onChange={setActive} />

      <CtaBand title="See it for yourself." text="Schedule a visit to tour our facility and meet our team.">
        <Link to={bookVisitHref} className="btn-accent">Book a Visit</Link>
        <Link to="/contact" className="btn-outline-light">Contact Us</Link>
      </CtaBand>
    </>
  );
}
