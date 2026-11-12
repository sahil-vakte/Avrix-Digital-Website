import { useState, type ReactNode } from 'react';
import {
  content,
  services,
  posts,
  serviceHref,
  postHref,
  homeSection,
  nav,
  ui,
} from '../../content';
import type { Section, Item, Faq, Service, Post, Industry } from '../../content/schemas';
import { Button, Em, Heading, Icon } from '../ui';

export const pillarLabel = (pillar: string) =>
  nav.mega_menu.find((g) => g.pillar === pillar)?.label || '';

/** Light, centred page hero used by every inner page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  aside,
  tags,
  footer,
  actions = true,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  aside?: ReactNode;
  tags?: string[];
  footer?: ReactNode;
  actions?: boolean;
}) {
  return (
    <section className={`page-hero ${aside ? 'with-aside' : ''}`}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="container page-hero-grid">
        <div className="page-hero-copy">
          {children}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>
            <Em text={title} />
          </h1>
          {lead && <p className="lead">{lead}</p>}
          {actions && (
            <div className="actions">
              <Button href={nav.header_cta.href!}>{nav.header_cta.label}</Button>
              <Button href="#enquiry" variant="secondary">
                {ui.openEnquiry}
              </Button>
            </div>
          )}
          {tags && <Tags items={tags} />}
          {footer}
        </div>
        {aside}
      </div>
    </section>
  );
}

/** "Request an assessment" card shown beside service and industry heroes. */
export function RequestCard({ title }: { title?: string }) {
  return (
    <aside className="request-card" aria-label={title || ui.requestAssessment}>
      <p className="eyebrow">{ui.freeConsultation}</p>
      <h2>{title || ui.requestAssessment}</h2>
      <p>{ui.requestAssessmentText}</p>
      <ul className="check-list">
        <li>{ui.trustScope}</li>
        <li>{ui.trustNda}</li>
        <li>{ui.trustReport}</li>
      </ul>
      <Button href="#enquiry">{ui.requestAssessment}</Button>
    </aside>
  );
}

export function SectionShell({
  id,
  tone = 'light',
  eyebrow,
  title,
  intro,
  children,
  className = '',
}: {
  id?: string;
  tone?: 'light' | 'tint' | 'dark';
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`section ${tone} ${className}`} id={id}>
      <div className="container">
        {(title || eyebrow) && <Heading eyebrow={eyebrow} title={title} intro={intro} />}
        {children}
      </div>
    </section>
  );
}

