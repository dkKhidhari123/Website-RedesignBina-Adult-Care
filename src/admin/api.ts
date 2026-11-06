export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Calls an /api/admin action. The HttpOnly session cookie is sent automatically. */
export async function adminCall<T = Record<string, unknown>>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch('/api/admin', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params }),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your internet connection and try again.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new ApiError(res.status, json.error || 'Something went wrong.');
  return json as T;
}

export const TABLE_LABELS = {
  contact_submissions: 'Messages',
  visit_requests: 'Visit Requests',
  job_applications: 'Applications',
} as const;
export type InboxTable = keyof typeof TABLE_LABELS;

export const STATUS_STYLES: Record<string, string> = {
  new: 'bg-brand-50 text-brand-700 ring-brand-200',
  requested: 'bg-brand-50 text-brand-700 ring-brand-200',
  contacted: 'bg-amber-50 text-amber-800 ring-amber-200',
  reviewing: 'bg-amber-50 text-amber-800 ring-amber-200',
  interview: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  completed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  hired: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  closed: 'bg-slate/10 text-slate ring-line',
  cancelled: 'bg-slate/10 text-slate ring-line',
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
