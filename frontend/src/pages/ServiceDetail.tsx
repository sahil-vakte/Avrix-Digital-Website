import rawBodies from '../content/generated-services.json';
import { services, ui, posts, homeSection } from '../content';
import {
  PageHero,
  RequestCard,
  SectionShell,
  CardGrid,
  Process,
  ServiceGrid,
  Tags,
  FaqSection,
  BlogTeaser,
  pillarLabel,
} from '../components/sections';
import { Breadcrumbs, Prose } from '../components/ui';
import type { Item } from '../content/schemas';
const serviceBodies = rawBodies as Record<
  string,
  { html: string; toc: { id: string; text: string }[] }
>;
export default function ServiceDetail({ slug }: { slug: string }) {
  const s = services.find((s) => s.slug === slug)!;
  const advantage = (homeSection('advantage').items as Item[]).slice(0, 3);
  const nav = [
    ['overview', ui.overview],
    ['included', ui.serviceAreas],
    ['process', ui.ourProcess],
    ['faqs', ui.faqs],
  ];
  return (
    <>
      <PageHero
        eyebrow={pillarLabel(s.pillar)}
        title={s.h1}
        lead={s.intro}
        tags={s.tags}
        aside={<RequestCard />}
      >
        <Breadcrumbs
          items={[
            { label: ui.services, href: '/services/' },
            { label: s.title, href: `/services/${slug}/` },
          ]}
        />
      </PageHero>
      <nav className="in-page" aria-label={ui.contents}>
        <div className="container">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section className="section light" id="overview">
        <div className={`container ${s.explainer ? 'split' : 'narrow'}`}>
          <Prose html={serviceBodies[s.slug].html} />
          {s.explainer && (
            <div className="explainer">
              <h2 className="h3">{s.explainer.title}</h2>
              {s.explainer.intro && <p>{s.explainer.intro}</p>}
              <CardGrid items={s.explainer.cards} columns={2} />
            </div>
          )}
        </div>
      </section>
      <SectionShell tone="tint" eyebrow={ui.keyBenefits} title={`What it *means for your business*`}>
        <CardGrid items={s.outcomes} />
      </SectionShell>
      <SectionShell id="process" eyebrow={ui.ourProcess} title={`From first call to *final report*`}>
        <Process steps={s.process} />
      </SectionShell>
      <SectionShell id="included" tone="tint" eyebrow={ui.serviceAreas} title={`What we *look at*`}>
        <CardGrid items={s.included.map((i) => ({ ...i, icon: s.icon }))} />
      </SectionShell>
      <SectionShell eyebrow={ui.whyAvrix} title={`Why clients *choose us*`}>
        <CardGrid items={advantage} numbered />
      </SectionShell>
      {s.deliverables && (
        <SectionShell tone="tint" eyebrow={ui.deliverables} title={`Documents you can *actually use*`}>
          <CardGrid items={s.deliverables} />
        </SectionShell>
      )}
      <SectionShell eyebrow={ui.frameworks} title={`Helps you *meet*`}>
        <Tags items={s.tools} />
      </SectionShell>
      <FaqSection items={s.faqs} title={`${s.title}: *your questions answered*`} />
      <SectionShell tone="tint" eyebrow={ui.related} title={`Often *paired with*`}>
        <ServiceGrid items={services.filter((v) => s.related.includes(v.slug))} />
      </SectionShell>
      {posts.some((p) => p.related_service === slug) && (
        <SectionShell eyebrow={ui.blog} title={`Worth *reading*`}>
          <BlogTeaser items={posts.filter((p) => p.related_service === slug)} />
        </SectionShell>
      )}
    </>
  );
}
