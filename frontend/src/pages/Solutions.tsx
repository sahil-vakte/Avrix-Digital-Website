import { page, solutions, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import { Hero, ValueGrid, Process, FAQ } from '../components/sections';
import SolutionCards from '../components/sections/SolutionCards';
import { Breadcrumbs, Button, Em, Heading } from '../components/ui';

export default function Solutions({ route }: { route: RouteRecord }) {
  if (route.kind === 'solutions') {
    const p = page('solutions');
    return (
      <>
        <Hero section={{ type: 'hero', h1: p.h1, lead: p.lead, eyebrow: p.eyebrow }} />
        <section className="section light solutions-hub">
          <div className="container">
            <SolutionCards />
          </div>
        </section>
      </>
    );
  }
  const solution = solutions.find((s) => s.slug === route.slug)!;
  return (
    <>
      <section className="hero dark solution-hero">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: ui.solutions, href: '/solutions/' },
              { label: solution.title, href: route.path },
            ]}
          />
          <div className="solution-hero-grid">
            <div>
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
        </div>
      </section>
      <section className="section light solution-highlights">
        <div className="container">
          <ValueGrid items={solution.highlights} />
        </div>
      </section>
      <nav className="in-page solution-nav" aria-label={ui.contents}>
        <div className="container">
          {solution.sections.map((s) => (
            <a href={`#${s.id}`} key={s.id}>
              {s.title.split('.')[0]}
            </a>
          ))}
        </div>
      </nav>
      <div id="features">
        {solution.sections.map((s, i) => (
          <section
            className={`section solution-feature ${i % 2 ? 'light feature-tint' : 'light'}`}
            id={s.id}
            key={s.id}
          >
            <div className="container solution-feature-grid">
              <Heading
                eyebrow={`${String(i + 1).padStart(2, '0')} / ${solution.title}`}
                title={s.title}
                intro={s.intro}
              />
              <div className="feature-list">
                {s.items.map((item) => (
                  <article key={item.title} data-reveal>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="section dark">
        <div className="container">
          <Heading eyebrow={ui.solutionWorkflow} title={ui.connectedApproach} />
          <Process steps={solution.workflow} />
        </div>
      </section>
      <section className="section light">
        <div className="container">
          <Heading title={ui.businessTypes} />
          <div className="industry-grid">
            {solution.industries.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section light solution-setup">
        <div className="container">
          <div className="setup-note">
            <h2>{ui.solutionSetup}</h2>
            <p>{solution.setup_note}</p>
            <Button href="#enquiry">{ui.discussSolution}</Button>
          </div>
          <Heading title={ui.faqs} />
          <FAQ items={solution.faqs} />
        </div>
      </section>
      <section className="section light">
        <div className="container">
          <Heading title={ui.allSolutions} />
          <SolutionCards items={solutions.filter((s) => s.slug !== solution.slug)} />
        </div>
      </section>
    </>
  );
}
