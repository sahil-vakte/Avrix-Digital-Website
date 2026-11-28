import { useState } from 'react';
import { caseStudies, page, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import {
  PageHero,
  SectionShell,
  CaseStudyCard,
  CaseStudyGrid,
  DataTable,
  Process,
  pillarTitle,
  caseThumb,
} from '../components/sections';
import { Breadcrumbs, Button, Em, Icon } from '../components/ui';
import { content } from '../content';

const pillarIcon: Record<string, string> = {
  'digital-transformation': 'transform',
  'ai-solutions': 'ai-automation',
  'cyber-security': 'shield-network',
  'professional-services': 'team',
};
const industry = (slug: string) => content.industries.find((i) => i.slug === slug);
const sectorIndustry: Record<string, ReturnType<typeof industry>> = {
  healthcare: industry('healthcare'),
  'retail-logistics': industry('retail-ecommerce'),
  education: industry('education'),
};

function Directory() {
  const p = page('case-studies');
  const [area, setArea] = useState('all');
  const [sector, setSector] = useState('all');
  const matches = caseStudies.filter(
    (c) =>
      (area === 'all' || c.areas.includes(area as never)) &&
      (sector === 'all' || c.sector === sector),
  );
  const count = (key: string) =>
    key === 'all'
      ? caseStudies.length
      : caseStudies.filter((c) => c.areas.includes(key as never)).length;
  return (
    <>
      <div className="directory-bar">
        <div className="filter-chips" role="group" aria-label={ui.solutionArea}>
          {p
            .filters!.filter((f) => count(f.key) > 0)
            .map((f) => (
              <button key={f.key} aria-pressed={area === f.key} onClick={() => setArea(f.key)}>
                {f.label}
                <span>{count(f.key)}</span>
              </button>
            ))}
        </div>
        <label className="select-field">
          <span className="sr-only">{ui.industry}</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="all">{ui.allSectors}</option>
            {p
              .categories!.filter((c) => caseStudies.some((v) => v.sector === c.key))
              .map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
          </select>
        </label>
      </div>
      <p className="result-count" role="status" aria-live="polite">
        {matches.length} {ui.caseStudiesCount}
      </p>
      {matches.length ? (
        <div className="grid cards-3 case-grid">
          {matches.map((c) => (
            <CaseStudyCard key={c.slug} c={c} />
          ))}
        </div>
      ) : (
        <p className="empty-note">{ui.noCaseStudies}</p>
      )}
    </>
  );
}

export default function CaseStudies({ route }: { route: RouteRecord }) {
  if (route.kind === 'case-studies') {
    const p = page('case-studies');
    return (
      <>
        <PageHero
          eyebrow={p.eyebrow}
          title={p.h1}
          lead={p.lead}
          art="/media/art/hero-case-study.svg"
        >
          <Breadcrumbs items={[{ label: p.eyebrow!, href: '/case-studies/' }]} />
        </PageHero>
        <SectionShell id="work" eyebrow={ui.featuredWork} title={`Featured *case studies*`}>
          <Directory />
        </SectionShell>
        <SectionShell
          tone="tint"
          eyebrow={ui.moreSolutions}
          title={`More solutions *we have delivered*`}
        >
          <DataTable
            headers={[ui.solution, ui.industry, ui.area]}
            rows={p.more!.map((m) => [m.solution, m.industry, m.area])}
          />
        </SectionShell>
      </>
    );
  }
  const c = caseStudies.find((v) => v.slug === route.slug)!;
  const others = caseStudies
    .filter((v) => v.slug !== c.slug && v.areas.some((a) => c.areas.includes(a)))
    .slice(0, 3)
    .map((v) => v.slug);
  const industryPage = sectorIndustry[c.sector];
  return (
    <>
      <section className="page-hero case-hero with-art">
        <div className="container page-hero-grid">
          <div className="page-hero-copy">
            <Breadcrumbs
              items={[
                { label: ui.caseStudies, href: '/case-studies/' },
                { label: c.title, href: route.path },
              ]}
            />
            <p className="eyebrow">{c.industry}</p>
            <h1>
              <Em text={c.h1 || c.title} />
            </h1>
            <p className="lead">{c.summary}</p>
            <ul className="topic-chips">
              {industryPage && (
                <li>
                  <a href={`/industries/${industryPage.slug}/`}>
                    <Icon name={industryPage.icon} />
                    {industryPage.title}
                  </a>
                </li>
              )}
              {c.areas.map((a) => (
                <li key={a}>
                  <a href={`/${a}/`}>
                    <Icon name={pillarIcon[a]} />
                    {pillarTitle(a)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src={c.art || caseThumb(c)} alt="" width="760" height="520" fetchPriority="high" />
          </div>
        </div>
      </section>
      <section className="section light">
        <div className="container case-layout">
          <article className="case-story">
            <div className="story-block">
              <h2>{ui.theChallenge}</h2>
              <p>{c.problem}</p>
              <p>
                <strong>{ui.objective}: </strong>
                {c.objective}
              </p>
            </div>
            <div className="story-block built">
              <div>
                <h2>{ui.whatWeBuilt}</h2>
                <p>{c.solution}</p>
              </div>
              {c.workflow ? (
                <ol className="workflow" aria-label={ui.howItFlows}>
                  {c.workflow.map((w) => (
                    <li key={w.label}>
                      <Icon name={w.icon} />
                      <span>{w.label}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="check-list">
                  {c.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
            {c.workflow && (
              <div className="story-block">
                <h2 className="h3">{ui.keyFeatures}</h2>
                <ul className="check-list columns">
                  {c.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="story-block outcome">
              <div>
                <h2>{ui.theOutcome}</h2>
                <p>{c.outcome}</p>
              </div>
              {c.outcome_points && (
                <ul className="outcome-points">
                  {c.outcome_points.map((p) => (
                    <li key={p.title}>
                      <Icon name={p.icon || 'check'} />
                      <strong>{p.title}</strong>
                      <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {c.secure && (
              <div className="secure-note">
                <h2 className="h3">{ui.secureByDesign}</h2>
                <p>{c.secure}</p>
              </div>
            )}
          </article>
          <aside className="case-facts card" aria-label={ui.projectFacts}>
            <dl>
              <dt>{ui.industry}</dt>
              <dd>{c.industry}</dd>
              <dt>{ui.solutionArea}</dt>
              <dd>{c.areas.map(pillarTitle).join(', ')}</dd>
              <dt>{ui.technology}</dt>
              <dd>{c.technology.join(', ')}</dd>
              <dt>{ui.related}</dt>
              <dd>
                <ul className="link-list">
                  {c.related.map((l) => (
                    <li key={l.href}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            <Button href="#enquiry" size="sm">
              {ui.discussProject}
            </Button>
          </aside>
        </div>
      </section>
      <SectionShell tone="tint" eyebrow={ui.projectPhases} title={`How we *delivered it*`}>
        <Process steps={c.phases} />
      </SectionShell>
      {others.length > 0 && (
        <SectionShell eyebrow={ui.caseStudies} title={`Related *case studies*`}>
          <CaseStudyGrid slugs={others} />
          <div className="section-link">
            <Button href="/case-studies/" variant="secondary">
              {ui.allCaseStudies}
            </Button>
          </div>
        </SectionShell>
      )}
    </>
  );
}
