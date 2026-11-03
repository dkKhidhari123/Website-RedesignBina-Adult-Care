import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { bookVisitHref, nav, site } from '../data/site';

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // Mobile menu: Escape closes and returns focus; closes when resized to desktop.
  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('a')?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"
      >
        Skip to main content
      </a>

      {/* Top bar */}
      <div className="bg-brand-600 text-[0.75rem] text-white">
        <div className="container flex flex-wrap gap-x-6 gap-y-1.5 py-2">
          <a href={site.phone.href} className="inline-flex items-center gap-1.5 text-white hover:text-brand-50">
            <Phone className="h-3.5 w-3.5" aria-hidden /> {site.phone.display}
          </a>
          <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 text-white hover:text-brand-50">
            <Mail className="h-3.5 w-3.5" aria-hidden /> {site.email}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_theme(colors.line.DEFAULT),0_10px_24px_-20px_rgba(38,62,82,0.35)]">
        <div className="container flex items-center justify-between gap-6 py-3">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-7 text-[0.875rem] font-medium lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 py-1 transition-colors ${
                    isActive ? 'border-brand-400 text-brand-600' : 'border-transparent text-navy hover:text-brand-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to={bookVisitHref} className="btn-primary btn-sm whitespace-nowrap">
              Book a Visit
            </Link>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-0.5 w-[22px] bg-navy transition-transform duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`h-0.5 w-[22px] bg-navy transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-[22px] bg-navy transition-transform duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile menu — slides open; `invisible` keeps it out of tab order when closed */}
        <div
          id="mobile-menu"
          ref={panelRef}
          className={`grid overflow-hidden border-t border-line bg-white transition-[grid-template-rows,visibility] duration-300 ease-gentle lg:hidden ${
            open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr] border-transparent'
          }`}
        >
          <nav aria-label="Mobile" className="container min-h-0">
            <div className="flex flex-col pb-5 pt-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `border-b border-line/70 py-3 ${isActive ? 'text-brand-600' : 'text-navy'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to={bookVisitHref} className="btn-primary mt-3.5 w-full">
                Book a Visit
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
