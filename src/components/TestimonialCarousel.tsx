import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import type { Testimonial } from '../data/content';

/** One testimonial at a time, crossfading every 6 seconds; pauses on hover or focus. */
export function TestimonialCarousel({ items, interval = 6000 }: { items: Testimonial[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => !document.hidden && setIndex((i) => (i + 1) % items.length), interval);
    return () => window.clearInterval(id);
  }, [paused, items.length, interval]);

  return (
    <div
      aria-roledescription="carousel"
      aria-label="What families say"
      className="relative rounded-panel border border-line bg-white px-6 py-10 text-center shadow-soft sm:px-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Quote className="mx-auto h-8 w-8 fill-brand-200 text-brand-200" strokeWidth={1} aria-hidden />
      <div className="relative mt-6 grid" aria-live={paused ? 'polite' : 'off'}>
        {items.map((t, i) => (
          <figure
            key={t.quote}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <blockquote className="text-[1.03rem] leading-relaxed text-navy">{t.quote}</blockquote>
            {t.rating && (
              <p className="mt-4 flex justify-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-champagne-600 text-champagne-600" aria-hidden />
                ))}
              </p>
            )}
            <figcaption className="mt-3 text-[0.875rem]">
              <span className="block font-semibold text-navy">{t.attribution}</span>
              {t.relationship && <span className="text-[0.8125rem] text-slate">{t.relationship}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-1">
          {items.map((t, i) => (
            <button
              key={t.quote}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === index}
              className="grid h-6 place-items-center px-1"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-brand-400' : 'w-1.5 bg-brand-200'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
