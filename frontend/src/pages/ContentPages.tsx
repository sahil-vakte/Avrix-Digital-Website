import rawBodies from '../content/generated-pages.json';
import { lazy, Suspense, useState } from 'react';
import { content, page, services, posts, site, ui, homeSection, nav } from '../content';
import type { RouteRecord } from '../content/routes';
import type { Item } from '../content/schemas';
import {
  PageHero,
  SectionShell,
  CardGrid,
  ServiceGrid,
  ServicesDirectory,
  FAQ,
  FaqSection,
  FrameworkGrid,
  BlogTeaser,
  Timeline,
} from '../components/sections';
import { Breadcrumbs, Button, Em, Icon, Prose } from '../components/ui';
const pageBodies = rawBodies as Record<
  string,
  { html: string; toc: { id: string; text: string }[] }
>;
const BlogPost = lazy(() => import('./BlogPost'));
const Legal = lazy(() => import('./Legal'));
const EnquiryForm = lazy(() => import('../components/forms/EnquiryForm'));

function Highlights({ items, stats = false }: { items: Item[]; stats?: boolean }) {
  return (
    <ul className={stats ? 'hero-stats' : 'trust-strip'}>
      {items.map((h) => (
        <li key={h.title}>
          <strong>{h.title}</strong>
          <span>{h.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ContentPages({ route }: { route: RouteRecord }) {
  const [search, setSearch] = useState('');
  const p = route.slug
    ? [...content.pages, ...content.legal].find((p) => p.slug === route.slug)
    : undefined;
  const blog = page('blog');
  const crumbs = p ? [{ label: route.h1.replace(/\*/g, ''), href: route.path }] : [];
  const hero = (
    <PageHero eyebrow={p?.eyebrow} title={route.h1} lead={p?.lead} actions={false}>
      {route.kind !== '404' && crumbs.length > 0 && (
        <Breadcrumbs items={[{ label: p?.eyebrow || crumbs[0].label, href: route.path }]} />
      )}
    </PageHero>
  );

  if (route.kind === 'about')
    return (
      <>
        <PageHero
          eyebrow={p!.eyebrow}
          title={p!.h1}
          lead={p!.lead}
          footer={p!.highlights && <Highlights items={p!.highlights} stats />}
        >
          <Breadcrumbs items={[{ label: p!.eyebrow!, href: route.path }]} />
        </PageHero>
        <section className="section light">
          <div className="container split">
            <Prose html={pageBodies[p!.slug].html} />
            <CardGrid items={p!.values!} columns={2} numbered />
          </div>
        </section>
        {p!.sections?.map((s, i) => (
          <SectionShell
            key={s.title}
            id={s.id}
            tone={i % 2 ? 'light' : 'tint'}
            eyebrow={s.eyebrow}
            title={s.title}
            intro={s.intro}
          >
            {s.id === 'standards' ? (
              <FrameworkGrid items={s.items} />
            ) : (
              <CardGrid items={s.items} columns={4} />
            )}
          </SectionShell>
        ))}
        {!!p!.team?.length && (
          <SectionShell title="Our *team*">
            <div className="grid cards-3">
              {p!.team.map((t) => (
                <article className="card" key={t.name}>
                  <img
                    src={t.photo.src}
                    alt={t.photo.alt}
                    width="400"
                    height="500"
                    loading="lazy"
                  />
                  <h3>{t.name}</h3>
                  <p className="card-label">{t.role}</p>
                  <p>{t.bio}</p>
                  {t.linkedin && <a href={t.linkedin}>LinkedIn</a>}
                </article>
              ))}
            </div>
          </SectionShell>
        )}
        <SectionShell
          eyebrow={homeSection('engagement').eyebrow}
          title={homeSection('engagement').title}
        >
          <Timeline steps={homeSection('engagement').items as Item[]} />
        </SectionShell>
      </>
    );

  if (route.kind === 'services')
    return (
      <>
        <PageHero eyebrow={p!.eyebrow} title={p!.h1} lead={p!.lead}>
          <Breadcrumbs items={[{ label: ui.services, href: '/services/' }]} />
        </PageHero>
        <SectionShell
          eyebrow={homeSection('services_carousel').eyebrow}
          title={`Our core *capabilities*`}
          intro={homeSection('services_carousel').intro}
        >
          <ServiceGrid
            items={services.filter((s) =>
              [
                'penetration-testing',
                'cloud-security-assessment',
                'managed-security',
                'red-teaming',
                'cyber-essentials',
                'incident-response',
              ].includes(s.slug),
            )}
          />
        </SectionShell>
        {nav.mega_menu.map((g, i) => (
          <SectionShell
            key={g.pillar}
            id={g.pillar}
            tone={i % 2 ? 'light' : 'tint'}
            eyebrow={`${String(i + 1).padStart(2, '0')} / ${g.items.length} ${ui.servicesCount}`}
            title={g.label}
            intro={g.blurb}
          >
            <ServiceGrid items={g.items.map((slug) => services.find((s) => s.slug === slug)!)} />
          </SectionShell>
        ))}
        <SectionShell id="directory" eyebrow={ui.directory} title={`Find the *right service*`}>
          <ServicesDirectory />
        </SectionShell>
        <section className="section tint">
          <div className="container">
            <div className="advisory card">
              <div>
                <p className="eyebrow">{ui.openEnquiry}</p>
                <h2>
                  <Em text="Not sure where to start? *Talk to a specialist.*" />
                </h2>
                <Highlights items={p!.highlights!} />
              </div>
              <Button href={nav.header_cta.href!} size="lg">
                {nav.header_cta.label}
              </Button>
            </div>
          </div>
        </section>
        <FaqSection items={p!.faqs || []} />
      </>
    );

  if (route.kind === 'faqs')
    return (
      <>
        {hero}
        <section className="section light">
          <div className="container narrow">
            <label className="search-field wide">
              <span className="sr-only">{ui.search}</span>
              <input
                id="faq-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={p!.search_placeholder}
              />
            </label>
            {[
              ...content.faqs.groups,
              ...services.map((s) => ({ key: s.slug, label: s.title, items: s.faqs })),
            ].map((g) => (
              <section className="faq-group" key={g.key}>
                <h2>{g.label}</h2>
                <FAQ items={g.items} search={search} />
              </section>
            ))}
          </div>
        </section>
      </>
    );

  if (route.kind === 'contact')
    return (
      <>
        <PageHero
          eyebrow={p!.eyebrow}
          title={p!.h1}
          lead={p!.lead}
          actions={false}
          footer={p!.highlights && <Highlights items={p!.highlights} />}
        >
          <Breadcrumbs items={[{ label: p!.eyebrow!, href: route.path }]} />
        </PageHero>
        <section className="section light" id="enquiry">
          <div className="container contact-grid">
            <div className="card form-card">
              <h2>{p!.form!.title}</h2>
              <Suspense>
                <EnquiryForm />
              </Suspense>
            </div>
            <aside className="contact-side" aria-label={ui.emailUs}>
              <div className="card contact-card">
                <Icon name="awareness-training" />
                <h2 className="h3">{ui.emailUs}</h2>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
                <p>{site.response_promise}</p>
              </div>
              <div className="card contact-card">
                <Icon name="checklist" />
                <h2 className="h3">{ui.hours}</h2>
                <p>{site.opening_hours}</p>
                <p>{site.service_area}</p>
              </div>
              <div className="card emergency-card">
                <Icon name="incident-response" />
                <h2 className="h3">{p!.side_card!.title}</h2>
                <p>{p!.side_card!.text}</p>
                <Button href="/services/incident-response/" size="sm">
                  {ui.emergencyCta}
                </Button>
              </div>
            </aside>
          </div>
        </section>
        <SectionShell tone="tint" title={`What happens *next*`}>
          <CardGrid items={p!.next_steps!} numbered />
        </SectionShell>
        <FaqSection items={p!.faqs!} />
      </>
    );

  if (route.kind === 'blog') {
    const filtered = posts.filter((p) => !route.category || p.category === route.category);
    const start = ((route.pageNumber || 1) - 1) * 12;
    return (
      <>
        {hero}
        <section className="section light">
          <div className="container">
            <h2 className="sr-only">{ui.blog}</h2>
            <nav className="filter-chips" aria-label={ui.blog}>
              <a href="/blog/" aria-current={!route.category ? 'page' : undefined}>
                {ui.all}
              </a>
              {blog.categories!.map((c) => (
                <a
                  key={c.key}
                  href={`/blog/category/${c.key}/`}
                  aria-current={route.category === c.key ? 'page' : undefined}
                >
                  {c.label}
                </a>
              ))}
            </nav>
            {!filtered.length && <p>{ui.noPosts}</p>}
            <BlogTeaser items={filtered.slice(start, start + 12)} />
            <nav className="actions pagination">
              {(route.pageNumber || 1) > 1 && (
                <a
                  href={route.pageNumber === 2 ? '/blog/' : `/blog/page/${route.pageNumber! - 1}/`}
                >
                  {ui.previous}
                </a>
              )}
              {start + 12 < filtered.length && (
                <a href={`/blog/page/${(route.pageNumber || 1) + 1}/`}>{ui.next}</a>
              )}
            </nav>
          </div>
        </section>
      </>
    );
  }
  if (route.kind === 'post')
    return (
      <Suspense>
        <BlogPost route={route} />
      </Suspense>
    );
  if (route.kind === 'legal')
    return (
      <Suspense>
        <Legal route={route} />
      </Suspense>
    );
  if (route.kind === '404')
    return (
      <>
        {hero}
        <section className="section light">
          <div className="container">
            <div className="actions centred">
              {p!.links!.map((l) => (
                <Button key={l.href} href={l.href!} variant="secondary">
                  {l.label}
                </Button>
              ))}
            </div>
            <ServiceGrid items={services.slice(0, 6)} />
          </div>
        </section>
      </>
    );
  return (
    <>
      {hero}
      <section className="section light">
        <div className="container narrow centred">
          <p className="lead">
            {route.kind === 'thank-you'
              ? page('contact-us').form!.success_text
              : site.response_promise}
          </p>
          <div className="actions centred">
            <Button href="/services/">{ui.services}</Button>
            <Button href="/blog/" variant="secondary">
              {ui.blog}
            </Button>
          </div>
        </div>
      </section>
      {route.kind === 'thank-you' && (
        <SectionShell tone="tint" title={`What happens *next*`}>
          <CardGrid items={page('contact-us').next_steps!} numbered />
        </SectionShell>
      )}
    </>
  );
}
