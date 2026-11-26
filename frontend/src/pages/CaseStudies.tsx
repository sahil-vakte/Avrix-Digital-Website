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
} from '../components/sections';
import { Breadcrumbs, Button } from '../components/ui';

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
        <PageHero eyebrow={p.eyebrow} title={p.h1} lead={p.lead}>
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
  return (
    <>
      <PageHero eyebrow={c.industry} title={c.title} lead={c.summary} tags={c.technology}>
        <Breadcrumbs
          items={[
            { label: ui.caseStudies, href: '/case-studies/' },
            { label: c.title, href: route.path },
          ]}
        />
      </PageHero>
      <section className="section light">
        <div className="container case-layout">
          <aside className="case-facts card" aria-label={ui.projectFacts}>
            <dl>
              <dt>{ui.industry}</dt>
              <dd>{c.industry}</dd>
              <dt>{ui.solutionArea}</dt>
              <dd>{c.areas.map(pillarTitle).join(', ')}</dd>
              <dt>{ui.technology}</dt>
              <dd>{c.technology.join(', ')}</dd>
            </dl>
            <Button href="#enquiry" size="sm">
              {ui.discussProject}
            </Button>
          </aside>
          <article className="case-story">
            <h2>{ui.problemStatement}</h2>
            <p>{c.problem}</p>
            <h2>{ui.objective}</h2>
            <p>{c.objective}</p>
            <h2>{ui.ourSolution}</h2>
            <p>{c.solution}</p>
            <h2>{ui.keyFeatures}</h2>
            <ul className="check-list">
              {c.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {c.secure && (
              <div className="secure-note">
                <h2 className="h3">{ui.secureByDesign}</h2>
                <p>{c.secure}</p>
              </div>
            )}
            <div className="outcome-note">
              <h2 className="h3">{ui.finalOutcome}</h2>
              <p>{c.outcome}</p>
            </div>
          </article>
        </div>
      </section>
      <SectionShell tone="tint" eyebrow={ui.projectPhases} title={`How we *delivered it*`}>
        <Process steps={c.phases} />
      </SectionShell>
      <SectionShell eyebrow={ui.related} title={`Services behind *this project*`}>
        <ul className="related-links">
          {c.related.map((l) => (
            <li key={l.href}>
              <a href={l.href}>
                {l.label} <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </SectionShell>
      {others.length > 0 && (
        <SectionShell tone="tint" eyebrow={ui.caseStudies} title={`More *case studies*`}>
          <CaseStudyGrid slugs={others} />
        </SectionShell>
      )}
    </>
  );
}
