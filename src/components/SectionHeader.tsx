import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  children?: ReactNode;
  label?: string;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h2' | 'h1';
}

export function SectionHeader({ title, children, label, align = 'center', className = '', as: H = 'h2' }: Props) {
  const center = align === 'center';
  return (
    <div className={`reveal ${center ? 'mx-auto max-w-[620px] text-center' : 'max-w-2xl'} ${className}`}>
      {label && <span className="pill-label mb-4">{label}</span>}
      <H className="t-section">{title}</H>
      {center && <span aria-hidden className="gold-rule" />}
      {children && <div className="mt-3 text-slate-muted">{children}</div>}
    </div>
  );
}
