import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { normalizeVisit, SERVICE_INTERESTS, todayISO, validateVisit, type ServiceInterest, type VisitData } from '../../lib/validation';
import { VISIT_TIMES, VISITOR_COUNTS } from '../../data/content';
import { Field, FormSuccess, Honeypot, ServerError } from './Field';
import { SubmitButton } from './SubmitButton';
import { useForm } from './useForm';
import { site } from '../../data/site';

const initial: VisitData = { name: '', phone: '', email: '', preferredDate: '', preferredTime: '', service: '', visitors: '1', message: '' };

export function VisitForm() {
  const f = useForm({ endpoint: '/api/visit', initial, normalize: normalizeVisit, validate: (d) => validateVisit(d), idPrefix: 'visit' });
  const [params] = useSearchParams();
  const [minDate, setMinDate] = useState<string>();
  const [submitted, setSubmitted] = useState<{ date: string; time: string } | null>(null);

  // Client-only values (today’s date, query string) are applied after hydration.
  useEffect(() => setMinDate(todayISO()), []);
  useEffect(() => {
    const s = params.get('service');
    if (s && s in SERVICE_INTERESTS) f.set('service', s as ServiceInterest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (f.status === 'success') {
    const when = submitted?.date
      ? `${new Date(submitted.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${submitted.time}`
      : '';
    return (
      <FormSuccess title="Your visit request has been sent" onReset={() => { setSubmitted(null); f.reset(); }} resetLabel="Request another visit">
        <p>
          <strong>This is a request, not a confirmed appointment.</strong> Our team will contact you to confirm your
          visit{when ? ` for ${when}` : ''}.
        </p>
        <p>
          For anything urgent, call{' '}
          <a href={site.phone.href} className="font-semibold text-brand-700 underline underline-offset-4">
            {site.phone.display}
          </a>
          .
        </p>
      </FormSuccess>
    );
  }

  return (
    <form
      ref={f.formRef}
      onSubmit={(e) => {
        setSubmitted({ date: f.values.preferredDate, time: f.values.preferredTime });
        return f.submit(e);
      }}
      noValidate
      className="relative"
    >
      <h2 className="t-title text-[1.5rem]">Request a Visit</h2>
      <p className="mb-6 mt-1.5 text-[0.9375rem] text-slate-muted">Tell us when you’d like to visit. Our team will contact you to confirm.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={f.id('name')} label="Full Name" required error={f.errors.name}>
          <input {...f.field('name')} type="text" autoComplete="name" maxLength={120} placeholder="Enter your full name" />
        </Field>
        <Field id={f.id('phone')} label="Phone Number" required error={f.errors.phone}>
          <input {...f.field('phone')} type="tel" autoComplete="tel" inputMode="tel" maxLength={40} placeholder="(510) 000-0000" />
        </Field>
        <Field id={f.id('email')} label="Email Address" required error={f.errors.email} className="sm:col-span-2">
          <input {...f.field('email')} type="email" autoComplete="email" inputMode="email" maxLength={254} placeholder="your.email@example.com" />
        </Field>
        <Field id={f.id('preferredDate')} label="Preferred Visit Date" required error={f.errors.preferredDate}>
          <input {...f.field('preferredDate')} type="date" min={minDate} />
        </Field>
        <Field id={f.id('preferredTime')} label="Preferred Visit Time" required error={f.errors.preferredTime}>
          <select {...f.field('preferredTime')}>
            <option value="">Select time</option>
            {VISIT_TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id={f.id('service')} label="Service Interested In" required error={f.errors.service}>
          <select {...f.field('service')}>
            <option value="">Select a service</option>
            {Object.entries(SERVICE_INTERESTS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field id={f.id('visitors')} label="Number of Visitors" required>
          <select {...f.field('visitors')}>
            {VISITOR_COUNTS.map((n) => (
              <option key={n} value={n}>{n === '5+' ? '5 or more' : n}</option>
            ))}
          </select>
        </Field>
        <Field id={f.id('message')} label="Additional Message" className="sm:col-span-2">
          <textarea {...f.field('message')} rows={4} maxLength={2000} placeholder="Anything you’d like us to know before your visit..." />
        </Field>
        <Honeypot />
      </div>
      {f.status === 'error' && <ServerError message={f.serverError} />}
      <SubmitButton submitting={f.status === 'submitting'} label="Submit Booking Request" />
      <p className="mt-3 text-[0.8125rem] text-slate-muted">
        Submitting a request does not confirm an appointment. We’ll contact you to confirm a time. We respect your privacy
        and will only use your information to arrange your visit.
      </p>
    </form>
  );
}
