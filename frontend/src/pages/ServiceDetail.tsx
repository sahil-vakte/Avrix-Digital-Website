import rawBodies from '../content/generated-services.json';
const serviceBodies = rawBodies as Record<
  string,
  { html: string; toc: { id: string; text: string }[] }
>;
import { services, site, ui, posts, nav } from '../content';
import { Hero, FAQ, Tags, BlogTeaser } from '../components/sections';
import {
  IconCards,
  QuoteCard,
  Roadmap,
  SectionHead,
  ServiceCarousel,
} from '../components/sections/Showcase';
import { Breadcrumbs, Prose } from '../components/ui';
export default function ServiceDetail({ slug }: { slug: string }) {
  const s = services.find((s) => s.slug === slug)!;
  const cyber = s.pillar === 'secure';
  const group = [...nav.mega_menu, ...nav.cyber_menu].find(
    (g) => g.pillar === s.pillar || g.items.includes(s.slug),
  );
  const sections = [
    'overview',
    'outcomes',
    'process',
    'included',
    ...(s.pricing?.price_from != null ? ['pricing'] : []),
    'faqs',
  ];
  return (
    <>
      <Hero
        section={{
          type: 'hero',
          h1: s.h1,
          lead: s.intro,
          eyebrow: s.label || group?.label,
          primary_cta: { label: ui.quoteCta, href: '#enquiry' },
          secondary_cta: { label: site.booking_label, href: 'booking_url_or:/contact-us/' },
        }}
        icon={s.icon}
        badges={s.badges}
        aside={<QuoteCard title={s.title} />}
      >
        <Breadcrumbs
          items={[
            cyber
              ? { label: ui.cyberSecurity, href: '/cyber-security/' }
              : { label: ui.services, href: '/services/' },
            { label: s.title, href: `/services/${slug}/` },
          ]}
        />
      </Hero>
      <nav className="in-page" aria-label={ui.onThisPage}>
        <div className="container">
          {sections.map((k) => (
            <a key={k} href={`#${k}`}>
              {ui[k]}
            </a>
          ))}
        </div>
      </nav>
      <section className="section light" id="overview">
        <div className="container overview-grid">
          <div className="lumi-card overview-card">
            <Prose html={serviceBodies[s.slug].html} />
          </div>
          <div className="lumi-card overview-tools">
            <p className="pill">{ui.tools}</p>
            <Tags items={s.tools} />
          </div>
        </div>
      </section>
      <section className="section light" id="outcomes">
        <div className="container">
          <SectionHead eyebrow={ui.whyItMatters} title={ui.outcomesTitle} />
          <IconCards items={s.outcomes} />
        </div>
      </section>
      <section className="section light tint" id="process">
        <div className="container">
          <SectionHead eyebrow={ui.methodology} title={ui.processTitle} />
          <Roadmap steps={s.process} />
        </div>
      </section>
      {s.models && (
        <section className="section light">
          <div className="container">
            <SectionHead eyebrow={ui.scope} title={ui.models} />
            <IconCards items={s.models} />
          </div>
        </section>
      )}
      <section className="section light" id="included">
        <div className="container">
          <SectionHead eyebrow={ui.serviceAreas} title={ui.includedTitle} />
          <IconCards items={s.included} />
        </div>
      </section>
      {s.deliverables && (
        <section className="section light tint">
          <div className="container">
            <SectionHead eyebrow={ui.reporting} title={ui.deliverables} />
            <IconCards items={s.deliverables} />
          </div>
        </section>
      )}
      {s.pricing?.price_from != null && (
        <section className="section light" id="pricing">
          <div className="container pricing">
            <SectionHead title={ui.pricing} />
            <p className="price-display">
              {ui.from} £{s.pricing.price_from.toLocaleString('en-GB')}{' '}
              <small>{s.pricing.unit}</small>
            </p>
            <p>{s.pricing.note}</p>
          </div>
        </section>
      )}
      <section className="section light" id="faqs">
        <div className="container narrow">
          <SectionHead eyebrow={ui.faqs} title={ui.faqTitle} />
          <FAQ items={s.faqs} />
        </div>
      </section>
      <section className="section light">
        <div className="container">
          <SectionHead eyebrow={ui.related} title={ui.relatedTitle} />
          <ServiceCarousel items={services.filter((v) => s.related.includes(v.slug))} />
        </div>
      </section>
      {posts.some((p) => p.related_service === slug) && (
        <section className="section light">
          <div className="container">
            <BlogTeaser items={posts.filter((p) => p.related_service === slug)} />
          </div>
        </section>
      )}
    </>
  );
}
