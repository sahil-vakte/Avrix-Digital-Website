import { page, solutions, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import type { Solution } from '../content/schemas';
import { PageHero, SectionShell, CardGrid, Process, FaqSection } from '../components/sections';
import { Breadcrumbs, Button, Em, Icon } from '../components/ui';

export function SolutionCards({ items = solutions }: { items?: Solution[] }) {
  return (
    <div className="grid cards-3 solution-cards stagger">
      {items.map((s) => (
        <article className="card solution-card" key={s.slug}>
          <a href={`/solutions/${s.slug}/`} tabIndex={-1} aria-hidden="true">
            <img src={s.preview.src} alt="" width="1200" height="760" loading="lazy" />
          </a>
          <Icon name={s.icon} />
          <h3>
            <a href={`/solutions/${s.slug}/`}>{s.title}</a>
          </h3>
          <p>{s.summary}</p>
          <a
            className="more"
            href={`/solutions/${s.slug}/`}
            aria-label={`${ui.learnMore}: ${s.title}`}
          >
            {ui.learnMore} <span aria-hidden="true">→</span>
          </a>
        </article>
      ))}
    </div>
  );
}

export default function Solutions({ route }: { route: RouteRecord }) {
  if (route.kind === 'solutions') {
    const p = page('solutions');
    return (
      <>
        <PageHero eyebrow={p.eyebrow} title={p.h1} lead={p.lead}>
          <Breadcrumbs items={[{ label: ui.solutions, href: '/solutions/' }]} />
        </PageHero>
        <SectionShell>
          <SolutionCards />
        </SectionShell>
      </>
    );
  }
  const solution = solutions.find((s) => s.slug === route.slug)!;
  return (
    <>
      <section className="page-hero with-aside">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container page-hero-grid">
          <div className="page-hero-copy">
            <Breadcrumbs
              items={[
                { label: ui.solutions, href: '/solutions/' },
                { label: solution.title, href: route.path },
              ]}
            />
            <p className="eyebrow">{solution.eyebrow}</p>
            <h1>
              <Em text={solution.h1} />
            </h1>
            <p className="lead">{solution.lead}</p>
            <div className="actions">
              <Button href="#enquiry">{ui.discussSolution}</Button>
              <Button href="#features" variant="secondary">
                {ui.solutionFeatures}
              </Button>
            </div>
          </div>
          <figure className="software-preview">
            <img
              src={solution.preview.src}
              alt={solution.preview.alt}
              width="1200"
              height="760"
              fetchPriority="high"
            />
            <figcaption>{ui.solutionPreview}</figcaption>
          </figure>
        </div>
      </section>
      <SectionShell>
        <CardGrid items={solution.highlights} numbered />
      </SectionShell>
      <div id="features">
        {solution.sections.map((s, i) => (
          <SectionShell
            key={s.id}
            id={s.id}
            tone={i % 2 ? 'light' : 'tint'}
            eyebrow={`${String(i + 1).padStart(2, '0')} / ${solution.title}`}
            title={s.title}
            intro={s.intro}
          >
            <CardGrid items={s.items.map((v) => ({ ...v, icon: solution.icon }))} />
          </SectionShell>
        ))}
      </div>
      <SectionShell eyebrow={ui.solutionWorkflow} title={`How it *works*`}>
        <Process steps={solution.workflow} />
      </SectionShell>
      <SectionShell tone="tint" eyebrow={ui.businessTypes} title={`Who it's *for*`}>
        <CardGrid items={solution.industries} />
        <div className="note-card card">
          <h3>{ui.solutionSetup}</h3>
          <p>{solution.setup_note}</p>
          <Button href="#enquiry">{ui.discussSolution}</Button>
        </div>
      </SectionShell>
      <FaqSection items={solution.faqs} title={`${solution.title}: *your questions answered*`} />
      <SectionShell tone="tint" eyebrow={ui.allSolutions} title={`More security *solutions*`}>
        <SolutionCards items={solutions.filter((s) => s.slug !== solution.slug)} />
      </SectionShell>
    </>
  );
}
