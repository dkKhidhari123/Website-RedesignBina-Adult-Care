import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { normalizeContact, SERVICE_INTERESTS, validateContact, type ContactData, type ServiceInterest } from '../../lib/validation';
import { Field, FormSuccess, Honeypot, ServerError } from './Field';
import { useForm } from './useForm';
import { site } from '../../data/site';
import { SubmitButton } from './SubmitButton';

const initial: ContactData = { name: '', phone: '', email: '', service: '', subject: '', message: '' };

export function ContactForm() {
  const f = useForm({ endpoint: '/api/contact', initial, normalize: normalizeContact, validate: validateContact, idPrefix: 'contact' });
  const [params] = useSearchParams();

  // Deep links like /contact?service=home pre-select the service (applied after hydration).
  useEffect(() => {
    const s = params.get('service');
    if (s && s in SERVICE_INTERESTS) f.set('service', s as ServiceInterest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (f.status === 'success') {
    return (
      <FormSuccess title="Thank you — your message has been sent" onReset={f.reset} resetLabel="Write another message">
        <p>Our team will get back to you soon.</p>
        <p>
          You can also call us at{' '}
          <a href={site.phone.href} className="font-semibold text-brand-700 underline underline-offset-4">
            {site.phone.display}
          </a>
          .
        </p>
      </FormSuccess>
    );
  }

  return (
    <form ref={f.formRef} onSubmit={f.submit} noValidate className="relative">
      <h2 className="t-title mb-6 text-[1.5rem]">Send Us a Message</h2>
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
        <Field id={f.id('service')} label="Service Interest" className="sm:col-span-2">
          <select {...f.field('service')}>
            <option value="">Select a service</option>
            {Object.entries(SERVICE_INTERESTS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field id={f.id('subject')} label="Subject" required error={f.errors.subject} className="sm:col-span-2">
          <input {...f.field('subject')} type="text" maxLength={150} placeholder="How can we help?" />
        </Field>
        <Field id={f.id('message')} label="Message" required error={f.errors.message} className="sm:col-span-2">
          <textarea {...f.field('message')} rows={5} maxLength={4000} placeholder="Tell us how we can help..." />
        </Field>
        <Honeypot />
      </div>
      {f.status === 'error' && <ServerError message={f.serverError} />}
      <SubmitButton submitting={f.status === 'submitting'} label="Submit Message" />
      <p className="mt-3 text-[0.8125rem] text-slate-muted">
        We respect your privacy and will only use your information to respond to your inquiry.
      </p>
    </form>
  );
}
