/**
 * Builds responsive, compressed WebP variants of every image in /src-images.
 *
 *   npm run images
 *
 * Output:
 *   public/images/<name>-<width>.webp   (widths below, never upscaled)
 *   src/data/image-manifest.json        (intrinsic size + available widths per image,
 *                                         used by <ResponsiveImage> to prevent layout shift)
 *   public/og-image.jpg                 (1200x630 social sharing image)
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src-images');
const OUT = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'image-manifest.json');
const WIDTHS = [480, 800, 1200, 1600];
const OG_SOURCE = 'home-entrance';

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

const files = (await fs.readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const manifest = {};

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '');
  const input = path.join(SRC, file);
  const { width, height } = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w < width);
  widths.push(Math.min(width, WIDTHS.at(-1)));

  const srcTime = (await fs.stat(input)).mtimeMs;
  for (const w of [...new Set(widths)]) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    // Skip variants that are already up to date (keeps builds fast).
    const existing = await fs.stat(out).catch(() => null);
    if (existing && existing.mtimeMs >= srcTime) continue;
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 })
      .toFile(out);
  }
  manifest[name] = { width, height, widths: [...new Set(widths)] };
  console.log(`✓ ${name} → ${[...new Set(widths)].join(', ')}`);
}

await sharp(path.join(SRC, files.find((f) => f.startsWith(OG_SOURCE))))
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(ROOT, 'public', 'og-image.jpg'));

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(manifest).length} images to public/images and src/data/image-manifest.json`);
