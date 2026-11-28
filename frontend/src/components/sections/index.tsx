import { useState, type ReactNode } from 'react';
import {
  content,
  services,
  posts,
  offerings,
  caseStudies,
  offeringPath,
  caseStudyHref,
  serviceHref,
  postHref,
  homeSection,
  nav,
  ui,
} from '../../content';
import type {
  Section,
  Item,
  Faq,
  Service,
  Post,
  Industry,
  Offering,
  CaseStudy,
  Block,
} from '../../content/schemas';
import { Button, Em, Heading, Icon } from '../ui';

/** Label of a cyber service group (Test & Find, Watch & Detect, ...). */
export const pillarLabel = (pillar: string) =>
  offerings.find((o) => o.group === pillar)?.title || '';
export const groupFor = (pillar: string) => offerings.find((o) => o.group === pillar);
export const pillarTitle = (pillar: string) =>
  offerings.find((o) => o.pillar === pillar && o.slug === 'index')?.title || '';

/** Card linking to a pillar hub, sub-page or cyber service group. */
export function OfferingGrid({
  items,
  columns = 3,
  withServices = false,
}: {
  items: Offering[];
  columns?: 2 | 3 | 4;
  withServices?: boolean;
}) {
  return (
    <div className={`grid cards-${columns} stagger offering-grid`}>
      {items.map((o) => (
        <article className={`card offering-card pillar-${o.pillar}`} key={o.pillar + o.slug}>
          <Icon name={o.icon} />
          <h3>
            <a href={offeringPath(o)}>{o.title}</a>
          </h3>
          <p>{o.summary}</p>
          {withServices && o.services && (
            <ul className="link-list">
              {o.services.map((slug) => (
                <li key={slug}>
                  <a href={serviceHref(slug)}>{services.find((s) => s.slug === slug)!.title}</a>
                </li>
              ))}
            </ul>
          )}
          <a className="more" href={offeringPath(o)} aria-label={`${ui.learnMore}: ${o.title}`}>
            {ui.learnMore} <span aria-hidden="true">→</span>
          </a>
        </article>
      ))}
    </div>
  );
}

/** Thumbnail artwork for a case study card. */
export function caseThumb(c: CaseStudy) {
  const bySlug: Record<string, string> = {
    'ai-voice-receptionist-platform': 'voice',
    'ai-dental-practice-workspace': 'voice',
    'computer-vision-exercise-coach': 'waves',
    'warehouse-inventory-platform': 'logistics',
    'retail-commerce-fulfilment': 'cubes',
    'ai-marketing-automation-mcp': 'ai-solutions',
    'learning-management-platform': 'digital-transformation',
  };
  const key =
    bySlug[c.slug] ||
    (c.sector === 'healthcare'
      ? 'healthcare'
      : c.sector === 'retail-logistics'
        ? 'logistics'
        : 'cubes');
  return `/media/art/thumb-${key}.svg`;
}

