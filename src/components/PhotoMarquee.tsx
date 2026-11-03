import { ResponsiveImage, type ImageName } from './ResponsiveImage';

interface Photo {
  image: ImageName;
  alt: string;
}

/**
 * Two columns of photos rolling continuously in opposite directions, with soft
 * faded top and bottom edges. Pauses on hover; still for reduced-motion visitors.
 */
export function PhotoMarquee({ columns, label }: { columns: [Photo[], Photo[]]; label: string }) {
  return (
    <div className="rounded-panel bg-white p-3 shadow-lift sm:p-4">
      <div
        role="group"
        aria-label={label}
        className="group/marquee grid h-[440px] grid-cols-2 gap-3 overflow-hidden sm:h-[520px] sm:gap-4 [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
      >
        {columns.map((photos, col) => (
          <div key={col} className="overflow-hidden">
            <ul
              className={`marquee-track flex flex-col gap-3 group-hover/marquee:[animation-play-state:paused] sm:gap-4 ${
                col === 0 ? 'animate-marquee-up' : 'animate-marquee-down'
              }`}
            >
              {/* Rendered twice so the loop is seamless; the copy is hidden from screen readers. */}
              {[...photos, ...photos].map((p, i) => (
                <li key={`${p.image}-${i}`} aria-hidden={i >= photos.length || undefined}>
                  <ResponsiveImage
                    name={p.image}
                    alt={i >= photos.length ? '' : p.alt}
                    sizes="(min-width: 1024px) 270px, 45vw"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
