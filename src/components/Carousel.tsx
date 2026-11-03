import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ResponsiveImage, type ImageName } from './ResponsiveImage';

export interface Slide {
  image: ImageName;
  alt: string;
  caption?: string;
  label?: string;
}

interface Props {
  slides: Slide[];
  label: string;
  /** Milliseconds between automatic transitions. */
  interval?: number;
  sizes?: string;
  /** Load the first slide eagerly (use for the above-the-fold hero). */
  priority?: boolean;
  /** Tailwind aspect-ratio classes for the frame. */
  aspect?: string;
  showCaptions?: boolean;
  className?: string;
}

/**
 * Accessible crossfading image carousel (WAI-ARIA carousel pattern).
 * - Auto-advances; pauses on hover, keyboard focus, hidden tab, or via the pause button.
 * - No autoplay when the visitor prefers reduced motion.
 * - Arrow buttons, dot pagination, keyboard arrows and touch swipe.
 * - Images load progressively: only the current and next slides are requested.
 */
export function Carousel({
  slides,
  label,
  interval = 5000,
  sizes = '100vw',
  priority = false,
  aspect = 'aspect-[4/3]',
  showCaptions = true,
  className = '',
}: Props) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loaded, setLoaded] = useState(() => new Set([0, 1]));
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const autoplay = !userPaused && !reducedMotion;
  const running = autoplay && !hovered && !focused;

  const go = useCallback(
    (next: number) => {
      const i = (next + count) % count;
      setIndex(i);
      setLoaded((prev) => (prev.has(i) && prev.has((i + 1) % count) ? prev : new Set([...prev, i, (i + 1) % count])));
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!running || count < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) go(index + 1);
    }, interval);
    return () => window.clearInterval(id);
  }, [running, index, interval, count, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`group/carousel relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className={`relative overflow-hidden rounded-media bg-sand shadow-lift ${aspect}`} aria-live={running ? 'off' : 'polite'}>
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.image}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-gentle ${active ? 'z-[1] opacity-100' : 'opacity-0'}`}
            >
              {(loaded.has(i) || i === 0) && (
                <ResponsiveImage
                  name={slide.image}
                  alt={slide.alt}
                  sizes={sizes}
                  priority={priority && i === 0}
                  className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
                    active && !reducedMotion ? 'scale-[1.035]' : 'scale-100'
                  }`}
                />
              )}
              {showCaptions && (slide.caption || slide.label) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 via-navy/25 to-transparent px-5 pb-12 pt-16 sm:px-7">
                  {slide.label && <p className="eyebrow-plain text-brand-100">{slide.label}</p>}
                  {slide.caption && <p className="mt-1 font-display text-lg text-white sm:text-xl">{slide.caption}</p>}
                </div>
              )}
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-[2] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-soft transition hover:bg-white sm:left-4 sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:group-focus-within/carousel:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-[2] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-soft transition hover:bg-white sm:right-4 sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:group-focus-within/carousel:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>

            <div className="absolute inset-x-0 bottom-4 z-[2] flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-navy/35 px-3 py-2 backdrop-blur-sm">
                {slides.map((s, i) => (
                  <button
                    key={s.image}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === index}
                    className="grid h-6 place-items-center px-0.5"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-500 ${
                        i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {!reducedMotion && (
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                  className="grid h-10 w-10 place-items-center rounded-full bg-navy/35 text-white backdrop-blur-sm transition hover:bg-navy/55"
                >
                  {userPaused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
