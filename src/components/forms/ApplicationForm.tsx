import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { normalizeApplication, RESUME, validateApplication, validateResumeMeta, type ApplicationData } from '../../lib/validation';
import { EXPERIENCE_OPTIONS, POSITION_SUGGESTIONS } from '../../data/content';
import { Field, FormSuccess, Honeypot, ServerError } from './Field';
import { SubmitButton } from './SubmitButton';
import { useForm } from './useForm';

const initial: ApplicationData = { name: '', email: '', phone: '', position: '', experience: '', message: '', resume: null };

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface ApplicationFormHandle {
  /** Pre-fill the position and move focus to the form. */
  choosePosition: (title: string) => void;
}

export const ApplicationForm = forwardRef<ApplicationFormHandle>(function ApplicationForm(_, ref) {
  const f = useForm({ endpoint: '/api/apply', initial, normalize: normalizeApplication, validate: validateApplication, idPrefix: 'apply' });
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  useImperativeHandle(ref, () => ({
    choosePosition: (title) => {
      f.reset();
      f.set('position', title);
      window.setTimeout(() => document.getElementById('apply-name')?.focus({ preventScroll: true }), 400);
    },
  }));

  async function onFile(file: File | undefined) {
    if (!file) return;
    const err = validateResumeMeta(file.name, file.size);
    if (err) {
      f.setErrors((e) => ({ ...e, resume: err }));
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setReading(true);
    try {
      f.set('resume', { name: file.name, size: file.size, data: await readAsBase64(file) });
    } finally {
      setReading(false);
    }
  }

  if (f.status === 'success') {
    return (
      <FormSuccess title="Thank you for applying" onReset={f.reset} resetLabel="Submit another application">
        <p>We’ve received your application and resume. If your experience is a good match, our team will be in touch.</p>
      </FormSuccess>
    );
  }

  const resume = f.values.resume;

  return (
    <form ref={f.formRef} onSubmit={f.submit} noValidate className="relative">
      <h2 className="t-title text-[1.5rem]">Application Form</h2>
      <p className="mb-6 mt-1.5 text-[0.9375rem] text-slate-muted">
        Applying for a specific role or for future opportunities, we’d love to hear from you.
      </p>
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
        <Field id={f.id('position')} label="Position Applying For" required error={f.errors.position} className="sm:col-span-2">
          <input {...f.field('position')} list="position-options" maxLength={120} placeholder="Choose a role or enter another" />
          <datalist id="position-options">
            {POSITION_SUGGESTIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field id={f.id('experience')} label="Relevant Experience" required error={f.errors.experience} className="sm:col-span-2">
          <select {...f.field('experience')}>
            <option value="">Select experience level</option>
            {EXPERIENCE_OPTIONS.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field id={f.id('message')} label="Short Introduction" className="sm:col-span-2">
          <textarea
            {...f.field('message')}
            rows={4}
            maxLength={3000}
            placeholder="Tell us a little about yourself and why you’d like to join our team..."
          />
        </Field>

        <div className="sm:col-span-2">
          <p className="field-label" id="apply-resume-label">
            Upload Resume/CV <span aria-hidden>*</span>
            <span className="sr-only"> (required)</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="apply-resume"
              className="btn-secondary btn-sm cursor-pointer font-sans text-[0.875rem] font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600"
            >
              <Upload className="h-4 w-4" aria-hidden /> {reading ? 'Reading…' : 'Choose File'}
              <input
                ref={fileRef}
                id="apply-resume"
                type="file"
                accept={RESUME.accept}
                className="sr-only"
                aria-labelledby="apply-resume-label"
                aria-invalid={f.errors.resume ? true : undefined}
                aria-describedby={f.errors.resume ? 'apply-resume-error' : 'apply-resume-hint'}
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
            {resume && (
              <span className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-brand-50 py-1.5 pl-3 pr-1 text-[0.875rem] text-navy">
                <FileText className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                <span className="truncate">{resume.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    f.set('resume', null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-white"
                  aria-label={`Remove ${resume.name}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            )}
          </div>
          {f.errors.resume ? (
            <p id="apply-resume-error" className="field-error">{f.errors.resume}</p>
          ) : (
            <p id="apply-resume-hint" className="mt-1.5 text-[0.8125rem] text-slate-muted">Accepted formats: PDF, DOC, DOCX (Max 3 MB)</p>
          )}
        </div>
        <Honeypot />
      </div>
      {f.status === 'error' && <ServerError message={f.serverError} />}
      <SubmitButton submitting={f.status === 'submitting' || reading} label="Submit Application" />
      <p className="mt-3 text-[0.8125rem] text-slate-muted">
        By submitting this application, you consent to the processing of your personal data for recruitment purposes.
      </p>
    </form>
  );
});
