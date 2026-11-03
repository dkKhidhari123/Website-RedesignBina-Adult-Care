import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { usePageMeta } from '../hooks/usePageMeta';
import { useReveal } from '../hooks/useReveal';

export function Layout() {
  const { pathname, hash } = useLocation();
  usePageMeta();
  useReveal();

  // Scroll to top on page change, or to an in-page anchor when one is given.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let timer = 0;
    const deadline = Date.now() + 2000;
    const tryScroll = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView();
      else if (Date.now() < deadline) timer = window.setTimeout(tryScroll, 50);
    };
    tryScroll();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
