import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, CalendarCheck, Loader2, Mail } from 'lucide-react';
import { adminCall, STATUS_STYLES, type InboxTable } from '../api';
import { useAdmin } from '../session';

type Rec = Record<string, string>;
interface Data {
  counts: Record<InboxTable, { open: number; total: number }>;
  recent: Record<InboxTable, Rec[]>;
}

const CARDS: { table: InboxTable; label: string; openLabel: string; to: string; Icon: typeof Mail; summary: (r: Rec) => string }[] = [
  { table: 'contact_submissions', label: 'Messages', openLabel: 'new', to: '/admin/messages', Icon: Mail, summary: (r) => r.subject || r.message?.slice(0, 60) },
  { table: 'visit_requests', label: 'Visit requests', openLabel: 'awaiting confirmation', to: '/admin/visits', Icon: CalendarCheck, summary: (r) => `${r.preferred_date} · ${r.preferred_time}` },
  { table: 'job_applications', label: 'Applications', openLabel: 'new', to: '/admin/applications', Icon: Briefcase, summary: (r) => r.position },
];

export function Dashboard() {
  const { username } = useAdmin();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCall<Data>('dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="t-page text-[2rem] sm:text-[2.5rem]">Welcome back</h1>
      <p className="mt-2 text-slate">Signed in as {username}. Here’s what’s new.</p>

      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-900">{error}</p>}
      {!data && !error && (
        <p className="mt-10 flex items-center gap-2 text-slate"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      )}

      {data && (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {CARDS.map(({ table, label, openLabel, to, Icon, summary }) => (
            <section key={table} className="card flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="t-subtitle text-[1.125rem]">{label}</h2>
                  <p className="mt-1 text-sm text-slate">{data.counts[table].total} total</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <p className="mt-5 font-display text-[2.5rem] leading-none text-navy">
                {data.counts[table].open}
                <span className="ml-2 font-sans text-sm text-slate">{openLabel}</span>
              </p>
              <ul className="mt-5 divide-y divide-line border-t border-line">
                {data.recent[table].length === 0 && <li className="py-3 text-sm text-slate">Nothing yet.</li>}
                {data.recent[table].map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-navy">{r.name}</span>
                      <span className="block truncate text-slate">{summary(r)}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium capitalize ring-1 ${STATUS_STYLES[r.status] ?? ''}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to={to} className="text-link mt-auto pt-5 text-sm">
                Open {label.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>
          ))}
        </div>
      )}

      <section className="card mt-8 p-6">
        <h2 className="t-subtitle text-[1.125rem]">Editing the website</h2>
        <p className="mt-2 text-slate">
          Change content under <strong>Website content</strong> and press <strong>Save</strong>. When you’re ready, press{' '}
          <strong>Publish website</strong> (top right) — the public site updates in about 1–2 minutes.
        </p>
        <p className="mt-2 text-slate">
          <Link to="/admin/content/settings" className="text-link text-sm">Start with business info <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </p>
      </section>
    </div>
  );
}
