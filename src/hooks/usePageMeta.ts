import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { notFoundMeta, routeMeta } from '../data/routes';
import { site } from '../data/site';

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

/**
 * Keeps <title>, description, canonical and Open Graph tags in sync during
 * client-side navigation. The same values are baked into each page's static
 * HTML at build time (scripts/prerender.mjs).
 */
export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/$/, '') || '/';
    const meta = routeMeta[path] ?? notFoundMeta;
    const url = `${site.url}${path === '/' ? '/' : path}`;
    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', url);
  }, [pathname]);
}
