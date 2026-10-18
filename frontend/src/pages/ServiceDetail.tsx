import rawBodies from '../content/generated-services.json';
const serviceBodies = rawBodies as Record<
  string,
  { html: string; toc: { id: string; text: string }[] }
>;
import { services, site, ui, posts, nav } from '../content';
import {
  Hero,
  ValueGrid,
  Process,
  FAQ,
  ServiceGrid,
  Tags,
  BlogTeaser,
} from '../components/sections';
import { Breadcrumbs, Heading, Prose } from '../components/ui';
export default function ServiceDetail({ slug }: { slug: string }) {
  const s = services.find((s) => s.slug === slug)!;
  const sections = [
    'overview',
    'included',
    'process',
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
          eyebrow: nav.mega_menu.find((g) => g.pillar === s.pillar)?.label,
          primary_cta: { label: site.booking_label, href: 'booking_url_or:/contact-us/' },
          secondary_cta: { label: ui.enquire, href: '#enquiry' },
        }}
      >
        <Breadcrumbs
          items={[
            { label: ui.services, href: '/services/' },
            { label: s.title, href: `/services/${slug}/` },
          ]}
        />
      </Hero>
      <nav className="in-page">
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
          <Prose html={serviceBodies[s.slug].html} />
          {s.hero_image && (
            <img
              src={s.hero_image.src}
              alt={s.hero_image.alt}
              width="1600"
              height="900"
              loading="lazy"
            />
          )}
        </div>
      </section>
      <section className="section dark" id="included">
        <div className="container">
          <Heading title={ui.included} />
          <ValueGrid items={s.included} />
        </div>
      </section>
      <section className="section light">
        <div className="container">
          <Heading title={ui.outcomes} />
          <ValueGrid items={s.outcomes} />
          <Heading title={ui.tools} />
          <Tags items={s.tools} />
        </div>
      </section>
      <section className="section dark" id="process">
        <div className="container">
          <Heading title={ui.process} />
          <Process steps={s.process} />
        </div>
      </section>
      {s.pricing?.price_from != null && (
        <section className="section light" id="pricing">
          <div className="container pricing">
            <Heading title={ui.pricing} />
            <p className="price-display">
              {ui.from} £{s.pricing.price_from.toLocaleString('en-GB')}{' '}
              <small>{s.pricing.unit}</small>
            </p>
            <p>{s.pricing.note}</p>
          </div>
        </section>
      )}
      <section className="section light" id="faqs">
        <div className="container">
          <Heading title={ui.faqs} />
          <FAQ items={s.faqs} />
        </div>
      </section>
      <section className="section dark">
        <div className="container">
          <Heading title={ui.related} />
          <ServiceGrid items={services.filter((v) => s.related.includes(v.slug))} />
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