export function CaseStudyCard({ c }: { c: CaseStudy }) {
  return (
    <article className="card case-card">
      <div className="card-media" aria-hidden="true">
        <img src={caseThumb(c)} alt="" width="480" height="260" loading="lazy" />
      </div>
      <p className="card-label">{c.industry}</p>
      <h3>
        <a href={caseStudyHref(c.slug)}>{c.title}</a>
      </h3>
      <p>{c.summary}</p>
      <ul className="tags small">
        {c.technology.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <a
        className="more"
        href={caseStudyHref(c.slug)}
        aria-label={`${ui.readCaseStudy}: ${c.title}`}
      >
        {ui.viewCaseStudy} <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

/** Large horizontal case study card used on hub pages. */
export function FeaturedCase({ c }: { c: CaseStudy }) {
  return (
    <article className="featured-case">
      <img src={caseThumb(c)} alt="" width="480" height="260" loading="lazy" />
      <div>
        <p className="card-label">{c.industry}</p>
        <h3>
          <a href={caseStudyHref(c.slug)}>{c.title}</a>
        </h3>
        <p>{c.summary}</p>
        <span className="button primary sm" aria-hidden="true">
          {ui.viewCaseStudy} <span>→</span>
        </span>
      </div>
    </article>
  );
}

/** Industry cards with icon and arrow, linking to each sector page. */
export function IndustriesGrid() {
  return (
    <ul className="industry-links">
      {content.industries.map((i) => (
        <li key={i.slug}>
          <a href={`/industries/${i.slug}/`}>
            <Icon name={i.icon} />
            <span>{i.title}</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Latest published articles with artwork. */
export function InsightsGrid({ count = 3 }: { count?: number }) {
  const art: Record<string, string> = {
    compliance: 'cyber-security',
    threats: 'waves',
    guides: 'digital-transformation',
  };
  return (
    <div className="grid cards-3 stagger insight-grid">
      {posts.slice(0, count).map((p, n) => (
        <article className="card insight-card" key={p.slug}>
          <div className="card-media" aria-hidden="true">
            <img
              src={`/media/art/thumb-${n === 2 ? 'cubes' : art[p.category] || 'ai-solutions'}.svg`}
              alt=""
              width="480"
              height="260"
              loading="lazy"
            />
          </div>
          <h3>
            <a href={postHref(p.slug)}>{p.title}</a>
          </h3>
          <p>{p.excerpt}</p>
          <span className="more" aria-hidden="true">
            {ui.readInsight} →
          </span>
        </article>
      ))}
    </div>
  );
}

export function CaseStudyGrid({ slugs }: { slugs?: string[] }) {
  const items = slugs ? slugs.map((s) => caseStudies.find((c) => c.slug === s)!) : caseStudies;
  return (
    <div className="grid cards-3 stagger case-grid">
      {items.map((c) => (
        <CaseStudyCard key={c.slug} c={c} />
      ))}
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={headers.join(', ')}>
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th scope="col" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((cell, i) =>
                i === 0 ? (
                  <th scope="row" key={i}>
                    {cell}
                  </th>
                ) : (
                  <td key={i}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders a structured content block from a pillar page. */
export function BlockSection({ block, tone }: { block: Block; tone?: 'light' | 'tint' }) {
  const items = block.items || [];
  return (
    <SectionShell
      id={block.id}
      tone={block.tone || tone}
      eyebrow={block.eyebrow}
      title={block.title}
      intro={block.intro}
    >
      {block.style === 'band' ? (
        <div className="info-band">
          {block.art && <img src={block.art} alt="" width="480" height="260" loading="lazy" />}
          <ul className="band-points">
            {items.map((i) => (
              <li key={i.title}>
                <strong>{i.title}</strong>
                <span>{i.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : block.style === 'table' && block.table ? (
        <DataTable headers={block.table.headers} rows={block.table.rows} />
      ) : block.style === 'checklist' ? (
        <ul className="check-cards stagger">
          {items.map((i) => (
            <li key={i.title} className="card">
              <strong>{i.title}</strong>
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      ) : block.style === 'points' ? (
        <ul className="standard-chips">
          {items.map((i) => (
            <li key={i.title}>
              <strong>{i.title}</strong>
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <CardGrid
          items={items}
          columns={block.columns || 3}
          numbered={block.style === 'numbered'}
        />
      )}
    </SectionShell>
  );
}

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
  art,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  aside?: ReactNode;
  tags?: string[];
  footer?: ReactNode;
  actions?: boolean;
  /** Decorative hero artwork shown beside the copy when there is no aside. */
  art?: string;
  secondary?: { label: string; href: string };
}) {
  const artwork = aside ? null : art || '/media/art/hero-page.svg';
  return (
    <section className={`page-hero ${aside ? 'with-aside' : 'with-art'}`}>
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
              <Button href="#enquiry">{ui.bookConsultation}</Button>
              {secondary && (
                <Button href={secondary.href} variant="secondary">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}
          {tags && <Tags items={tags} />}
          {footer}
        </div>
        {aside}
        {artwork && (
          <div className="hero-art" aria-hidden="true">
            <img src={artwork} alt="" width="760" height="600" fetchPriority="high" />
          </div>
        )}
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
    <section className="cta-band" aria-labelledby="cta-band-title">
      <div className="container">
        <div className="cta-panel">
          <div className="cta-copy">
            <h2 id="cta-band-title">
              <Em text={s.title!} />
            </h2>
            <p>{s.text}</p>
            <div className="actions">
              <Button href="#enquiry" variant="light">
                {ui.bookConsultation}
              </Button>
              <Button href="/contact-us/" variant="outline-light">
                {ui.contactUs}
              </Button>
            </div>
          </div>
          <img
            className="cta-art"
            src="/media/art/band-ribbon.svg"
            alt=""
            width="900"
            height="300"
            loading="lazy"
          />
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
          <span className="pill success">{ui.threatBlocked}</span>
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
        <Icon name="incident-response" />
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
