import type { ReactNode } from 'react';
import { resolveHref, site, ui } from '../../content';
import { track } from '../../lib/analytics';
export function Em({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/g)
        .map((v, i) => (v.startsWith('*') ? <em key={i}>{v.slice(1, -1)}</em> : v))}
    </>
  );
}
export function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <a
      className={`button ${variant} ${size}`}
      href={href === '#enquiry' ? '/contact-us/#enquiry' : resolveHref(href)}
      data-enquiry-trigger={
        href === '#enquiry' ||
        href === '/contact-us/' ||
        (href.startsWith('booking_url_or:') && !site.booking_url)
          ? 'true'
          : undefined
      }
      data-enquiry-mode={href.startsWith('booking_url_or:') ? 'call' : 'project'}
      onClick={() => {
        if (href.startsWith('booking_url_or:')) track('book_call_click');
      }}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`card ${className}`}>{children}</article>;
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export const Tag = Badge;
const iconFiles = import.meta.glob('../../../../content/assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
export function Icon({ name }: { name: string }) {
  const svg = iconFiles[`../../../../content/assets/icons/${name}.svg`];
  return svg ? (
    <span
      className="icon inline-icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : null;
}
export function Heading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
}) {
  return (
    <div className="section-heading" data-reveal>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && (
        <h2>
          <Em text={title} />
        </h2>
      )}
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}
export function Prose({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">{ui.home}</a>
      {items.map((i) => (
        <span key={i.href}>
          <span aria-hidden="true"> / </span>
          <a href={i.href}>{i.label}</a>
        </span>
      ))}
    </nav>
  );
}
