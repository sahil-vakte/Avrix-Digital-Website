import { findOffering, hub, services, subPages, ui, offeringPath } from '../content';
import type { RouteRecord } from '../content/routes';
import {
  PageHero,
  RequestCard,
  SectionShell,
  CardGrid,
  Process,
  ServiceGrid,
  FaqSection,
  OfferingGrid,
  CaseStudyGrid,
  BlockSection,
} from '../components/sections';
import { Breadcrumbs, Button } from '../components/ui';

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
  const [first, ...rest] = o.blocks;
  const siblings = children.filter((c) => c.slug !== o.slug);
  return (
    <div className={`pillar-page pillar-${o.pillar}`}>
      <PageHero
        eyebrow={o.eyebrow}
        title={o.h1}
        lead={o.intro}
        tags={o.tags}
        aside={<RequestCard title={isHub ? ui.bookConsultation : undefined} />}
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
      {first && <BlockSection block={first} />}
      {isHub && (
        <SectionShell
          id="deliver"
          tone="tint"
          eyebrow={o.title}
          title={o.deliver_title || ui.whatWeDeliver}
          intro={o.deliver_intro}
        >
          <OfferingGrid
            items={children}
            columns={children.length === 4 ? 2 : children.length === 3 ? 3 : 3}
            withServices={o.pillar === 'cyber-security'}
          />
          {o.pillar === 'cyber-security' && (
            <div className="section-link">
              <Button href="/services/#cyber-services" variant="secondary">
                {ui.allCyberServices}
              </Button>
            </div>
          )}
        </SectionShell>
      )}
      {rest.map((b, i) => (
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
      {!!o.case_studies?.length && (
        <SectionShell
          id="case-studies"
          tone="tint"
          eyebrow={ui.caseStudies}
          title={`Related *case studies*`}
        >
          <CaseStudyGrid slugs={o.case_studies} />
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
