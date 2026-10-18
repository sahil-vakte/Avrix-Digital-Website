import { SplitText } from '../motion/SplitText';
import { useState } from 'react';
import { content, services, posts, serviceHref, postHref, homeSection, ui } from '../../content';
import type { Section, Item, Faq, Service, Post } from '../../content/schemas';
import { Badge, Button, Card, Em, Heading, Icon } from '../ui';
import ConnectedVisual from './ConnectedVisual';
export function Hero({
  section,
  children,
  home = false,
}: {
  section: Section;
  children?: React.ReactNode;
  home?: boolean;
}) {
  const title = section.h1 || section.title || '';
  return (
    <section className={`hero dark ${home ? 'hero-home' : ''}`}>
      <div className="hero-mesh" aria-hidden="true" />
      <div className="container hero-content">
        <div className="hero-layout">
          <div className="hero-copy">
            {children}
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <SplitText text={title} />
            {section.lead && <p className="lead">{section.lead}</p>}
            <div className="actions">
              {section.primary_cta && (
                <Button href={section.primary_cta.href!}>{section.primary_cta.label}</Button>
              )}
              {section.secondary_cta && (
                <Button href={section.secondary_cta.href!} variant="secondary">
                  {section.secondary_cta.label}
                </Button>
              )}
            </div>
          </div>
          {home && <ConnectedVisual />}
        </div>
        {section.signal_chips && (
          <div className="signals" aria-hidden="true">
            {section.signal_chips.map((c, i) => (
              <span key={c} style={{ animationDelay: `${i * -2}s` }}>
                <i />
                {c}
              </span>
            ))}
          </div>
        )}
        {section.pillar_tabs && (
          <div className="pillar-tabs">
            {section.pillar_tabs.map((p, i) => (
              <a key={p.label} href={p.href}>
                <span className="eyebrow">0{i + 1}</span>
                <h2>
                  {p.label}
                  <span aria-hidden="true">↗</span>
                </h2>
                <p>{p.text}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
export function ServiceGrid({
  items = services,
  rich = false,
}: {
  items?: Service[];
  rich?: boolean;
}) {
  return (
    <div className="grid cards stagger">
      {items.map((s) => (
        <Card key={s.slug} className={`service-card service-${s.pillar}`}>
          <div className="card-top">
            <Icon name={s.icon} />
            <span className="eyebrow">0{s.order}</span>
          </div>
          <h3>
            <a href={serviceHref(s.slug)}>{s.title}</a>
          </h3>
          <p>{s.summary}</p>
          {rich && (
            <ul>
              {s.outcomes.slice(0, 3).map((o) => (
                <li key={o.title}>{o.title}</li>
              ))}
            </ul>
          )}
          {rich && s.pricing?.price_from != null && (
            <p className="price">
              {ui.from} £{s.pricing.price_from.toLocaleString('en-GB')}
            </p>
          )}
          <a className="explore" href={serviceHref(s.slug)} aria-label={`${ui.explore} ${s.title}`}>
            {ui.explore} <span aria-hidden="true">↗</span>
          </a>
        </Card>
      ))}
    </div>
  );
}
export function ValueGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid values stagger">
      {items.map((v, i) => (
        <Card key={v.title} className={v.services ? 'pathway-card' : 'value-card'}>
          {v.icon ? <Icon name={v.icon} /> : <span className="eyebrow">0{i + 1}</span>}
          <h3>
            <Em text={v.title} />
          </h3>
          <p>{v.text}</p>
          {v.services && (
            <div className="service-links">
              {v.services.map((slug) => (
                <a key={slug} href={serviceHref(slug)}>
                  {services.find((s) => s.slug === slug)?.title} ↗
                </a>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
export function Process({ steps }: { steps: Item[] }) {
  return (
    <div className="process">
      <svg viewBox="0 0 1200 30" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 15 H1200" pathLength="1" data-draw="" />
      </svg>
      <ol className="grid">
        {steps.map((s, i) => (
          <li key={s.title} data-reveal>
            <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
            {s.icon && <Icon name={s.icon} />}
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
export function FAQ({ items, search = '' }: { items: Faq[]; search?: string }) {
  const matches = items.filter((f) =>
    (f.q + ' ' + f.a).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="faq-list">
      {matches.map((f) => (
        <details key={f.q}>
          <summary>
            {f.q}
            <span aria-hidden="true">+</span>
          </summary>
          <div className="faq-answer">
            <p>{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
export function BlogTeaser({ items = posts.slice(0, 3) }: { items?: Post[] }) {
  return (
    <div className="grid blog-cards stagger">
      {items.map((p) => (
        <article key={p.slug}>
          <a href={postHref(p.slug)}>
            <img src={p.cover.src} alt={p.cover.alt} width="1600" height="900" loading="lazy" />
          </a>
          <p className="eyebrow">
            {p.category.replace(/-/g, ' ')} · {p.readTime} {ui.minutes}
          </p>
          <h3>
            <a href={postHref(p.slug)}>{p.title}</a>
          </h3>
          <p>{p.excerpt}</p>
          <time dateTime={p.published}>
            {new Date(p.published).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </time>
        </article>
      ))}
    </div>
  );
}
export function CtaBand() {
  const s = homeSection('cta_band');
  return (
    <section className="cta-band dark">
      <div className="container">
        <Heading title={s.title} intro={s.text} />
        <div className="actions">
          <Button href={s.primary_cta!.href!}>{s.primary_cta!.label}</Button>
          <Button variant="secondary" href={s.secondary_cta!.href!}>
            {s.secondary_cta!.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
export function Marquee({ section }: { section: Section }) {
  return (
    <div className="marquee">
      <p className="eyebrow">{section.label}</p>
      <div className="marquee-track">
        {[0, 1].map((n) => (
          <div key={n} aria-hidden={n === 1 ? 'true' : undefined}>
            {(section.items as string[]).map((i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
export function Proof({ section }: { section: Section }) {
  const stats = content.stats.filter((s) => s.verified);
  const testimonials = content.testimonials.filter((t) => t.verified);
  if (!stats.length && !testimonials.length)
    return (
      <>
        <Heading eyebrow={section.eyebrow} title={section.promises_title} />
        <ValueGrid items={section.promises!} />
      </>
    );
  return (
    <>
      <Heading eyebrow={section.eyebrow} title={section.title} />
      <div className="grid">
        {stats.map((s) => (
          <div key={s.id}>
            <strong className="stat" data-count={s.value}>
              {s.value}
            </strong>
            <p>{s.label}</p>
            {s.source_note && <small>{s.source_note}</small>}
          </div>
        ))}
      </div>
      <div className={testimonials.length >= 3 ? 'testimonials snap' : 'testimonials grid'}>
        {testimonials.map((t) => (
          <blockquote key={t.id}>
            <p>{t.quote}</p>
            <cite>
              {t.name} — {t.role}
              {t.company && `, ${t.company}`}
            </cite>
          </blockquote>
        ))}
      </div>
    </>
  );
}
export function ServicesFilter({ rich = true }: { rich?: boolean }) {
  const [filter, setFilter] = useState('all');
  const options = content.pages.find((p) => p.slug === 'services')!.filters!;
  return (
    <>
      <div className="service-explorer-bar">
        <div className="filter-chips" role="group" aria-label={ui.services}>
          {options.map((f) => (
            <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <p className="result-count" role="status" aria-live="polite">
          {services.filter((s) => filter === 'all' || s.pillar === filter).length}{' '}
          {ui.serviceResults}
        </p>
      </div>
      <ServiceGrid
        rich={rich}
        items={services.filter((s) => filter === 'all' || s.pillar === filter)}
      />
    </>
  );
}
export function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((t) => (
        <Badge key={t}>{t}</Badge>
      ))}
    </div>
  );
}
