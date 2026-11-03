import { useEffect, useRef, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { site } from '../../data/site';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, required, hint, error, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && (
          <>
            <span aria-hidden> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-slate-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden from people and assistive technology; bots tend to fill it in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="hp-company">Company</label>
      <input id="hp-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function ServerError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-[0.9375rem] text-red-900">
      {message} You can also call us at{' '}
      <a href={site.phone.href} className="font-semibold underline">
        {site.phone.display}
      </a>
      .
    </p>
  );
}

export function FormSuccess({ title, children, onReset, resetLabel }: { title: string; children: ReactNode; onReset: () => void; resetLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="py-6 text-center outline-none">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50">
        <CheckCircle2 className="h-8 w-8 text-brand-700" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="t-title mt-6">{title}</h3>
      <div className="mx-auto mt-3 max-w-md space-y-3 text-slate-muted">{children}</div>
      <button type="button" className="btn-secondary mt-8" onClick={onReset}>
        {resetLabel}
      </button>
    </div>
  );
}

