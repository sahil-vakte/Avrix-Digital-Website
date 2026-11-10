import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { industries, industryHref, serviceHref, services, site, ui } from '../../content';
import type { Industry, Item, Section, Service } from '../../content/schemas';
import { Button, Em, Icon } from '../ui';

/** Small rounded label above headings, as on the reference design. */
export function Pill({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <p className="pill">
      {icon ? <Icon name={icon} /> : <span className="pill-dot" aria-hidden="true" />}
      {children}
    </p>
  );
}

/** Centre of the home hero: brand mark inside orbit rings with service nodes. */
export function HeroStage({ section }: { section: Section }) {
  const cards = section.hero_cards || [];
  const nodes = ['Grow', 'Build', 'Run', 'Secure', 'Hire'];
  const card = (c: (typeof cards)[number], i: number) => (
    <div className={`stage-card stage-card-${i + 1}`} key={c.title}>
      <p className="stage-eyebrow">
        {c.icon && <Icon name={c.icon} />}
        {c.eyebrow}
      </p>
      <p className="stage-title">{c.title}</p>
      <ul>
        {c.items.map((item) => (
          <li key={item}>
            <Check size={14} strokeWidth={3} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="hero-stage">
      <div className="stage-side">{cards.slice(0, 2).map(card)}</div>
      <div className="stage-orbit" aria-hidden="true">
        <svg viewBox="0 0 400 400" fill="none">
          <defs>
            <radialGradient id="stage-glow">
              <stop stopColor="#fd3f00" stopOpacity=".14" />
              <stop offset=".6" stopColor="#fb0d22" stopOpacity=".05" />
              <stop offset="1" stopColor="#fb0d22" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="196" fill="url(#stage-glow)" />
          <circle cx="200" cy="200" r="168" stroke="#f6cfc4" strokeDasharray="3 6" />
          <circle cx="200" cy="200" r="118" stroke="#f3d9d2" strokeDasharray="2 7" />
          <circle cx="200" cy="200" r="70" fill="#fff" stroke="#fbe1da" />
          <circle cx="368" cy="200" r="5" fill="#fd3f00" className="stage-dot" />
          <circle cx="82" cy="200" r="4" fill="#fb0d22" className="stage-dot" />
        </svg>
        <span className="stage-core">
          <img src={site.favicon} alt="" width="56" height="56" />
        </span>
        {nodes.map((n, i) => (
          <span className={`stage-node stage-node-${i + 1}`} key={n}>
            {n}
          </span>
        ))}
      </div>
      <div className="stage-side">{cards.slice(2, 4).map(card)}</div>
    </div>
  );
}

/** Right-hand card on service and industry heroes. Opens the existing enquiry dialog. */
export function QuoteCard({ title }: { title?: string }) {
  return (
    <aside className="quote-card" aria-label={ui.quoteTitle}>
      <Pill>{ui.quoteEyebrow}</Pill>
      <h2>{title ? `${ui.quoteTitlePrefix} ${title}` : ui.quoteTitle}</h2>
      <p>{ui.quoteText}</p>
      <ul>
        {[ui.quotePoint1, ui.quotePoint2, ui.quotePoint3].map((p) => (
          <li key={p}>
            <Check size={16} strokeWidth={3} aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
      <div className="quote-actions">
        <Button href="#enquiry">{ui.quoteCta}</Button>
        <Button href={`booking_url_or:/contact-us/`} variant="secondary">
          {site.booking_label}
        </Button>
      </div>
      <p className="quote-note">
        <ShieldCheck size={14} aria-hidden="true" />
        {site.response_promise}
      </p>
    </aside>
  );
}

/** Up to three short "standard" tiles under an inner-page hero. */
export function BadgeRow({ items }: { items?: Item[] | { title: string; text: string }[] }) {
  if (!items?.length) return null;
  return (
    <div className="badge-row">
      {items.map((b) => (
        <div key={b.title}>
          <strong>{b.title}</strong>
          <span>{b.text}</span>
        </div>
      ))}
    </div>
  );
}

export function ServiceCard({ s }: { s: Service }) {
  return (
    <article className="lumi-card service-tile">
      <span className="icon-tile">
        <Icon name={s.icon} />
      </span>
      <h3>
        <a href={serviceHref(s.slug)}>{s.title}</a>
      </h3>
      <p>{s.summary}</p>
      <a className="learn-more" href={serviceHref(s.slug)}>
        {ui.learnMore}
        <span className="sr-only">
          {' '}
          {ui.about} {s.title}
        </span>
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </article>
  );
}

/** Horizontal, scroll-snapping carousel of every service with arrow buttons. */
export function ServiceCarousel({ items = services }: { items?: Service[] }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.service-tile');
    el.scrollBy({ left: dir * ((card?.offsetWidth || 280) + 20), behavior: 'smooth' });
  };
  return (
    <div className="carousel">
      <button
        type="button"
        className="carousel-arrow prev"
        onClick={() => move(-1)}
        aria-label={ui.previous}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <div
        className="carousel-track"
        ref={track}
        role="region"
        aria-label={ui.services}
        tabIndex={0}
      >
        {items.map((s) => (
          <ServiceCard s={s} key={s.slug} />
        ))}
      </div>
      <button
        type="button"
        className="carousel-arrow next"
        onClick={() => move(1)}
        aria-label={ui.next}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Decorative industry illustration: icon in a gradient tile with orbiting service icons. */
export function IndustryArt({ industry }: { industry: Industry }) {
  const chips = industry.pillars.slice(0, 4);
  return (
    <div className="industry-art" aria-hidden="true">
      <svg viewBox="0 0 320 260" fill="none">
        <ellipse cx="160" cy="196" rx="132" ry="34" fill="#fff1ed" />
        <ellipse cx="160" cy="196" rx="92" ry="22" fill="#ffe3da" />
        <circle cx="160" cy="118" r="98" stroke="#f6cfc4" strokeDasharray="3 6" />
      </svg>
      <span className="industry-art-core">
        <Icon name={industry.icon} />
      </span>
      {chips.map((c, i) => (
        <span className={`industry-chip industry-chip-${i + 1}`} key={c.title}>
          {c.icon && <Icon name={c.icon} />}
        </span>
      ))}
    </div>
  );
}

/** Tabbed industries showcase. */
export function IndustriesShowcase() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number) => {
    const next = (i + industries.length) % industries.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') select(active + 1);
    else if (event.key === 'ArrowLeft') select(active - 1);
    else if (event.key === 'Home') select(0);
    else if (event.key === 'End') select(industries.length - 1);
    else return;
    event.preventDefault();
  };
  const ind = industries[active];
  return (
    <div className="industries-showcase">
      <div className="industry-tabs" role="tablist" aria-label={ui.industries} onKeyDown={onKey}>
        {industries.map((i, n) => (
          <button
            key={i.slug}
            ref={(el) => {
              tabs.current[n] = el;
            }}
            type="button"
            role="tab"
            id={`industry-tab-${i.slug}`}
            aria-selected={n === active}
            aria-controls="industry-panel"
            tabIndex={n === active ? 0 : -1}
            onClick={() => setActive(n)}
          >
            <Icon name={i.icon} />
            {i.title}
          </button>
        ))}
      </div>
      <div
        className="industry-panel lumi-card"
        id="industry-panel"
        role="tabpanel"
        aria-labelledby={`industry-tab-${ind.slug}`}
      >
        <IndustryArt industry={ind} />
        <div>
          <Pill icon={ind.icon}>{ind.eyebrow}</Pill>
          <h3>
            <Em text={ind.h1} />
          </h3>
          <p>{ind.summary}</p>
          <ul className="challenge-list">
            {ind.challenges.slice(0, 3).map((c) => (
              <li key={c.title}>
                <span className="icon-tile sm">{c.icon && <Icon name={c.icon} />}</span>
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.text}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="industry-panel-foot">
            <Button href={industryHref(ind.slug)} size="sm">
              {ui.learnMore}
              <span className="sr-only">
                {' '}
                {ui.about} {ind.title}
              </span>
            </Button>
            <span className="panel-arrows">
              <button
                type="button"
                onClick={() => setActive((active - 1 + industries.length) % industries.length)}
                aria-label={ui.previous}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setActive((active + 1) % industries.length)}
                aria-label={ui.next}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grid of service groups, each listing its services. */
export function ServicesMatrix({ groups }: { groups: NonNullable<Section['groups']> }) {
  return (
    <div className="services-matrix">
      {groups.map((g) => (
        <article className="lumi-card matrix-card" key={g.label}>
          <span className="icon-tile">
            <Icon name={g.icon} />
          </span>
          <h3>{g.label}</h3>
          <p>{g.text}</p>
          <ul>
            {g.items.map((slug) => (
              <li key={slug}>
                <a href={serviceHref(slug)}>
                  <ChevronRight size={14} aria-hidden="true" />
                  {services.find((s) => s.slug === slug)!.title}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

/** Row of standards and frameworks. Wording should say "we help you meet", never "certified". */
export function Frameworks({ items }: { items: Item[] }) {
  return (
    <ul className="frameworks">
      {items.map((f) => (
        <li key={f.title}>
          <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />
          <span>
            <strong>{f.title}</strong>
            {f.text && <small>{f.text}</small>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Icon cards, used for benefits, scope and deliverables on detail pages. */
export function IconCards({ items, columns = 3 }: { items: Item[]; columns?: 2 | 3 | 4 }) {
  return (
    <div className={`icon-cards cols-${columns}`}>
      {items.map((v, i) => (
        <article className="lumi-card" key={v.title}>
          <span className="icon-tile">
            {v.icon ? (
              <Icon name={v.icon} />
            ) : (
              <span className="tile-number">{String(i + 1).padStart(2, '0')}</span>
            )}
          </span>
          <h3>{v.title}</h3>
          <p>{v.text}</p>
          {v.services && (
            <div className="card-links">
              {v.services.map((slug) => (
                <a key={slug} href={serviceHref(slug)}>
                  {services.find((s) => s.slug === slug)!.title}
                  <ChevronRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

/** Numbered horizontal roadmap (wraps on smaller screens). */
export function Roadmap({ steps }: { steps: Item[] }) {
  return (
    <ol className={`roadmap steps-${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s.title}>
          <span className="roadmap-number">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Centred section heading with a pill eyebrow. */
export function SectionHead({
  eyebrow,
  title,
  intro,
  align = 'center',
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`section-head ${align}`} data-reveal>
      {eyebrow && <Pill>{eyebrow}</Pill>}
      {title && (
        <h2>
          <Em text={title} />
        </h2>
      )}
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}
