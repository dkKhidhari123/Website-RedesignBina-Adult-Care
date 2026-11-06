import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CheckCircle2, FileText, Image, Loader2, Mail, MapPin, Sparkles, TrendingUp, Users } from 'lucide-react';
import { adminCall, STATUS_STYLES, type InboxTable } from '../api';
import { useContent } from '../content';
import { PageHeader } from '../AdminLayout';

type Rec = Record<string, string>;
interface Data {
  counts: Record<InboxTable, { open: number; total: number }>;
  recent: Record<InboxTable, Rec[]>;
}

/* Soft tints for the stat and action cards, as in the approved admin mock-up. */
const TINTS = {
  purple: { icon: 'bg-purple-50 text-purple-600', card: 'border-purple-200 bg-purple-50/40 hover:border-purple-300' },
  blue: { icon: 'bg-sky-50 text-sky-700', card: 'border-sky-200 bg-sky-50/40 hover:border-sky-300' },
  green: { icon: 'bg-emerald-50 text-emerald-600', card: 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300' },
  orange: { icon: 'bg-orange-50 text-orange-600', card: 'border-orange-200 bg-orange-50/40 hover:border-orange-300' },
};
type Tint = keyof typeof TINTS;

function StatCard({ label, value, total, tint, Icon, to }: { label: string; value: number; total?: number; tint: Tint; Icon: typeof Mail; to: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-line bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.9375rem] font-medium text-slate">{label}</p>
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${TINTS[tint].icon}`}>
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      </div>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-[2.5rem] font-semibold leading-none text-navy">{value}</span>
        {total !== undefined && <span className="text-[0.9375rem] text-slate">/ {total} total</span>}
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-[0.8125rem] font-medium text-emerald-700">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Active now
      </p>
    </Link>
  );
}

const ACTIONS: { to: string; title: string; text: string; tint: Tint; Icon: typeof Mail }[] = [
  { to: '/admin/content/hero', title: 'Manage Hero Images', text: 'Update homepage carousel images', tint: 'purple', Icon: Sparkles },
  { to: '/admin/content/gallery', title: 'Manage Gallery', text: 'Add, edit, or remove gallery images', tint: 'blue', Icon: Image },
  { to: '/admin/content/team', title: 'Manage Team', text: 'Add or update team member information', tint: 'green', Icon: Users },
  { to: '/admin/content/settings', title: 'Site Settings', text: 'Update contact info and site configuration', tint: 'orange', Icon: MapPin },
];

const INBOX_CARDS: { table: InboxTable; label: string; openLabel: string; to: string; Icon: typeof Mail; summary: (r: Rec) => string }[] = [
  { table: 'contact_submissions', label: 'Messages', openLabel: 'new', to: '/admin/messages', Icon: Mail, summary: (r) => r.subject || r.message?.slice(0, 60) },
  { table: 'visit_requests', label: 'Visit Requests', openLabel: 'to confirm', to: '/admin/visits', Icon: CalendarCheck, summary: (r) => `${r.preferred_date} · ${r.preferred_time}` },
  { table: 'job_applications', label: 'Applications', openLabel: 'new', to: '/admin/applications', Icon: FileText, summary: (r) => r.position },
];

const STEPS = [
  { title: 'Check your business details', text: 'Phone, email and social links appear in the header and footer.', to: '/admin/content/settings' },
  { title: 'Review the homepage', text: 'Headline, hero images and the “Why Choose Us” reasons.', to: '/admin/content/home' },
  { title: 'Keep the gallery and team up to date', text: 'Upload new photos and describe each one.', to: '/admin/content/gallery' },
  { title: 'Publish', text: 'Saved changes go live when you press “Publish website” (about 1–2 minutes).', to: '' },
];

export function Dashboard() {
  const { get } = useContent();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCall<Data>('dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  const hero = get('hero');
  const gallery = get('gallery');

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here’s what’s happening with your website." />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Hero Images" value={hero.filter((h) => !h.hidden).length} total={hero.length} tint="purple" Icon={Sparkles} to="/admin/content/hero" />
        <StatCard label="Gallery Images" value={gallery.filter((g) => !g.hidden).length} tint="blue" Icon={Image} to="/admin/content/gallery" />
        <StatCard label="Team Members" value={get('team').length} tint="green" Icon={Users} to="/admin/content/team" />
        <StatCard label="Services" value={2} tint="orange" Icon={FileText} to="/admin/content/services" />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <h2 className="bg-cream/70 px-6 py-5 font-sans text-[1.375rem] font-semibold text-navy sm:px-8">Quick Actions</h2>
        <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
          {ACTIONS.map(({ to, title, text, tint, Icon }) => (
            <Link key={to} to={to} className={`flex items-center gap-5 rounded-2xl border-2 p-5 transition-colors sm:p-6 ${TINTS[tint].card}`}>
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${TINTS[tint].icon}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0">
                <strong className="block text-[1.125rem] font-semibold text-navy">{title}</strong>
                <span className="mt-0.5 block text-slate">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <h2 className="bg-cream/70 px-6 py-5 font-sans text-[1.375rem] font-semibold text-navy sm:px-8">Inbox</h2>
        {error && <p role="alert" className="m-6 rounded-xl bg-amber-50 px-4 py-3 text-amber-900 sm:m-8">{error}</p>}
        {!data && !error && <p className="flex items-center gap-2 p-8 text-slate"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}
        {data && (
          <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-3">
            {INBOX_CARDS.map(({ table, label, openLabel, to, Icon, summary }) => (
              <div key={table} className="flex flex-col rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-sans text-[1rem] font-semibold text-navy">{label}</h3>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden /></span>
                </div>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[2rem] font-semibold leading-none text-navy">{data.counts[table].open}</span>
                  <span className="text-sm text-slate">{openLabel} · {data.counts[table].total} total</span>
                </p>
                <ul className="mt-4 divide-y divide-line border-t border-line">
                  {data.recent[table].length === 0 && <li className="py-3 text-sm text-slate">Nothing yet.</li>}
                  {data.recent[table].map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-navy">{r.name}</span>
                        <span className="block truncate text-slate">{summary(r)}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium capitalize ring-1 ${STATUS_STYLES[r.status] ?? ''}`}>{r.status}</span>
                    </li>
                  ))}
                </ul>
                <Link to={to} className="text-link mt-auto pt-4 text-sm">
                  Open {label.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <h2 className="bg-cream/70 px-6 py-5 font-sans text-[1.375rem] font-semibold text-navy sm:px-8">Getting Started</h2>
        <ol className="grid gap-4 p-6 sm:p-8 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">{i + 1}</span>
              <div>
                <p className="font-semibold text-navy">
                  {s.to ? <Link to={s.to} className="hover:text-brand-700">{s.title}</Link> : s.title}
                </p>
                <p className="text-sm text-slate">{s.text}</p>
              </div>
            </li>
          ))}
          <li className="flex items-center gap-2 text-sm text-emerald-800 md:col-span-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Everything is stored privately in your Vercel project.
          </li>
        </ol>
      </section>
    </div>
  );
}
