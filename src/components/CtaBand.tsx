import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  text?: ReactNode;
  children: ReactNode; // buttons
}

/** Teal call-to-action box that closes most pages. */
export function CtaBand({ title, text, children }: Props) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-box reveal">
          <h2 className="t-section text-white">{title}</h2>
          <span aria-hidden className="gold-rule" />
          {text && <p className="mx-auto mt-3.5 max-w-[520px] text-[1.03rem] text-white">{text}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
