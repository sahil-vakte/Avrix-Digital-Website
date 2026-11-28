import { caseStudies, findOffering, hub, services, subPages, ui, offeringPath } from '../content';
import type { RouteRecord } from '../content/routes';
import {
  PageHero,
  SectionShell,
  CardGrid,
  Process,
  ServiceGrid,
  FaqSection,
  OfferingGrid,
  CaseStudyGrid,
  BlockSection,
  FeaturedCase,
  caseThumb,
} from '../components/sections';
import { Breadcrumbs, Button, Em, Icon } from '../components/ui';
import type { Offering } from '../content/schemas';

/** Linked service cards with an arrow, as in the hub designs. */
function ServiceLinks({ items, compact = false }: { items: Offering[]; compact?: boolean }) {
  return (
    <ul className={`service-links ${compact ? 'compact' : ''}`}>
      {items.map((o) => (
        <li key={o.slug} className={`pillar-${o.pillar}`}>
          <a href={offeringPath(o)}>
            <Icon name={o.icon} />
            <strong>{o.title}</strong>
            {!compact && <span>{o.summary}</span>}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Pillar hub (e.g. /ai-solutions/) or one of its sub-pages. */
export default function Pillars({ route }: { route: RouteRecord }) {
  const o = findOffering(route.slug!);
  const isHub = o.slug === 'index';
  const parent = hub(o.pillar);
  const children = subPages(o.pillar);
  const crumbs = isHub
    ? [{ label: o.title, href: offeringPath(o) }]
    : [
        { label: parent.title, href: offeringPath(parent) },
        { label: o.title, href: offeringPath(o) },
      ];
  const siblings = children.filter((c) => c.slug !== o.slug);
  const featured = new Set(o.featured || []);
  const remaining = (o.case_studies || []).filter((c) => !featured.has(c));
  const proof = o.proof && caseStudies.find((c) => c.slug === o.proof!.slug)!;
  return (
    <div className={`pillar-page pillar-${o.pillar}`}>
      <PageHero
        eyebrow={isHub ? `${o.title} hub` : o.eyebrow}
        title={o.h1}
        lead={o.intro}
        tags={isHub ? undefined : o.tags}
        art={`/media/art/hero-${o.pillar}.svg`}
        secondary={
          isHub
            ? { label: ui.exploreServices, href: '#deliver' }
            : o.case_studies?.length
              ? { label: ui.caseStudies, href: '#case-studies' }
              : undefined
        }
      >
        <Breadcrumbs items={crumbs} />
      </PageHero>
      {o.pillar === 'cyber-security' && (
        <div className="emergency-strip" role="note">
          <div className="container">
            <strong>{ui.underAttack}</strong>
            <span>{ui.underAttackText}</span>
            <a href="/services/incident-response/">
              {ui.emergencyCta} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      )}
      {isHub && (
        <SectionShell
          id="deliver"
          tone={o.pillar === 'ai-solutions' ? 'tint' : 'light'}
          eyebrow={ui.ourServicesEyebrow}
          title={o.deliver_title || ui.whatWeDeliver}
          intro={o.deliver_intro}
        >
          {o.pillar === 'cyber-security' ? (
            <ul className="group-row">
              {children.map((g) => (
                <li key={g.slug}>
                  <a href={offeringPath(g)}>
                    <Icon name={g.icon} />
                    <strong>{g.title}</strong>
                    <span>{g.summary.split('?')[0]}?</span>
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ServiceLinks items={children} compact={o.pillar === 'ai-solutions'} />
          )}
          {o.pillar === 'cyber-security' && (
            <div className="section-link">
              <Button href="/services/#cyber-services" variant="secondary">
                {ui.allCyberServicesLong}
              </Button>
            </div>
          )}
        </SectionShell>
      )}
      {proof && (
        <section className="section light">
          <div className="container">
            <div className="proof-band">
              <div>
                <p className="eyebrow">{ui.caseStudy}</p>
                <h2>
                  <Em text={o.proof!.title} />
                </h2>
                <p>{o.proof!.text}</p>
                <Button href={`/case-studies/${proof.slug}/`}>{ui.viewProject}</Button>
              </div>
              <img src={caseThumb(proof)} alt="" width="480" height="260" loading="lazy" />
            </div>
          </div>
        </section>
      )}
      {featured.size > 0 && (
        <SectionShell
          id="case-studies"
          eyebrow={ui.caseStudies}
          title={`Real-world ${o.title.split(' ')[0]}, *real business results*`}
        >
          <div className="featured-cases">
            {[...featured].map((slug) => (
              <FeaturedCase key={slug} c={caseStudies.find((c) => c.slug === slug)!} />
            ))}
          </div>
        </SectionShell>
      )}
      {o.blocks.map((b, i) => (
        <BlockSection key={b.title} block={b} tone={i % 2 ? 'tint' : 'light'} />
      ))}
      {o.services && (
        <SectionShell
          id="services"
          tone="tint"
          eyebrow={`${o.services.length} ${ui.servicesCount}`}
          title={`${o.title}: *our services*`}
        >
          <ServiceGrid items={o.services.map((s) => services.find((v) => v.slug === s)!)} />
        </SectionShell>
      )}
      {o.process && (
        <SectionShell id="process" eyebrow={ui.ourProcess} title={o.process_title}>
          <Process steps={o.process} />
        </SectionShell>
      )}
      {remaining.length > 0 && (
        <SectionShell
          id={featured.size ? 'more-case-studies' : 'case-studies'}
          tone="tint"
          eyebrow={ui.caseStudies}
          title={featured.size ? `More *case studies*` : `Related *case studies*`}
        >
          <CaseStudyGrid slugs={remaining} />
          <div className="section-link">
            <Button href="/case-studies/" variant="secondary">
              {ui.allCaseStudies}
            </Button>
          </div>
        </SectionShell>
      )}
      {!!o.cross_links?.length && (
        <SectionShell eyebrow={ui.related} title={`Often *paired with*`}>
          <CardGrid items={o.cross_links} />
        </SectionShell>
      )}
      <FaqSection items={o.faqs} title={`${o.title}: *your questions answered*`} />
      {!isHub && (
        <SectionShell tone="tint" eyebrow={parent.title} title={`More from *${parent.title}*`}>
          <OfferingGrid items={siblings} columns={siblings.length % 3 === 0 ? 3 : 2} />
          <div className="section-link">
            <Button href={offeringPath(parent)} variant="secondary">
              {ui.explorePillar} {parent.title}
            </Button>
          </div>
        </SectionShell>
      )}
    </div>
  );
}
