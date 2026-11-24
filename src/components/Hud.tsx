import type { ReactNode } from 'react';
import './hud.css';

export type Accent = 'moss' | 'saffron' | 'plum';

export function Panel({
  title,
  code,
  tone = 'moss',
  dark = false,
  children,
}: {
  title: string;
  code?: string;
  tone?: Accent;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`hud-panel ${dark ? 'hud-panel--dark' : ''} hud-panel--${tone}`}>
      <header className="panel-head">
        <h3 className="panel-head__title">{title}</h3>
        {code && <span className="panel-head__code mono">{code}</span>}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: Accent }) {
  return (
    <div className="stat">
      <span className={`stat__value ${tone ? `stat__value--${tone}` : ''}`}>{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

export function SectionHeading({
  index,
  title,
  subtitle,
  tone = 'moss',
}: {
  index: string;
  title: string;
  subtitle?: string;
  tone?: Accent;
}) {
  return (
    <div className={`section-heading section-heading--${tone}`}>
      <span className="section-heading__index mono">{index}</span>
      <div>
        <h1 className="section-heading__title">{title}</h1>
        {subtitle && <p className="section-heading__sub">{subtitle}</p>}
      </div>
    </div>
  );
}