export function ServiceCard({ s }: { s: Service }) {
  return (
    <article className="card service-card">
      <Icon name={s.icon} />
      <h3>
        <a href={serviceHref(s.slug)}>{s.title}</a>
      </h3>
      <p>{s.summary}</p>
      <a className="more" href={serviceHref(s.slug)} aria-label={`${ui.learnMore}: ${s.title}`}>
        {ui.learnMore} <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

export function ServiceGrid({ items = services }: { items?: Service[] }) {
  return (
    <div className="grid cards-3 stagger">
      {items.map((s) => (
        <ServiceCard key={s.slug} s={s} />
      ))}
    </div>
  );
}

/** Generic card grid: icon or number, title, text, optional bullets and link. */
export function CardGrid({
  items,
  columns = 3,
  numbered = false,
  className = '',
}: {
  items: Item[];
  columns?: 2 | 3 | 4;
  numbered?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid cards-${columns} stagger ${className}`}>
      {items.map((v, i) => (
        <article className="card" key={v.title}>
          {numbered ? (
            <span className="card-number">{v.n || String(i + 1).padStart(2, '0')}</span>
          ) : v.icon ? (
            <Icon name={v.icon} />
          ) : null}
          {v.label && <p className="card-label">{v.label}</p>}
          <h3>{v.href ? <a href={v.href}>{v.title}</a> : <Em text={v.title} />}</h3>
          <p>{v.text}</p>
          {v.bullets && (
            <ul className="check-list">
              {v.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {v.href && (
            <a className="more" href={v.href} aria-label={`${ui.learnMore}: ${v.title}`}>
              {ui.learnMore} <span aria-hidden="true">→</span>
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

/** Vertical numbered timeline, as used for engagement models and lifecycles. */
export function Timeline({ steps }: { steps: Item[] }) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => (
        <li key={s.title} data-reveal>
          <span className="timeline-dot">{i + 1}</span>
          <div className="card">
            {s.label && <p className="card-label">{s.label}</p>}
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Horizontal numbered process steps. */
export function Process({ steps }: { steps: Item[] }) {
  return (
    <ol className={`process steps-${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s.title} className="card" data-reveal>
          <span className="card-number">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function FrameworkGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid cards-4 framework-grid stagger">
      {items.map((f) => (
        <div className="framework" key={f.title}>
          {f.icon && <Icon name={f.icon} />}
          {f.label && <p className="card-label">{f.label}</p>}
          <strong>{f.title}</strong>
          <span>{f.text}</span>
        </div>
      ))}
    </div>
  );
}

export function FAQ({ items, search = '' }: { items: Faq[]; search?: string }) {
  const matches = items.filter((f) =>
    (f.q + ' ' + f.a).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="faq-list">
      {matches.map((f, i) => (
        <details key={f.q} open={i === 0 && !search ? true : undefined}>
          <summary>
            {f.q}
            <span className="faq-icon" aria-hidden="true" />
          </summary>
          <div className="faq-answer">
            <p>{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({
  items,
  title,
  intro,
}: {
  items: Faq[];
  title?: string;
  intro?: string;
}) {
  if (!items.length) return null;
  return (
    <SectionShell
      id="faqs"
      eyebrow={ui.faqsTitle}
      title={title || 'Everything you need to *know*'}
      intro={intro}
    >
      <div className="narrow">
        <FAQ items={items} />
      </div>
    </SectionShell>
  );
}

export function BlogTeaser({ items = posts.slice(0, 3) }: { items?: Post[] }) {
  const categories = content.pages.find((p) => p.slug === 'blog')?.categories || [];
  return (
    <div className="grid cards-3 blog-cards stagger">
      {items.map((p) => (
        <article className="card blog-card" key={p.slug}>
          <a href={postHref(p.slug)} tabIndex={-1} aria-hidden="true">
            <img src={p.cover.src} alt="" width="1600" height="900" loading="lazy" />
          </a>
          <p className="card-label">
            {categories.find((c) => c.key === p.category)?.label} · {p.readTime} {ui.minutes}
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

/** Closing call to action shown at the foot of every page. */
export function CtaBand() {
  const s = homeSection('final_cta');
  return (
    <section className="cta-band">
      <div className="container">
        <div className="cta-panel">
          <h2>
            <Em text={s.title!} />
          </h2>
          <p className="lead">{s.text}</p>
          {s.promises && (
            <ul className="cta-promises">
              {s.promises.map((p) => (
                <li key={p.title}>
                  <strong>{p.title}</strong>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="actions">
            <Button href={s.primary_cta!.href!}>{s.primary_cta!.label}</Button>
            <Button href="#enquiry" variant="secondary">
              {ui.openEnquiry}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Ticker({ section }: { section: Section }) {
  return (
    <div className="ticker" aria-label={ui.activeDefence}>
      <div className="ticker-track">
        {[0, 1].map((n) => (
          <div key={n} aria-hidden={n === 1 ? 'true' : undefined}>
            {(section.items as string[]).map((i) => (
              <span key={i}>
                <i aria-hidden="true" />
                {i}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Illustrative security dashboard beside the homepage hero. */
export function HeroDashboard({ section }: { section: Section }) {
  return (
    <div className="hero-dashboard" aria-label={section.label} role="img">
      <div className="dash-card dash-telemetry">
        <p className="card-label">{ui.telemetry}</p>
        <div className="dash-map" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="dash-row">
          <span className="pill danger">{ui.threatBlocked}</span>
          <span>{ui.activeDefence}</span>
        </div>
      </div>
      <div className="dash-core" aria-hidden="true">
        <div className="dash-shield">
          <Icon name="managed-security" />
        </div>
        {section.signal_chips?.map((c, i) => (
          <span key={c} className={`dash-node node-${i}`}>
            {c}
          </span>
        ))}
      </div>
      <div className="dash-card dash-posture">
        <p className="card-label">{ui.postureTitle}</p>
        <div className="dash-score">
          <span className="score-ring" aria-hidden="true" />
          <div>
            <strong>{ui.socMonitoring}</strong>
            <span className="pill success">{ui.activeDefence}</span>
          </div>
        </div>
      </div>
      <div className="dash-card dash-compliance">
        <p className="card-label">{ui.complianceStatus}</p>
        <ul>
          {(section.items as Item[] | undefined)?.map((i) => (
            <li key={i.title}>
              <span>{i.title}</span>
              <em>{i.text}</em>
            </li>
          ))}
        </ul>
      </div>
      <p className="dash-caption">{section.label}</p>
    </div>
  );
}

export function IndustryTabs({ industries }: { industries: Industry[] }) {
  const [active, setActive] = useState(0);
  const i = industries[active];
  return (
    <div className="industry-tabs">
      <div className="tab-row" role="tablist" aria-label={ui.industries}>
        {industries.map((ind, n) => (
          <button
            key={ind.slug}
            role="tab"
            id={`tab-${ind.slug}`}
            aria-selected={n === active}
            aria-controls={`panel-${ind.slug}`}
            tabIndex={n === active ? 0 : -1}
            onClick={() => setActive(n)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const next =
                (n + (e.key === 'ArrowRight' ? 1 : -1) + industries.length) % industries.length;
              setActive(next);
              document.getElementById(`tab-${industries[next].slug}`)?.focus();
            }}
          >
            <Icon name={ind.icon} />
            {ind.title}
          </button>
        ))}
      </div>
      <div
        className="card tab-panel"
        role="tabpanel"
        id={`panel-${i.slug}`}
        aria-labelledby={`tab-${i.slug}`}
      >
        <div className="tab-visual" aria-hidden="true">
          <div className="tab-visual-icon">
            <Icon name={i.icon} />
          </div>
          {i.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div>
          <p className="card-label">{i.eyebrow}</p>
          <h3>{i.tagline}</h3>
          <p>{i.summary}</p>
          <ul className="point-list">
            {i.points.map((p) => (
              <li key={p.title}>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
          <Button href={`/industries/${i.slug}/`}>{ui.learnMore}</Button>
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ section }: { section: Section }) {
  const testimonials = content.testimonials.filter((t) => t.verified);
  if (!testimonials.length) return null;
  return (
    <SectionShell eyebrow={section.eyebrow} title={section.title} tone="tint">
      <div className="grid cards-3">
        {testimonials.map((t) => (
          <blockquote className="card quote" key={t.id}>
            <p>{t.quote}</p>
            <cite>
              <strong>{t.name}</strong>
              <span>
                {t.role}
                {t.company && `, ${t.company}`}
              </span>
            </cite>
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}

/** Filterable, searchable directory of every service. */
export function ServicesDirectory() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const page = content.pages.find((p) => p.slug === 'services')!;
  const matches = services.filter(
    (s) =>
      (filter === 'all' || s.pillar === filter) &&
      (s.title + ' ' + s.summary).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="directory-bar">
        <div className="filter-chips" role="group" aria-label={ui.directory}>
          {page.filters!.map((f) => (
            <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
              <span>
                {f.key === 'all'
                  ? services.length
                  : services.filter((s) => s.pillar === f.key).length}
              </span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">{page.search_placeholder}</span>
          <input
            type="search"
            value={query}
            placeholder={page.search_placeholder}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="result-count" role="status" aria-live="polite">
        {matches.length} {ui.servicesCount}
      </p>
      <ServiceGrid items={matches} />
    </>
  );
}

export function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function SocWidget() {
  const w = nav.soc_widget;
  const [open, setOpen] = useState(false);
  return (
    <div className={`soc-widget ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="soc-toggle"
        aria-expanded={open}
        aria-controls="soc-widget-panel"
        onClick={() => setOpen(!open)}
      >
        <Icon name="managed-security" />
        <span>
          <small>
            <i aria-hidden="true" />
            {w.label}
          </small>
          {w.title}
        </span>
      </button>
      <div className="soc-panel" id="soc-widget-panel" hidden={!open}>
        <ul className="check-list">
          {w.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <div className="actions">
          <Button href={w.primary.href!} size="sm">
            {w.primary.label}
          </Button>
          <Button href={w.secondary.href!} size="sm" variant="secondary">
            {w.secondary.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
