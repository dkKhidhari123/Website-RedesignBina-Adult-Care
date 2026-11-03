import { useRef, useState, type FormEvent } from 'react';
import type { Errors } from '../../lib/validation';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Options<T> {
  endpoint: string;
  initial: T;
  normalize: (input: Record<string, unknown>) => T;
  validate: (data: T) => Errors<T>;
  idPrefix: string;
}

/**
 * Shared form state for all site forms: client-side validation, accessible
 * error wiring, spam protection fields and submission to an /api endpoint.
 */
export function useForm<T extends object>({ endpoint, initial, normalize, validate, idPrefix }: Options<T>) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  const id = (name: keyof T) => `${idPrefix}-${String(name)}`;

  const set = <K extends keyof T>(name: K, value: T[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  /** Props for a text input, select or textarea bound to `name`. */
  const field = (name: keyof T) => ({
    id: id(name),
    name: String(name),
    value: String(values[name] ?? ''),
    onChange: (e: { target: { value: string } }) => set(name, e.target.value as T[keyof T]),
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? `${id(name)}-error` : undefined,
    className: 'field',
  });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = normalize(values as unknown as Record<string, unknown>);
    const found = validate(data);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`${idPrefix}-${firstInvalid}`)?.focus();
      return;
    }

    setStatus('submitting');
    setServerError('');
    try {
      const honeypot = (formRef.current?.elements.namedItem('company') as HTMLInputElement | null)?.value ?? '';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, company: honeypot, startedAt: startedAt.current, sourcePage: location.pathname + location.search }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.fields) setErrors(json.fields);
        throw new Error(json.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      setValues(initial);
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  const reset = () => {
    startedAt.current = Date.now();
    setStatus('idle');
  };

  return { values, set, errors, setErrors, status, serverError, submit, reset, field, id, formRef };
}
