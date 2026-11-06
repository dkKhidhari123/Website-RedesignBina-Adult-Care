import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  Home,
  Image,
  Inbox as InboxIcon,
  LayoutGrid,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Rocket,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Type,
  Users,
  X,
} from 'lucide-react';
import { useAdmin } from './session';
import { useContent } from './content';
import { formatDate } from './api';
import { site } from '../data/site';

type Icon = typeof Mail;
type NavItem = { to: string; label: string; Icon: Icon };
type NavGroup = { label: string; Icon: Icon; items: NavItem[] };

const NAV: (NavItem | NavGroup)[] = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutGrid },
  {
    label: 'Inbox',
    Icon: InboxIcon,
    items: [
      { to: '/admin/messages', label: 'Messages', Icon: Mail },
      { to: '/admin/visits', label: 'Visit Requests', Icon: CalendarCheck },
      { to: '/admin/applications', label: 'Applications', Icon: FileText },
    ],
  },
  {
    label: 'Content',
    Icon: FileText,
    items: [
      { to: '/admin/content/home', label: 'Homepage Headline', Icon: Type },
      { to: '/admin/content/hero', label: 'Hero Images', Icon: Sparkles },
      { to: '/admin/content/gallery', label: 'Gallery', Icon: Image },
      { to: '/admin/content/services', label: 'Services', Icon: ListChecks },
      { to: '/admin/content/why', label: 'Why Choose Us', Icon: Star },
      { to: '/admin/content/testimonials', label: 'Testimonials', Icon: MessageSquare },
      { to: '/admin/content/faqs', label: 'FAQs', Icon: HelpCircle },
    ],
  },
  { label: 'People', Icon: Users, items: [{ to: '/admin/content/team', label: 'Team Members', Icon: Users }] },
  { to: '/admin/content/location', label: 'Locations', Icon: MapPin },
  { to: '/admin/content/vacancies', label: 'Job Positions', Icon: Briefcase },
  { to: '/admin/content/settings', label: 'Settings', Icon: SettingsIcon },
];

const isGroup = (x: NavItem | NavGroup): x is NavGroup => 'items' in x;

const linkClass = (active: boolean, collapsed: boolean) =>
  `flex items-center gap-3 rounded-xl text-[0.9375rem] font-medium transition-colors ${collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'} ${
    active ? 'bg-brand-600 text-white shadow-[0_6px_16px_-8px_rgba(82,125,150,0.8)]' : 'text-navy hover:bg-brand-50'
  }`;

