import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2, Mail, Phone, Trash2, X } from 'lucide-react';
import { adminCall, formatDate, STATUS_STYLES, TABLE_LABELS, type InboxTable } from '../api';

type Rec = Record<string, string | null>;

const CONFIG: Record<InboxTable, { summary: (r: Rec) => string; fields: [string, string][] }> = {
  contact_submissions: {
    summary: (r) => r.subject || '—',
    fields: [
      ['Service interest', 'inquiry_type'],
      ['Subject', 'subject'],
      ['Message', 'message'],
    ],
  },
  visit_requests: {
    summary: (r) => `${r.preferred_date ?? ''} · ${r.preferred_time ?? ''}`,
    fields: [
      ['Preferred date', 'preferred_date'],
      ['Preferred time', 'preferred_time'],
      ['Service', 'care_type'],
      ['Visitors', 'visitors'],
      ['Message', 'message'],
    ],
  },
  job_applications: {
    summary: (r) => r.position || '—',
    fields: [
      ['Position', 'position'],
      ['Experience', 'experience'],
      ['Introduction', 'message'],
      ['Resume', 'resume_filename'],
    ],
  },
};

const LABELS: Record<string, string> = { residential: 'Residential Care', home: 'Home Care', unsure: 'Not sure yet', general: 'General' };

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium capitalize ring-1 ${STATUS_STYLES[status] ?? ''}`}>{status}</span>;
}

function Detail({ table, row, statuses, onChange, onClose, onDeleted }: {
  table: InboxTable;
  row: Rec;
  statuses: string[];
  onChange: (patch: Rec) => void;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [notes, setNotes] = useState(row.staff_notes ?? '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const setStatus = (status: string) =>
    run('status', async () => {
      await adminCall('update', { table, id: row.id, status });
      onChange({ status });
    });
  const saveNotes = () =>
    run('notes', async () => {
      await adminCall('update', { table, id: row.id, staff_notes: notes });
      onChange({ staff_notes: notes });
    });
  const download = () =>
    run('resume', async () => {
      const { url } = await adminCall<{ url: string }>('resumeUrl', { id: row.id });
      window.open(url, '_blank', 'noopener');
    });
  const remove = () => {
    if (!window.confirm(`Permanently delete this ${table === 'job_applications' ? 'application and its resume' : 'entry'}? This cannot be undone.`)) return;
    run('delete', async () => {
      await adminCall('delete', { table, id: row.id });
      onDeleted();
    });
  };

  return (
    <aside aria-label="Details" className="card p-6 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="t-title">{row.name}</h2>
          <p className="mt-1 text-sm text-slate">{row.created_at && formatDate(row.created_at)}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream" aria-label="Close details">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {row.email && (
          <a href={`mailto:${row.email}`} className="btn-secondary btn-sm"><Mail className="h-4 w-4" aria-hidden /> {row.email}</a>
        )}
        {row.phone && (
          <a href={`tel:${row.phone}`} className="btn-secondary btn-sm"><Phone className="h-4 w-4" aria-hidden /> {row.phone}</a>
        )}
      </div>

      <dl className="mt-6 space-y-4">
        {CONFIG[table].fields.map(([label, key]) =>
          row[key] ? (
            <div key={key}>
              <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-slate">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-navy">{LABELS[row[key] as string] ?? row[key]}</dd>
            </div>
          ) : null,
        )}
      </dl>

      {table === 'job_applications' && row.resume_path && (
        <button type="button" onClick={download} className="btn-primary btn-sm mt-5" disabled={!!busy}>
          {busy === 'resume' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" aria-hidden />} Download resume
        </button>
      )}

      <div className="mt-6 border-t border-line pt-5">
        <label htmlFor="detail-status" className="field-label">Status</label>
        <select id="detail-status" className="field capitalize" value={row.status ?? ''} onChange={(e) => setStatus(e.target.value)} disabled={!!busy}>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {table === 'visit_requests' && (
          <p className="mt-1.5 text-sm text-slate">Set to “confirmed” once you’ve agreed a time with the family.</p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="detail-notes" className="field-label">Staff notes</label>
        <textarea id="detail-notes" rows={4} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Private notes for the team" />
        <button type="button" onClick={saveNotes} disabled={!!busy || notes === (row.staff_notes ?? '')} className="btn-secondary btn-sm mt-3">
          {busy === 'notes' && <Loader2 className="h-4 w-4 animate-spin" />} Save notes
        </button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}

      <button type="button" onClick={remove} disabled={!!busy} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:underline">
        <Trash2 className="h-4 w-4" aria-hidden /> Delete permanently
      </button>
    </aside>
  );
}

export function Inbox({ table }: { table: InboxTable }) {
  const [rows, setRows] = useState<Rec[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminCall<{ rows: Rec[]; total: number; pageSize: number; statuses: string[] }>('list', { table, page, status })
      .then((r) => {
        setRows(r.rows);
        setTotal(r.total);
        setPageSize(r.pageSize);
        setStatuses(r.statuses);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [table, page, status]);

  useEffect(load, [load]);

  const row = rows.find((r) => r.id === selected) ?? null;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-page text-[2rem]">{TABLE_LABELS[table]}</h1>
          <p className="mt-1 text-slate">{total} {total === 1 ? 'entry' : 'entries'}{status ? ` · ${status}` : ''}</p>
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            className="field w-auto capitalize"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
              setSelected(null);
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-900">{error}</p>}

      <div className={`mt-6 grid items-start gap-6 ${row ? 'lg:grid-cols-[1fr_400px]' : ''}`}>
        <div className="card overflow-hidden">
          {loading ? (
            <p className="flex items-center gap-2 p-6 text-slate"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-slate">Nothing here yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.id)}
                    aria-current={r.id === selected}
                    className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 text-left transition-colors hover:bg-cream sm:grid-cols-[150px_1fr_auto] ${r.id === selected ? 'bg-brand-50' : ''}`}
                  >
                    <span className="order-3 col-span-2 text-[0.8125rem] text-slate sm:order-none sm:col-span-1">{r.created_at && formatDate(r.created_at)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-navy">{r.name}</span>
                      <span className="block truncate text-sm text-slate">{CONFIG[table].summary(r)}</span>
                    </span>
                    <StatusBadge status={r.status ?? ''} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
              <button type="button" className="inline-flex items-center gap-1 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Newer
              </button>
              <span className="text-slate">Page {page + 1} of {pages}</span>
              <button type="button" className="inline-flex items-center gap-1 disabled:opacity-40" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                Older <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {row && (
          <Detail
            key={row.id as string}
            table={table}
            row={row}
            statuses={statuses}
            onClose={() => setSelected(null)}
            onChange={(patch) => setRows((rs) => rs.map((x) => (x.id === row.id ? { ...x, ...patch } : x)))}
            onDeleted={() => {
              setSelected(null);
              load();
            }}
          />
        )}
      </div>
    </div>
  );
}
