import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  CalendarCheck,
  ExternalLink,
  HelpCircle,
  Images,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Rocket,
  Users,
  X,
} from 'lucide-react';
import { useAdmin } from './session';
import { useContent } from './content';
import { formatDate } from './api';

const NAV: { group: string; items: { to: string; label: string; Icon: typeof Mail }[] }[] = [
  { group: '', items: [{ to: '/admin', label: 'Dashboard', Icon: LayoutDashboard }] },
  {
    group: 'Inbox',
    items: [
      { to: '/admin/messages', label: 'Messages', Icon: Mail },
      { to: '/admin/visits', label: 'Visit requests', Icon: CalendarCheck },
      { to: '/admin/applications', label: 'Applications', Icon: Briefcase },
    ],
  },
  {
    group: 'Website content',
    items: [
      { to: '/admin/content/settings', label: 'Business info', Icon: Building2 },
      { to: '/admin/content/team', label: 'Team', Icon: Users },
      { to: '/admin/content/testimonials', label: 'Testimonials', Icon: MessageSquareQuote },
      { to: '/admin/content/vacancies', label: 'Careers', Icon: Briefcase },
      { to: '/admin/content/gallery', label: 'Gallery', Icon: Images },
      { to: '/admin/content/services', label: 'Services', Icon: ListChecks },
      { to: '/admin/content/faqs', label: 'FAQs', Icon: HelpCircle },
    ],
  },
];

function PublishButton() {
  const { hasUnpublished, publish, meta } = useContent();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function go() {
    if (!window.confirm('Publish your saved changes to the live website? The site will update in about 1–2 minutes.')) return;
    setBusy(true);
    setMsg(null);
    try {
      await publish();
      setMsg({ ok: true, text: 'Publishing started — the website will update in 1–2 minutes.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        {hasUnpublished && (
          <span className="hidden items-center gap-1.5 text-[0.8125rem] font-medium text-amber-800 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden /> Unpublished changes
          </span>
        )}
        <button type="button" onClick={go} disabled={busy} className={`${hasUnpublished ? 'btn-accent' : 'btn-secondary'} btn-sm`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />} Publish website
        </button>
      </div>
      <p role="status" className={`text-[0.75rem] ${msg ? (msg.ok ? 'text-emerald-800' : 'text-red-800') : 'text-slate'}`}>
        {msg?.text ?? (meta.lastPublishedAt ? `Last published ${formatDate(meta.lastPublishedAt)}` : 'Not published from the dashboard yet')}
      </p>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { username, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const nav = (
    <nav aria-label="Admin" className="space-y-6">
      {NAV.map((g) => (
        <div key={g.group || 'main'}>
          {g.group && <p className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/admin'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-navy hover:bg-cream'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden border-r border-line bg-white px-4 py-6 lg:flex lg:flex-col">
        <Link to="/admin" className="mb-8 flex items-center gap-3 px-2">
          <img src="/logo.webp" alt="" width={36} height={37} className="h-9 w-9" />
          <span className="leading-tight">
            <strong className="block text-navy">Bina Adult Care</strong>
            <span className="text-[0.8125rem] text-slate">Admin</span>
          </span>
        </Link>
        {nav}
        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] text-navy hover:bg-cream">
            <ExternalLink className="h-[18px] w-[18px]" aria-hidden /> View website
          </a>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] text-navy hover:bg-cream">
            <LogOut className="h-[18px] w-[18px]" aria-hidden /> Sign out
          </button>
          <p className="truncate px-3 pt-2 text-[0.75rem] text-slate">Signed in as {username}</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-navy hover:bg-cream lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-semibold text-navy lg:hidden">Admin</span>
          <div className="ml-auto">
            <PublishButton />
          </div>
        </header>

        {open && (
          <div className="border-b border-line bg-white px-4 py-5 lg:hidden">
            {nav}
            <button type="button" onClick={signOut} className="mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-navy hover:bg-cream">
              <LogOut className="h-[18px] w-[18px]" aria-hidden /> Sign out ({username})
            </button>
          </div>
        )}

        <main id="main" key={pathname} className="px-4 py-8 sm:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
