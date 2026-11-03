import type { ImgHTMLAttributes } from 'react';
import manifest from '../data/image-manifest.json';

export type ImageName = keyof typeof manifest;

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> {
  name: ImageName;
  alt: string;
  /** Layout hint for the browser, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes?: string;
  /** Above-the-fold images: load eagerly with high priority (LCP). */
  priority?: boolean;
}

/**
 * Serves pre-optimised WebP variants from /public/images (see scripts/optimize-images.mjs)
 * with srcset/sizes, intrinsic dimensions (no layout shift) and native lazy loading.
 */
export function ResponsiveImage({ name, alt, sizes = '100vw', priority = false, className, ...rest }: Props) {
  const { width, height, widths } = manifest[name];
  const srcSet = widths.map((w) => `/images/${name}-${w}.webp ${w}w`).join(', ');
  const fallback = `/images/${name}-${widths[Math.min(1, widths.length - 1)]}.webp`;

  return (
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // React 18 warns on camelCase fetchPriority; the lowercase attribute is passed through.
      {...(priority ? { fetchpriority: 'high' } : {})}
      className={className}
      {...rest}
    />
  );
}
