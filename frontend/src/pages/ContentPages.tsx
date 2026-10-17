import rawBodies from '../content/generated-pages.json';
import { lazy, Suspense, useState } from 'react';
import {
  content,
  page,
  services,
  posts,
  site,
  ui,
  homeSection,
  serviceHref,
  postHref,
} from '../content';
import type { RouteRecord } from '../content/routes';
import {
  Hero,
  ServicesFilter,
  ValueGrid,
  Process,
  ServiceGrid,
  FAQ,
  BlogTeaser,
} from '../components/sections';
import { Button, Heading, Prose } from '../components/ui';
const pageBodies = rawBodies as Record<
  string,
  { html: string; toc: { id: string; text: string }[] }
>;
const BlogPost = lazy(() => import('./BlogPost'));
const Legal = lazy(() => import('./Legal'));
const EnquiryForm = lazy(() => import('../components/forms/EnquiryForm'));
export default function ContentPages({ route }: { route: RouteRecord }) {
  const [search, setSearch] = useState('');
  const p = route.slug
    ? [...content.pages, ...content.legal].find((p) => p.slug === route.slug)
    : undefined;
  const blog = page('blog');
  const hero = (
    <Hero section={{ type: 'hero', h1: route.h1, lead: p?.lead, eyebrow: p?.eyebrow }} />
  );
  if (route.kind === 'about')
    return (
      <>
        {hero}
        <section className="section light">
          <div className="container overview-grid">
            <Prose html={pageBodies[p!.slug].html} />
            {p!.team_image && (
              <img
                src={p!.team_image.src}
                alt={p!.team_image.alt}
                width="800"
                height="1000"
                loading="lazy"
              />
            )}
          </div>
        </section>
        <section className="section dark">
          <div className="container">
            <ValueGrid items={p!.values!} />
          </div>
        </section>
        <section className="section light">
          <div className="container">
            <Heading title={ui.services} />
            <ServiceGrid />
          </div>
        </section>
        <section className="section dark">
          <div className="container">
            <Heading title={homeSection('process').title} />
            <Process steps={homeSection('process').steps!} />
          </div>
        </section>
        {!!p!.team?.length && (
          <section className="section light">
            <div className="container grid">
              {p!.team.map((t) => (
                <article key={t.name}>
                  <img
                    src={t.photo.src}
                    alt={t.photo.alt}
                    width="400"
                    height="500"
                    loading="lazy"
                  />
                  <h2>{t.name}</h2>
                  <p>{t.role}</p>
                  <p>{t.bio}</p>
                  {t.linkedin && <a href={t.linkedin}>LinkedIn</a>}
                </article>
              ))}
            </div>
          </section>
        )}
      </>
    );
  if (route.kind === 'services')
    return (
      <>
        {hero}
        <section className="section light">
          <div className="container">
            <ServicesFilter />
          </div>
        </section>
        <section className="section dark">
          <div className="container">
            <Heading title={p!.helper!.title} />
            <div className="grid scenario-grid">
              {p!.helper!.scenarios.map((s) => (
                <article key={s.service}>
                  <h3>{s.problem}</h3>
                  <a href={serviceHref(s.service)}>
                    {services.find((v) => v.slug === s.service)!.title} ↗
                  </a>
                  {s.then && (
                    <p>
                      <a href={serviceHref(s.then)}>
                        {services.find((v) => v.slug === s.then)!.title} ↗
                      </a>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section light">
          <div className="container">
            <FAQ items={content.faqs.groups.flatMap((g) => g.items)} />
          </div>
        </section>
      </>
    );
  if (route.kind === 'faqs')
    return (
      <>
        {hero}
        <section className="section light">
          <div className="container narrow">
            <label htmlFor="faq-search">{ui.search}</label>
            <input
              id="faq-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={p!.search_placeholder}
            />
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
        {hero}
        <section className="section light">
          <div className="container contact-grid">
            <Suspense>
              <EnquiryForm />
            </Suspense>
            <aside>
              <h2>{p!.side_card!.title}</h2>
              <p>{p!.side_card!.text}</p>
              <Button href="booking_url_or:/contact-us/">{site.booking_label}</Button>
              <p>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
              {site.phone && (
                <p>
                  <a href={`tel:${site.phone}`}>{site.phone}</a>
                </p>
              )}
              <ol className="next-steps">
                {p!.next_steps!.map((s) => (
                  <li key={s.title}>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
              <p>{site.response_promise}</p>
              <a href="/privacy-policy/">{ui.legal}</a>
            </aside>
          </div>
        </section>
        <section className="section light">
          <div className="container">
            <FAQ items={p!.faqs!} />
          </div>
        </section>
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
            <nav className="filter-chips">
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
            <nav className="actions">
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
            <div className="actions">
              {p!.links!.map((l) => (
                <Button key={l.href} href={l.href!}>
                  {l.label}
                </Button>
              ))}
            </div>
            <ServiceGrid />
          </div>
        </section>
      </>
    );
  return (
    <>
      {hero}
      <section className="section light">
        <div className="container">
          <p>
            {route.kind === 'thank-you'
              ? page('contact-us').form!.success_text
              : site.response_promise}
          </p>
          <Button href="booking_url_or:/contact-us/">{site.booking_label}</Button>
          {route.kind === 'thank-you' && (
            <>
              <ValueGrid items={page('contact-us').next_steps!} />
              <BlogTeaser />
            </>
          )}
          <p>
            <a href={postHref(posts[0].slug)}>{posts[0].title}</a>
          </p>
        </div>
      </section>
    </>
  );
}
