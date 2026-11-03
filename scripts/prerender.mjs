/**
 * Pre-renders every route to static HTML after `vite build`, so search engines
 * and social previews get full content and correct meta tags without running
 * JavaScript. The React app then hydrates in the browser.
 *
 *   dist/index.html, dist/about.html, … dist/404.html
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SERVER = path.join(ROOT, 'dist-server');

const { render, routeMeta, notFoundMeta, site } = await import(pathToFileURL(path.join(SERVER, 'entry-server.js')).href);
const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function page(url, meta, { notFound = false } = {}) {
  const canonical = `${site.url}${url === '/' ? '/' : url}`;
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${render(url)}</div>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escape(meta.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(meta.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escape(meta.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`);
  if (notFound) {
    html = html
      .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
      .replace(/\s*<link rel="canonical"[^>]*>/, '');
  }
  return html;
}

for (const [url, meta] of Object.entries(routeMeta)) {
  const file = url === '/' ? 'index.html' : `${url.slice(1)}.html`;
  await fs.writeFile(path.join(DIST, file), page(url, meta));
  console.log(`✓ ${url.padEnd(16)} → dist/${file}`);
}
await fs.writeFile(path.join(DIST, '404.html'), page('/404', notFoundMeta, { notFound: true }));
console.log('✓ 404              → dist/404.html');

// Admin dashboard shell: rendered in the browser only (after sign-in), never indexed.
await fs.writeFile(
  path.join(DIST, 'admin.html'),
  template
    .replace(/<title>[\s\S]*?<\/title>/, '<title>Admin | Bina Adult Care</title>')
    .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, nofollow" />')
    .replace(/\s*<link rel="canonical"[^>]*>/, ''),
);
console.log('✓ /admin           → dist/admin.html (client-only)');

await fs.rm(SERVER, { recursive: true, force: true });
