import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { useContent } from '../content';
import { adminCall, formatDate } from '../api';
import { PageHeader } from '../AdminLayout';
import type { CmsContent, CmsKey, FaqItem, GalleryItem, HeroItem, HomeContent, Settings, TeamItem, TestimonialItem, VacancyItem, WhyItem } from '../../lib/cms';
import { GALLERY_CATEGORIES } from '../../data/gallery';
import { mapsEmbed } from '../../data/site';

/** Preview for a photo: uploads are served privately by /api/admin, site photos from /images. */
const previewSrc = (image: string) => (image.startsWith('cms-') ? `/api/admin?image=${image}` : `/images/${image}-480.webp`);

/* ── Shared pieces ─────────────────────────────────────────── */

function EditorShell<K extends CmsKey>({
  section,
  title,
  intro,
  value,
  initial,
  children,
}: {
  section: K;
  title: string;
  intro: ReactNode;
  value: NonNullable<CmsContent[K]>;
  initial: NonNullable<CmsContent[K]>;
  children: ReactNode;
}) {
  const { save, updatedAt } = useContent();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  async function onSave() {
    setBusy(true);
    setMsg(null);
    try {
      await save(section, value);
      setMsg({ ok: true, text: 'Saved. Press “Publish website” when you’re ready to update the live site.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const last = updatedAt(section);
  return (
    <div className="mx-auto max-w-5xl pb-28">
      <PageHeader
        title={title}
        subtitle={
          <>
            {intro}
            <p className="mt-1 text-sm">{last ? `Last saved ${formatDate(last)}` : 'Showing what the website currently displays.'}</p>
          </>
        }
      />
      <div className="space-y-4">{children}</div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:left-[var(--admin-sidebar,288px)]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <p role="status" className={`text-sm ${msg ? (msg.ok ? 'text-emerald-800' : 'text-red-800') : 'text-slate'}`}>
            {msg?.text ?? (dirty ? 'You have unsaved changes.' : 'No unsaved changes.')}
          </p>
          <button type="button" onClick={onSave} disabled={busy || !dirty} className="btn-primary btn-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" aria-hidden />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type?: 'text' | 'textarea' | 'email' | 'rating';
  hint?: string;
  wide?: boolean;
}

function Input<T>({ def, value, onChange, id }: { def: FieldDef<T>; value: unknown; onChange: (v: unknown) => void; id: string }) {
  return (
    <div className={def.wide || def.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="field-label">{def.label}</label>
      {def.type === 'textarea' ? (
        <textarea id={id} rows={3} className="field" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      ) : def.type === 'rating' ? (
        <select id={id} className="field" value={Number(value) || 0} onChange={(e) => onChange(Number(e.target.value))}>
          <option value={0}>No rating</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
        </select>
      ) : (
        <input id={id} type={def.type === 'email' ? 'email' : 'text'} className="field" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      )}
      {def.hint && <p className="mt-1.5 text-sm text-slate">{def.hint}</p>}
    </div>
  );
}

function ItemControls({ i, n, onMove, onRemove, label }: { i: number; n: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  const btn = 'grid h-9 w-9 place-items-center rounded-lg text-navy hover:bg-cream disabled:opacity-30';
  return (
    <div className="flex items-center gap-1">
      <button type="button" className={btn} disabled={i === 0} onClick={() => onMove(i - 1)} aria-label={`Move ${label} up`}><ArrowUp className="h-4 w-4" /></button>
      <button type="button" className={btn} disabled={i === n - 1} onClick={() => onMove(i + 1)} aria-label={`Move ${label} down`}><ArrowDown className="h-4 w-4" /></button>
      <button type="button" className={`${btn} text-red-800`} onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

const move = <T,>(arr: T[], from: number, to: number) => {
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

/* ── Generic list editor (team, testimonials, careers, FAQs) ── */

function ListEditor<K extends 'team' | 'testimonials' | 'vacancies' | 'faqs' | 'why', T extends NonNullable<CmsContent[K]>[number]>({
  section,
  title,
  intro,
  fields,
  empty,
  itemLabel,
  emptyText,
  max,
}: {
  section: K;
  title: string;
  intro: ReactNode;
  fields: FieldDef<T>[];
  empty: T;
  itemLabel: (item: T, i: number) => string;
  emptyText: string;
  max?: number;
}) {
  const { get } = useContent();
  const initial = get(section) as T[];
  const [items, setItems] = useState<T[]>(initial);

  const update = (i: number, key: keyof T, v: unknown) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, [key]: v } : x)));

  return (
    <EditorShell section={section} title={title} intro={intro} value={items as never} initial={initial as never}>
      {items.length === 0 && <p className="card p-6 text-slate">{emptyText}</p>}
      {items.map((item, i) => (
        <fieldset key={i} className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <legend className="t-subtitle">{itemLabel(item, i)}</legend>
            <ItemControls i={i} n={items.length} label={itemLabel(item, i)} onMove={(to) => setItems((xs) => move(xs, i, to))} onRemove={() => {
              if (window.confirm(`Remove “${itemLabel(item, i)}”?`)) setItems((xs) => xs.filter((_, j) => j !== i));
            }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <Input key={f.key} id={`${section}-${i}-${f.key}`} def={f} value={item[f.key]} onChange={(v) => update(i, f.key, v)} />
            ))}
          </div>
        </fieldset>
      ))}
      {(!max || items.length < max) && (
        <button type="button" className="btn-secondary" onClick={() => setItems((xs) => [...xs, { ...empty }])}>
          <Plus className="h-4 w-4" aria-hidden /> Add
        </button>
      )}
    </EditorShell>
  );
}

export const TeamEditor = () => (
  <ListEditor<'team', TeamItem>
    section="team"
    title="Team Members"
    intro="Leadership shown on the Our Team page. Please make sure each person has approved their message and email being shown."
    fields={[
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'extra', label: 'Credential (optional)', hint: 'For example “Head CNA”.' },
      { key: 'email', label: 'Email (optional)', type: 'email', hint: 'Shown as an Email button.' },
      { key: 'message', label: 'Short message (optional)', type: 'textarea' },
    ]}
    empty={{ name: '', role: '', extra: '', email: '', message: '' }}
    itemLabel={(m, i) => m.name || `Team member ${i + 1}`}
    emptyText="No team members yet."
  />
);

export const TestimonialsEditor = () => (
  <ListEditor<'testimonials', TestimonialItem>
    section="testimonials"
    title="Testimonials"
    intro="Shown on the homepage. Only add genuine testimonials that the person has agreed to publish. If the list is empty, the section is hidden."
    fields={[
      { key: 'quote', label: 'Quote', type: 'textarea' },
      { key: 'attribution', label: 'Name or attribution', hint: 'A name, or for example “Daughter of a resident”.' },
      { key: 'relationship', label: 'Relationship (optional)', hint: 'For example “Family Member”.' },
      { key: 'rating', label: 'Star rating', type: 'rating', hint: 'Only if the person actually gave a rating.' },
    ]}
    empty={{ quote: '', attribution: '', relationship: '', rating: 0 }}
    itemLabel={(t, i) => t.attribution || `Testimonial ${i + 1}`}
    emptyText="No testimonials — the section is hidden on the homepage."
  />
);

export const VacanciesEditor = () => (
  <ListEditor<'vacancies', VacancyItem>
    section="vacancies"
    title="Job Positions"
    intro="Shown on the Careers page. When this list is empty, the page says “No Current Openings” and invites general applications."
    fields={[
      { key: 'title', label: 'Job title', wide: true },
      { key: 'description', label: 'Short description', type: 'textarea' },
      { key: 'type', label: 'Type', hint: 'For example “Full-time” or “Part-time”.' },
      { key: 'location', label: 'Location', hint: 'For example “El Sobrante, CA”.' },
    ]}
    empty={{ title: '', description: '', type: 'Full-time', location: 'El Sobrante, CA' }}
    itemLabel={(v, i) => v.title || `Position ${i + 1}`}
    emptyText="No open positions — the Careers page shows “No Current Openings”."
  />
);

export const FaqsEditor = () => (
  <ListEditor<'faqs', FaqItem>
    section="faqs"
    title="FAQs"
    intro="Shown on the Services page."
    fields={[
      { key: 'q', label: 'Question', wide: true },
      { key: 'a', label: 'Answer', type: 'textarea' },
    ]}
    empty={{ q: '', a: '' }}
    itemLabel={(f, i) => f.q || `Question ${i + 1}`}
    emptyText="No questions yet."
  />
);

/* ── Homepage headline ──────────────────────────────────────── */

export function HomeEditor() {
  const { get } = useContent();
  const initial = get('home');
  const [v, setV] = useState<HomeContent>(initial);
  const field = (key: keyof HomeContent, label: string, hint?: string, type?: FieldDef<HomeContent>['type']) => (
    <Input<HomeContent> id={`home-${key}`} def={{ key, label, hint, type, wide: true }} value={v[key]} onChange={(x) => setV((s) => ({ ...s, [key]: x }))} />
  );
  return (
    <EditorShell section="home" title="Homepage Headline" intro="The first thing visitors read at the top of the homepage." value={v} initial={initial}>
      <section className="card grid gap-4 p-5 sm:p-6">
        {field('badge', 'Small label above the headline (optional)', 'e.g. Trusted Senior Care. Leave empty to hide.')}
        {field('headline', 'Headline')}
        {field('intro', 'Introduction', 'One or two sentences under the headline.', 'textarea')}
      </section>
      <section className="card p-5 sm:p-6" aria-label="Preview">
        <p className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-slate">Preview</p>
        {v.badge && <span className="pill-label mb-4">{v.badge}</span>}
        <p className="t-display text-[2rem] sm:text-[2.5rem]">{v.headline || 'Headline'}</p>
        <p className="mt-3 max-w-[520px] text-slate-muted">{v.intro}</p>
      </section>
    </EditorShell>
  );
}

/* ── Why Choose Us ────────────────────────────────────────────── */

export const WhyEditor = () => (
  <ListEditor<'why', WhyItem>
    section="why"
    title="Why Choose Us"
    intro="The numbered reasons in the “Why Choose Bina Adult Care” section of the homepage. Four fit best on one row."
    fields={[
      { key: 'title', label: 'Title', wide: true },
      { key: 'text', label: 'Short description', type: 'textarea' },
    ]}
    empty={{ title: '', text: '' }}
    itemLabel={(w, i) => w.title || `Reason ${i + 1}`}
    emptyText="No reasons — the section shows only its heading."
    max={8}
  />
);

/* ── Locations and settings (both edit the business information) ── */

function useSettingsField(v: Settings, setV: (f: (s: Settings) => Settings) => void) {
  return (key: keyof Settings, label: string, hint?: string, type?: FieldDef<Settings>['type']) => (
    <Input<Settings> id={`settings-${key}`} def={{ key, label, hint, type }} value={v[key]} onChange={(x) => setV((s) => ({ ...s, [key]: x }))} />
  );
}

export function LocationEditor() {
  const { get } = useContent();
  const initial = get('settings');
  const [v, setV] = useState<Settings>(initial);
  const field = useSettingsField(v, setV);
  const saved = `${initial.street}, ${initial.city}, ${initial.state} ${initial.zip}`;
  return (
    <EditorShell section="settings" title="Locations" intro="The address and opening hours shown on the Contact page, in the footer and in the map." value={v} initial={initial}>
      <section className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="t-subtitle sm:col-span-2">Bina Adult Care — El Sobrante</h2>
        {field('street', 'Street')}
        {field('city', 'City')}
        {field('state', 'State')}
        {field('zip', 'ZIP code')}
        {field('hours', 'Hours', 'e.g. Open 24 hours, 7 days a week.')}
      </section>
      <section className="card overflow-hidden">
        <iframe
          title={`Map of ${saved}`}
          src={mapsEmbed.replace(/q=[^&]+/, `q=${encodeURIComponent(saved)}`)}
          className="block h-[280px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <p className="px-5 py-3 text-sm text-slate">Map of the saved address. It updates after you save.</p>
      </section>
    </EditorShell>
  );
}

export function SettingsEditor() {
  const { get } = useContent();
  const initial = get('settings');
  const [v, setV] = useState<Settings>(initial);
  const field = useSettingsField(v, setV);
  return (
    <EditorShell section="settings" title="Settings" intro="Contact details and social links used in the header, footer, contact page and business card." value={v} initial={initial}>
      <section className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="t-subtitle sm:col-span-2">Contact</h2>
        {field('phone', 'Phone', 'Include the area code, e.g. 510 710 4392.')}
        {field('email', 'Email', undefined, 'email')}
      </section>
      <section className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="t-subtitle sm:col-span-2">Social media</h2>
        <p className="-mt-2 text-sm text-slate sm:col-span-2">Full links starting with https://. Leave empty to hide.</p>
        {field('instagram', 'Instagram')}
        {field('facebook', 'Facebook')}
        {field('linkedin', 'LinkedIn')}
      </section>
    </EditorShell>
  );
}

/* ── Services lists ────────────────────────────────────────── */

function PointsList({ label, items, onChange }: { label: string; items: string[]; onChange: (xs: string[]) => void }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="t-subtitle mb-4">{label}</h2>
      <ol className="space-y-2">
        {items.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`${label}-${i}`}>{label} item {i + 1}</label>
            <input id={`${label}-${i}`} className="field" value={p} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <ItemControls i={i} n={items.length} label={p || `item ${i + 1}`} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ol>
      <button type="button" className="btn-secondary btn-sm mt-4" onClick={() => onChange([...items, ''])}>
        <Plus className="h-4 w-4" aria-hidden /> Add item
      </button>
    </section>
  );
}

export function ServicesEditor() {
  const { get } = useContent();
  const initial = get('services');
  const [v, setV] = useState(initial);
  return (
    <EditorShell
      section="services"
      title="Services"
      intro={<>The “What We Offer” lists on the Services page. <strong>Only list services Bina Adult Care is licensed and staffed to provide.</strong></>}
      value={v}
      initial={initial}
    >
      <PointsList label="Residential Care" items={v.residential} onChange={(residential) => setV((s) => ({ ...s, residential }))} />
      <PointsList label="Home Care" items={v.home} onChange={(home) => setV((s) => ({ ...s, home }))} />
    </EditorShell>
  );
}

/* ── Photo uploads (gallery and hero images) ─────────────────── */

const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

/** Upload button: sends each chosen photo to the private store and reports its new image name. */
function UploadButton({ onUploaded, label = 'Upload photos' }: { onUploaded: (image: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    for (const file of Array.from(files)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`${file.name}: please choose JPG, PNG or WebP photos.`);
        continue;
      }
      if (file.size > 3 * 1024 * 1024) {
        setError(`${file.name}: please choose a photo smaller than 3 MB.`);
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const r = await adminCall<{ image: string }>('upload', { type: file.type, data: await readBase64(file) });
        onUploaded(r.image);
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      <label className="btn-primary btn-sm cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" aria-hidden />}
        {uploading ? `Uploading ${uploading}…` : label}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
    </div>
  );
}

function PhotoCard({ image, hidden, badge, children }: { image: string; hidden: boolean; badge?: string; children: ReactNode }) {
  return (
    <li className={`card overflow-hidden ${hidden ? 'opacity-60' : ''}`}>
      <div className="relative aspect-[4/3] bg-brand-50">
        <img src={previewSrc(image)} alt="" loading="lazy" className="h-full w-full object-cover" />
        {hidden && <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-2.5 py-1 text-xs font-medium text-white">Hidden</span>}
        {image.startsWith('cms-') && <span className="absolute right-3 top-3 rounded-full bg-champagne px-2.5 py-1 text-xs font-medium text-navy">{badge ?? 'Uploaded'}</span>}
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </li>
  );
}

const iconBtn = 'grid h-9 w-9 place-items-center rounded-lg text-navy hover:bg-cream';

/* ── Hero images ───────────────────────────────────────────────── */

export function HeroEditor() {
  const { get } = useContent();
  const initial = get('hero');
  const gallery = get('gallery');
  const [items, setItems] = useState<HeroItem[]>(initial);
  const update = (i: number, patch: Partial<HeroItem>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const available = gallery.filter((g) => !items.some((h) => h.image === g.image));

  return (
    <EditorShell
      section="hero"
      title="Hero Images"
      intro="The photo slideshow at the top of the homepage. Square-ish photos of the home work best. Hidden photos stay here but are not shown."
      value={items}
      initial={initial}
    >
      <div className="card flex flex-wrap items-end justify-between gap-4 p-5">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="hero-add" className="field-label">Add a photo from the gallery</label>
          <select
            id="hero-add"
            className="field"
            value=""
            onChange={(e) => {
              const g = gallery.find((x) => x.image === e.target.value);
              if (g) setItems((xs) => [...xs, { image: g.image, alt: g.alt, hidden: false }]);
            }}
          >
            <option value="">Choose a photo…</option>
            {available.map((g) => <option key={g.image} value={g.image}>{g.alt}</option>)}
          </select>
        </div>
        <UploadButton label="Upload new" onUploaded={(image) => setItems((xs) => [...xs, { image, alt: '', hidden: false }])} />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((h, i) => (
          <PhotoCard key={h.image} image={h.image} hidden={h.hidden}>
            <div>
              <label htmlFor={`hero-alt-${i}`} className="field-label">Slide {i + 1} — description</label>
              <input id={`hero-alt-${i}`} className="field" value={h.alt} placeholder="e.g. Bright living room with fireplace" onChange={(e) => update(i, { alt: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-1">
              <button type="button" className={iconBtn} onClick={() => update(i, { hidden: !h.hidden })} aria-label={h.hidden ? 'Show slide' : 'Hide slide'} title={h.hidden ? 'Show on website' : 'Hide from website'}>
                {h.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <ItemControls i={i} n={items.length} label={h.alt || `slide ${i + 1}`} onMove={(to) => setItems((xs) => move(xs, i, to))} onRemove={() => {
                if (window.confirm('Remove this slide?')) setItems((xs) => xs.filter((_, j) => j !== i));
              }} />
            </div>
          </PhotoCard>
        ))}
      </ul>
    </EditorShell>
  );
}

/* ── Gallery ───────────────────────────────────────────────────── */

export function GalleryEditor() {
  const { get } = useContent();
  const initial = get('gallery');
  const [items, setItems] = useState<GalleryItem[]>(initial);

  const update = (i: number, patch: Partial<GalleryItem>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <EditorShell
      section="gallery"
      title="Gallery"
      intro="Photos on the Gallery page. Upload new photos, describe each one (this helps visitors using screen readers and Google), choose a category, reorder or hide them."
      value={items}
      initial={initial}
    >
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm text-slate">JPG, PNG or WebP, up to 3 MB each. New photos appear at the top.</p>
        <UploadButton onUploaded={(image) => setItems((xs) => [{ image, url: '', alt: '', category: 'living', hidden: false }, ...xs])} />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <PhotoCard key={p.image} image={p.image} hidden={p.hidden}>
            <div>
              <label htmlFor={`alt-${i}`} className="field-label">Description</label>
              <input id={`alt-${i}`} className="field" value={p.alt} placeholder="e.g. Bright bedroom with garden view" onChange={(e) => update(i, { alt: e.target.value })} />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-[150px] flex-1">
                <label htmlFor={`cat-${i}`} className="field-label">Category</label>
                <select id={`cat-${i}`} className="field" value={p.category} onChange={(e) => update(i, { category: e.target.value as GalleryItem['category'] })}>
                  {Object.entries(GALLERY_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className={iconBtn} onClick={() => update(i, { hidden: !p.hidden })} aria-label={p.hidden ? 'Show photo on website' : 'Hide photo from website'} title={p.hidden ? 'Show on website' : 'Hide from website'}>
                  {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <ItemControls i={i} n={items.length} label={p.alt || `photo ${i + 1}`} onMove={(to) => setItems((xs) => move(xs, i, to))} onRemove={() => {
                  if (window.confirm('Remove this photo from the gallery?')) setItems((xs) => xs.filter((_, j) => j !== i));
                }} />
              </div>
            </div>
          </PhotoCard>
        ))}
      </ul>
    </EditorShell>
  );
}
