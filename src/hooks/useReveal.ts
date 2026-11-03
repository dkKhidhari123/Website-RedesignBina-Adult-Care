import { useEffect } from 'react';

/**
 * Fades `.reveal` elements in as they scroll into view.
 * - Progressive enhancement: without JS, or with reduced motion, content is simply visible.
 * - Elements already on screen when the page loads are shown immediately (no flash).
 * - A MutationObserver picks up elements from pages rendered after navigation.
 */
export function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const observeAll = () =>
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));

    // Mark what is already visible before enabling the hidden state.
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
    });
    document.documentElement.classList.add('js-reveal');
    observeAll();

    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
