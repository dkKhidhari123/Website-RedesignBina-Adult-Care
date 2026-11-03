import { Plus } from 'lucide-react';
import type { Faq as FaqItem } from '../data/content';

/** FAQ list using native <details>, so it works without JS and with assistive tech. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="t-subtitle">{item.q}</span>
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-brand-700 transition-transform duration-300 group-open:rotate-45">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </summary>
          <p className="max-w-prose pb-6 pr-12 text-slate-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
