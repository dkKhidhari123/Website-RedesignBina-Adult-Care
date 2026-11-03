/**
 * Pulls content published from the admin dashboard into the build.
 *
 *   node scripts/fetch-content.mjs
 *
 * - Reads every section from the Supabase `site_content` table → src/data/cms.json
 * - Downloads gallery photos uploaded in the dashboard → src-images/cms-*.{jpg,png,webp}
 *   (scripts/optimize-images.mjs then builds their responsive versions)
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (set in Vercel). Without them the
 * existing src/data/cms.json is kept, so local builds work offline.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'data', 'cms.json');
const IMAGES = path.join(ROOT, 'src-images');

const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log('fetch-content: Supabase not configured — using existing src/data/cms.json');
  process.exit(0);
}

const r = await fetch(`${url}/rest/v1/site_content?select=key,value`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!r.ok) {
  console.error(`fetch-content: could not read site_content (${r.status}) — keeping existing content`);
  process.exit(0);
}

const rows = await r.json();
const content = Object.fromEntries(rows.filter((x) => x.key !== 'meta').map((x) => [x.key, x.value]));

for (const item of content.gallery ?? []) {
  if (!item.url || !/^cms-[a-z0-9-]+$/.test(item.image)) continue;
  const ext = (item.url.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const file = path.join(IMAGES, `${item.image}.${ext}`);
  try {
    await fs.access(file);
    continue; // already downloaded
  } catch {}
  const img = await fetch(item.url);
  if (!img.ok) {
    console.warn(`fetch-content: could not download ${item.url} (${img.status}) — skipping`);
    continue;
  }
  await fs.writeFile(file, Buffer.from(await img.arrayBuffer()));
  console.log(`✓ downloaded ${item.image}.${ext}`);
}

await fs.writeFile(OUT, JSON.stringify(content, null, 2) + '\n');
console.log(`fetch-content: wrote ${Object.keys(content).length} section(s) to src/data/cms.json`);
