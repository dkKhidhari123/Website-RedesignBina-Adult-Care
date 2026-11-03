import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResponsiveImage } from './ResponsiveImage';
import type { GalleryPhoto } from '../data/gallery';

interface Props {
  photos: GalleryPhoto[];
  index: number | null;
  onChange: (index: number | null) => void;
}

/**
 * Full-screen photo viewer built on the native <dialog> element
 * (focus trapping, Escape to close and inert background come for free).
 * Arrow keys and swipe move between photos.
 */
export function Lightbox({ photos, index, onChange }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const count = photos.length;

  const go = (step: number) => index !== null && onChange((index + step + count) % count);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    document.body.style.overflow = '';
    onChange(null);
    returnFocus.current?.focus();
  };

  const photo = index !== null ? photos[index] : null;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Photo viewer"
      onClose={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      // Clicking the dark area around the photo closes the viewer.
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-navy/95 p-0 text-white backdrop:bg-navy/80"
    >
      {photo && index !== null && (
        <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm text-white/70" aria-live="polite">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10"
              aria-label="Close photo viewer"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <figure
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 sm:px-20"
            onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
          >
            <ResponsiveImage
              key={photo.image}
              name={photo.image}
              alt={photo.alt}
              sizes="(min-width: 640px) 90vw, 100vw"
              priority
              className="max-h-full w-auto max-w-full rounded-lg object-contain"
              style={{ maxHeight: 'calc(100dvh - 9rem)' }}
            />
            <figcaption className="mt-4 text-center text-[0.9375rem] text-white/80">{photo.alt}</figcaption>
          </figure>

          <div className="flex justify-center gap-3 py-4 sm:pointer-events-none sm:absolute sm:inset-x-4 sm:top-1/2 sm:-translate-y-1/2 sm:justify-between sm:py-0">
            <button
              type="button"
              onClick={() => go(-1)}
              className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