function Item({ to, label, Icon, collapsed, sub, onNavigate }: NavItem & { collapsed: boolean; sub?: boolean; onNavigate: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `${linkClass(isActive, collapsed)} ${sub && !collapsed ? 'py-2.5 text-[0.90625rem]' : ''}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span className={collapsed ? 'sr-only' : ''}>{label}</span>
    </NavLink>
  );
}

function Group({ group, collapsed, onNavigate }: { group: NavGroup; collapsed: boolean; onNavigate: () => void }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const active = group.items.some((i) => pathname.startsWith(i.to));
  if (collapsed)
    return (
      <>
        {group.items.map((i) => <Item key={i.to} {...i} collapsed onNavigate={onNavigate} />)}
      </>
    );
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[0.9375rem] font-medium hover:bg-brand-50 ${active ? 'text-brand-700' : 'text-navy'}`}
      >
        <group.Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
        {group.label}
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <ul className="ml-[1.6rem] mt-1 space-y-1 border-l border-line pl-3">
          {group.items.map((i) => (
            <li key={i.to}><Item {...i} sub collapsed={false} onNavigate={onNavigate} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sidebar({ collapsed, onToggle, onNavigate, mobile }: { collapsed: boolean; onToggle?: () => void; onNavigate: () => void; mobile?: boolean }) {
  const { username, signOut } = useAdmin();
  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 border-b border-line bg-cream/60 py-5 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Link to="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-3" aria-label="Bina Admin — dashboard">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
            <Home className="h-5 w-5" aria-hidden />
          </span>
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <strong className="block truncate text-[1.0625rem] text-navy">Bina Admin</strong>
              <span className="text-[0.8125rem] text-slate">Content Management</span>
            </span>
          )}
        </Link>
        {onToggle && !collapsed && (
          <button type="button" onClick={onToggle} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate hover:bg-white" aria-label="Collapse sidebar">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {onToggle && collapsed && (
        <button type="button" onClick={onToggle} className="mx-auto mt-3 grid h-8 w-8 place-items-center rounded-lg text-slate hover:bg-cream" aria-label="Expand sidebar">
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <nav aria-label="Admin" className={`flex-1 space-y-1 overflow-y-auto py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
        {NAV.map((x) => (isGroup(x) ? <Group key={x.label} group={x} collapsed={collapsed} onNavigate={onNavigate} /> : <Item key={x.to} {...x} collapsed={collapsed} onNavigate={onNavigate} />))}
      </nav>

      <div className={`space-y-3 border-t border-line p-4 ${mobile ? 'pb-8' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold uppercase text-brand-700 ring-1 ring-brand-200">
              {username.slice(0, 1) || 'A'}
            </span>
            <span className="min-w-0 leading-tight">
              <strong className="block truncate text-[0.9375rem] text-navy">Administrator</strong>
              <span className="block truncate text-[0.8125rem] text-slate">{site.email}</span>
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={signOut}
          title={collapsed ? 'Sign out' : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[0.9375rem] font-medium text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden /> <span className={collapsed ? 'sr-only' : ''}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

/** Title row used at the top of every admin page: heading on the left, View Site + Publish on the right. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[2.25rem] leading-tight text-brand-600 sm:text-[2.75rem]">{title}</h1>
        {subtitle && <div className="mt-2 max-w-2xl text-[1.0625rem] text-slate">{subtitle}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-white px-4 text-[0.9375rem] font-medium text-navy shadow-soft hover:bg-cream">
          <Eye className="h-4 w-4" aria-hidden /> View Site
        </a>
        <PublishButton />
      </div>
    </div>
  );
}

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
      setMsg({ ok: true, text: 'Publishing started — live in 1–2 minutes.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const status = msg?.text ?? (meta.lastPublishedAt ? `Last published ${formatDate(meta.lastPublishedAt)}` : hasUnpublished ? 'Unpublished changes' : '');
  return (
    <div className="relative">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-[0.9375rem] font-semibold transition-colors disabled:opacity-60 ${
          hasUnpublished ? 'bg-champagne text-navy hover:bg-champagne-600' : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />} Publish website
        {hasUnpublished && !busy && <span className="h-2 w-2 rounded-full bg-amber-600" aria-label="Unpublished changes" />}
      </button>
      {status && (
        <p role="status" className={`absolute right-0 top-full mt-1 whitespace-nowrap text-[0.75rem] ${msg && !msg.ok ? 'text-red-800' : msg ? 'text-emerald-800' : 'text-slate'}`}>
          {status}
        </p>
      )}
    </div>
  );
}

const COLLAPSE_KEY = 'bina-admin-sidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {}
    // Editors' fixed save bar lines up with the sidebar.
    document.documentElement.style.setProperty('--admin-sidebar', collapsed ? '84px' : '288px');
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar (desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-white transition-[width] duration-200 lg:block ${collapsed ? 'w-[84px]' : 'w-[288px]'}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} onNavigate={() => {}} />
      </aside>

      {/* Top bar + drawer (mobile) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-navy hover:bg-cream" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><Home className="h-4 w-4" aria-hidden /></span>
        <strong className="text-navy">Bina Admin</strong>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-navy/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-[300px] bg-white shadow-lift">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-5 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate hover:bg-cream" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <Sidebar collapsed={false} mobile onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main id="main" key={pathname} className={`px-4 py-8 transition-[padding] duration-200 sm:px-8 lg:py-10 ${collapsed ? 'lg:pl-[calc(84px+2.5rem)]' : 'lg:pl-[calc(288px+2.5rem)]'} lg:pr-10`}>
        {children}
      </main>
    </div>
  );
}
