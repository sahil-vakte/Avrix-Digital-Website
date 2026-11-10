import industryBodies from '../content/generated-industries.json';
import caseBodies from '../content/generated-caseStudies.json';
import pageBodies from '../content/generated-pages.json';
import { ChevronRight } from 'lucide-react';
import {
  caseStudies,
  caseStudyHref,
  homeSection,
  industries,
  industryHref,
  nav,
  page,
  serviceHref,
  services,
  site,
  ui,
} from '../content';
import type { RouteRecord } from '../content/routes';
import type { Item } from '../content/schemas';
import { Hero, FAQ, ValueGrid } from '../components/sections';
import {
  Frameworks,
  IconCards,
  IndustryArt,
  QuoteCard,
  Roadmap,
  SectionHead,
  ServiceCard,
  ServiceCarousel,
} from '../components/sections/Showcase';
import { Breadcrumbs, Icon, Prose } from '../components/ui';

type Bodies = Record<string, { html: string; toc: { id: string; text: string }[] }>;
const html = (bodies: unknown, slug: string) => (bodies as Bodies)[slug]?.html || '';

function CyberHub() {
  const p = page('cyber-security');
  const frameworks = homeSection('frameworks');
  return (
    <>
      <Hero
        section={{
          type: 'hero',
          h1: p.h1,
          lead: p.lead,
          eyebrow: p.eyebrow,
          primary_cta: { label: ui.quoteCta, href: '#enquiry' },
          secondary_cta: { label: site.booking_label, href: 'booking_url_or:/contact-us/' },
        }}
        icon="shield-check"
        badges={nav.cyber_menu.slice(0, 3).map((g) => ({ title: g.label, text: g.blurb }))}
        aside={<QuoteCard title={ui.cyberSecurity} />}
      />
      <section className="section light">
        <div className="container narrow">
          <Prose html={html(pageBodies, 'cyber-security')} />
        </div>
      </section>
      {nav.cyber_menu.map((g, i) => (
        <section className={`section light ${i % 2 ? 'tint' : ''}`} key={g.pillar} id={g.pillar}>
          <div className="container">
            <SectionHead eyebrow={`0${i + 1}`} title={g.label} intro={g.blurb} />
            <div className="tile-grid">
              {g.items.map((slug) => (
                <ServiceCard s={services.find((s) => s.slug === slug)!} key={slug} />
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="section light">
        <div className="container">
          <SectionHead
            eyebrow={frameworks.eyebrow}
            title={frameworks.title}
            intro={frameworks.intro}
          />
          <Frameworks items={frameworks.items as Item[]} />
        </div>
      </section>
      <section className="section light tint">
        <div className="container">
          <SectionHead eyebrow={ui.whyAvrix} title={ui.cyberWhyTitle} />
          <ValueGrid items={p.values!} />
        </div>
      </section>
      <section className="section light">
        <div className="container">
          <SectionHead
            eyebrow={homeSection('process').eyebrow}
            title={homeSection('process').title}
          />
          <Roadmap steps={homeSection('process').steps!} />
        </div>
      </section>
      <section className="section light">
        <div className="container narrow">
          <SectionHead eyebrow={ui.faqs} title={ui.faqTitle} />
          <FAQ items={p.faqs!} />
        </div>
      </section>
    </>
  );
}

function IndustriesHub() {
  const p = page('industries');
  return (
    <>
      <Hero section={{ type: 'hero', h1: p.h1, lead: p.lead, eyebrow: p.eyebrow }} icon="layers" />
      <section className="section light">
        <div className="container">
          <div className="industry-grid-cards">
            {industries.map((i) => (
              <article className="lumi-card industry-card" key={i.slug}>
                <span className="icon-tile">
                  <Icon name={i.icon} />
                </span>
                <h2>
                  <a href={industryHref(i.slug)}>{i.title}</a>
                </h2>
                <p>{i.summary}</p>
                <ul>
                  {i.challenges.slice(0, 3).map((c) => (
                    <li key={c.title}>{c.title}</li>
                  ))}
                </ul>
                <a className="learn-more" href={industryHref(i.slug)}>
                  {ui.learnMore}
                  <span className="sr-only">
                    {' '}
                    {ui.about} {i.title}
                  </span>
                  <ChevronRight size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section light tint">
        <div className="container narrow">
          <Prose html={html(pageBodies, 'industries')} />
        </div>
      </section>
    </>
  );
}

function IndustryDetail({ slug }: { slug: string }) {
  const i = industries.find((v) => v.slug === slug)!;
  return (
    <>
      <Hero
        section={{
          type: 'hero',
          h1: i.h1,
          lead: i.lead,
          eyebrow: i.eyebrow,
          primary_cta: { label: ui.quoteCta, href: '#enquiry' },
          secondary_cta: { label: ui.explorePillars, href: '#pillars' },
        }}
        icon={i.icon}
        badges={i.badges}
        aside={<QuoteCard title={i.title} />}
      >
        <Breadcrumbs
          items={[
            { label: ui.industries, href: '/industries/' },
            { label: i.title, href: industryHref(i.slug) },
          ]}
        />
      </Hero>
      <section className="section light">
        <div className="container overview-grid">
          <div className="lumi-card overview-card">
            <Prose html={html(industryBodies, i.slug)} />
          </div>
          <div className="lumi-card industry-art-card">
            <IndustryArt industry={i} />
          </div>
        </div>
      </section>
      <section className="section light tint">
        <div className="container">
          <SectionHead
            eyebrow={ui.keyChallenges}
            title={`${ui.challengesTitle} *${i.title.toLowerCase()}*`}
          />
          <IconCards items={i.challenges} />
        </div>
      </section>
      <section className="section light" id="pillars">
        <div className="container">
          <SectionHead
            eyebrow={ui.howWeHelp}
            title={`*${i.pillars.length} ${ui.pillarsTitle}*`}
            intro={i.summary}
          />
          <IconCards items={i.pillars} />
        </div>
      </section>
      <section className="section light tint">
        <div className="container">
          <SectionHead
            eyebrow={ui.engagement}
            title={`A clear *${i.lifecycle.length}-${ui.lifecycleTitle}*`}
          />
          <Roadmap steps={i.lifecycle} />
        </div>
      </section>
      <section className="section light">
        <div className="container">
          <SectionHead eyebrow={ui.standards} title={ui.standardsTitle} />
          <Frameworks items={i.standards.map((s) => ({ title: s, text: '' }))} />
        </div>
      </section>
      <section className="section light tint">
        <div className="container">
          <SectionHead eyebrow={ui.related} title={ui.relatedTitle} />
          <ServiceCarousel items={services.filter((s) => i.related.includes(s.slug))} />
        </div>
      </section>
      <section className="section light">
        <div className="container narrow">
          <SectionHead eyebrow={ui.faqs} title={ui.faqTitle} />
          <FAQ items={i.faqs} />
        </div>
      </section>
    </>
  );
}

function CaseStudiesHub() {
  const p = page('case-studies');
  return (
    <>
      <Hero section={{ type: 'hero', h1: p.h1, lead: p.lead, eyebrow: p.eyebrow }} icon="award" />
      <section className="section light">
        <div className="container">
          <div className="industry-grid-cards">
            {caseStudies.map((c) => (
              <article className="lumi-card industry-card" key={c.slug}>
                <p className="pill">{industries.find((i) => i.slug === c.industry)?.title}</p>
                <h2>
                  <a href={caseStudyHref(c.slug)}>{c.title}</a>
                </h2>
                <p>{c.summary}</p>
                <a className="learn-more" href={caseStudyHref(c.slug)}>
                  {ui.readCaseStudy} <ChevronRight size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CaseStudyDetail({ slug }: { slug: string }) {
  const c = caseStudies.find((v) => v.slug === slug)!;
  const results = c.results.filter((r) => r.verified);
  return (
    <>
      <Hero
        section={{ type: 'hero', h1: c.title, lead: c.summary, eyebrow: c.client }}
        icon="award"
      >
        <Breadcrumbs
          items={[
            { label: ui.caseStudies, href: '/case-studies/' },
            { label: c.title, href: caseStudyHref(c.slug) },
          ]}
        />
      </Hero>
      {!!results.length && (
        <section className="section light">
          <div className="container">
            <div className="badge-row results">
              {results.map((r) => (
                <div key={r.label}>
                  <strong>{r.value}</strong>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section light">
        <div className="container overview-grid">
          <div className="lumi-card overview-card">
            <Prose html={html(caseBodies, c.slug)} />
          </div>
          <aside className="lumi-card case-meta">
            <p className="pill">{ui.servicesUsed}</p>
            {c.services.map((s) => (
              <a key={s} href={serviceHref(s)}>
                {services.find((v) => v.slug === s)!.title}
                <ChevronRight size={14} aria-hidden="true" />
              </a>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}

export default function Sectors({ route }: { route: RouteRecord }) {
  if (route.kind === 'cyber') return <CyberHub />;
  if (route.kind === 'industries') return <IndustriesHub />;
  if (route.kind === 'industry') return <IndustryDetail slug={route.slug!} />;
  if (route.kind === 'case-studies') return <CaseStudiesHub />;
  return <CaseStudyDetail slug={route.slug!} />;
}
