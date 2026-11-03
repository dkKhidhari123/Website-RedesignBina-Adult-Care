import type { ReactNode } from 'react';
import { ResponsiveImage, type ImageName } from './ResponsiveImage';

interface Props {
  label?: string;
  title: ReactNode;
  children?: ReactNode;
  /** `natural`: show the whole image at its own proportions instead of cropping to 4:3. */
  image?: { name: ImageName; alt: string; natural?: boolean };
  actions?: ReactNode;
}

/**
 * Inner-page introduction. With an image: two columns (text + photo).
 * Without: a centered heading band.
 */
export function PageHero({ label, title, children, image, actions }: Props) {
  if (!image) {
    return (
      <section className="bg-white py-16 sm:py-20">
        <div className="container text-center">
          {label && <span className="pill-label mb-5">{label}</span>}
          <h1 className="t-page">{title}</h1>
          {children && <div className="t-lead mx-auto mt-4 max-w-[600px]">{children}</div>}
          {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 sm:py-20">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <div>
          {label && <span className="pill-label mb-6">{label}</span>}
          <h1 className="t-page">{title}</h1>
          {children && <div className="t-lead mt-5 max-w-[540px] space-y-4">{children}</div>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className={`media shadow-lift ${image.natural ? '' : 'aspect-[4/3]'}`}>
          <ResponsiveImage
            name={image.name}
            alt={image.alt}
            sizes="(min-width: 1200px) 576px, (min-width: 1024px) 48vw, 100vw"
            priority
            className={image.natural ? 'block h-auto w-full' : 'h-full w-full object-cover'}
          />
        </div>
      </div>
    </section>
  );
}
