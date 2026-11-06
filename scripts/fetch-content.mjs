/**
 * Pulls content published from the admin dashboard into the build.
 *
 *   node scripts/fetch-content.mjs
 *
 * - Reads every section saved in the dashboard (content/*.json in the private Vercel Blob
 *   store) → src/data/cms.json
 * - Copies photos uploaded in the dashboard (uploads/cms-*) that the content uses
 *   → src-images/ (scripts/optimize-images.mjs then builds their responsive versions)
 *
 * Needs BLOB_READ_WRITE_TOKEN (added in Vercel when the Blob store is connected). Without it
 * the existing src/data/cms.json is kept, so local builds work offline and never pick up
 * test edits saved in ./.data by `npm run dev`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, list } from '@vercel/blob';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'data', 'cms.json');
const IMAGES = path.join(ROOT, 'src-images');

async function listFiles(prefix) {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor });
    out.push(...r.blobs.map((b) => b.pathname));
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

async function readFile(pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) throw new Error(`could not read ${pathname}`);
  return Buffer.from(await new Response(r.stream).arrayBuffer());
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.log('fetch-content: Blob store not connected — using existing src/data/cms.json');
  process.exit(0);
}

let content;
try {
  const paths = (await listFiles('content/')).filter((p) => p.endsWith('.json') && p !== 'content/meta.json');
  content = {};
  for (const p of paths) content[p.slice(8, -5)] = JSON.parse((await readFile(p)).toString('utf8')).value;
} catch (err) {
  console.error(`fetch-content: could not read saved content (${err.message}) — keeping existing content`);
  process.exit(0);
}

// Uploaded photos used by the gallery or the homepage slider.
const used = new Set([...(content.gallery ?? []), ...(content.hero ?? [])].map((x) => x.image).filter((i) => /^cms-[a-z0-9-]+$/.test(i)));
if (used.size) {
  const uploads = await listFiles('uploads/');
  for (const image of used) {
    const pathname = uploads.find((p) => p.startsWith(`uploads/${image}.`));
    if (!pathname) {
      console.warn(`fetch-content: uploaded photo ${image} not found — skipping`);
      continue;
    }
    const file = path.join(IMAGES, path.basename(pathname));
    try {
      await fs.access(file);
      continue; // already copied
    } catch {}
    await fs.writeFile(file, await readFile(pathname));
    console.log(`✓ copied ${path.basename(pathname)}`);
  }
}

await fs.writeFile(OUT, JSON.stringify(content, null, 2) + '\n');
console.log(`fetch-content: wrote ${Object.keys(content).length} section(s) to src/data/cms.json`);
