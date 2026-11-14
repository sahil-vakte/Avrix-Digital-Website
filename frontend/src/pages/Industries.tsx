import { content, services, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import {
  PageHero,
  RequestCard,
  SectionShell,
  CardGrid,
  ServiceGrid,
  Tags,
  FaqSection,
} from '../components/sections';
import { Breadcrumbs } from '../components/ui';

export default function Industries({ route }: { route: RouteRecord }) {
  if (route.kind === 'industries') {
    const p = content.pages.find((v) => v.slug === 'industries')!;
    return (
      <>
        <PageHero eyebrow={p.eyebrow} title={p.h1} lead={p.lead}>
          <Breadcrumbs items={[{ label: ui.industries, href: '/industries/' }]} />
        </PageHero>
        <SectionShell>
          <CardGrid
            items={content.industries.map((i) => ({
              title: i.title,
              text: i.summary,
              icon: i.icon,
              label: i.tagline,
              href: `/industries/${i.slug}/`,
              bullets: i.points.map((v) => v.title),
            }))}
          />
        </SectionShell>
      </>
    );
  }
  const i = content.industries.find((v) => v.slug === route.slug)!;
  return (
    <>
      <PageHero
        eyebrow={i.eyebrow}
        title={i.h1}
        lead={i.lead}
        tags={i.tags}
        aside={<RequestCard />}
      >
        <Breadcrumbs
          items={[
            { label: ui.industries, href: '/industries/' },
            { label: i.title, href: `/industries/${i.slug}/` },
          ]}
        />
      </PageHero>
      <SectionShell
        eyebrow={ui.industryPillars}
        title={`Where we *focus* first`}
        intro={i.summary}
      >
        <CardGrid items={i.pillars.map((v) => ({ ...v, icon: i.icon }))} columns={i.pillars.length === 4 ? 4 : 3} />
      </SectionShell>
      <SectionShell
        tone="tint"
        eyebrow={ui.industryLifecycle}
        title={`What you'll be able to *show*`}
      >
        <CardGrid items={i.lifecycle} numbered />
      </SectionShell>
      <SectionShell eyebrow={ui.frameworks} title={`Rules and standards *in your sector*`}>
        <Tags items={i.frameworks} />
      </SectionShell>
      <SectionShell tone="tint" eyebrow={ui.industryServices} title={`Where clients in this sector *usually start*`}>
        <ServiceGrid items={services.filter((s) => i.services.includes(s.slug))} />
      </SectionShell>
      <FaqSection items={i.faqs} title={`${i.title}: *common questions*`} />
    </>
  );
}
