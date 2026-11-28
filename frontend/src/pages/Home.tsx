import { home, content } from '../content';
import { Button, Em, Icon } from '../components/ui';
import {
  CaseStudyGrid,
  SectionShell,
  Timeline,
  FAQ,
  CtaBand,
  IndustriesGrid,
  InsightsGrid,
} from '../components/sections';
import type { Item } from '../content/schemas';

const pillarKey = (href: string) => href.replace(/\//g, '');

export default function Home() {
  return (
    <>
      {home.sections.map((s, i) => {
        const link = s.link && (
          <div className="section-link start">
            <a className="text-link" href={s.link.href!}>
              {s.link.label} <span aria-hidden="true">→</span>
            </a>
          </div>
        );
        switch (s.type) {
          case 'hero':
            return (
              <section className="home-hero" key={i}>
                <div className="container">
                  <div className="home-hero-copy">
                    {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
                    <h1>
                      <Em text={s.h1!} />
                    </h1>
                    <p className="lead">{s.lead}</p>
                    <div className="actions">
                      <Button href={s.primary_cta!.href!} size="lg">
                        {s.primary_cta!.label}
                      </Button>
                      <Button href={s.secondary_cta!.href!} variant="secondary" size="lg">
                        {s.secondary_cta!.label}
                      </Button>
                    </div>
                    {s.trust && (
                      <ul className="hero-trust">
                        {s.trust.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="hero-art home-art" aria-hidden="true">
                    <img
                      src="/media/art/hero-home.svg"
                      alt=""
                      width="760"
                      height="680"
                      fetchPriority="high"
                    />
                  </div>
                </div>
              </section>
            );
          case 'pillars':
            return (
              <SectionShell
                key={i}
                id="services"
                tone="tint"
                eyebrow={s.eyebrow}
                title={s.title}
                intro={s.intro}
              >
                <div className="pillar-cards stagger">
                  {(s.items as Item[]).map((p) => (
                    <article className={`pillar-card pillar-${pillarKey(p.href!)}`} key={p.title}>
                      <div className="card-media" aria-hidden="true">
                        <img
                          src={`/media/art/thumb-${pillarKey(p.href!)}.svg`}
                          alt=""
                          width="480"
                          height="260"
                          loading="lazy"
                        />
                      </div>
                      <h3>
                        <a href={p.href}>{p.title}</a>
                      </h3>
                      <p>{p.text}</p>
                      <ul className="check-list">{p.bullets?.map((b) => <li key={b}>{b}</li>)}</ul>
                      <span className="more" aria-hidden="true">
                        {p.label} →
                      </span>
                    </article>
                  ))}
                </div>
              </SectionShell>
            );
          case 'connected':
            return (
              <section className="section light growth" key={i} aria-labelledby="growth-title">
                <div className="container growth-grid">
                  <div className="growth-copy">
                    <p className="eyebrow">{s.eyebrow}</p>
                    <h2 id="growth-title">
                      <Em text={s.title!} />
                    </h2>
                    {s.paragraphs?.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
                    {link}
                  </div>
                  <ol className="glass-tiles">
                    {(s.items as Item[]).map((t) => (
                      <li key={t.title}>
                        <a href={t.href}>
                          <strong>{t.title}</strong>
                          <span>{t.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            );
          case 'proof':
            return (
              <SectionShell key={i} eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <CaseStudyGrid slugs={s.items as string[]} />
                {link}
              </SectionShell>
            );
          case 'people':
            return (
              <section className="section light people-section" key={i}>
                <div className="container">
                  <div className="people-band">
                    <div>
                      <p className="eyebrow">{s.eyebrow}</p>
                      <h2>
                        <Em text={s.title!} />
                      </h2>
                      <p>{s.text}</p>
                    </div>
                    <Button href={s.link!.href!}>{s.link!.label}</Button>
                  </div>
                </div>
              </section>
            );
          case 'advantage':
            return (
              <SectionShell key={i} tone="tint" eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <ul className="why-grid">
                  {(s.items as Item[]).map((w, n) => (
                    <li key={w.title}>
                      <Icon
                        name={
                          ['team', 'optimise', 'scale', 'shield-network', 'compliance', 'check'][
                            n
                          ] || 'check'
                        }
                      />
                      <strong>{w.title}</strong>
                      <span>{w.text}</span>
                    </li>
                  ))}
                </ul>
                {link}
              </SectionShell>
            );
          case 'engagement':
            return (
              <SectionShell key={i} eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <Timeline steps={s.items as Item[]} />
                {link}
              </SectionShell>
            );
          case 'industries_grid':
            return (
              <SectionShell key={i} tone="tint" eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <IndustriesGrid />
                {link}
              </SectionShell>
            );
          case 'insights':
            return (
              <SectionShell key={i} eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <InsightsGrid />
                {link}
              </SectionShell>
            );
          case 'faq':
            return (
              <SectionShell key={i} tone="tint" eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <div className="narrow">
                  <FAQ
                    items={content.faqs.groups
                      .flatMap((g) => g.items)
                      .filter((f) => f.show_on_home)}
                  />
                  {link}
                </div>
              </SectionShell>
            );
          case 'final_cta':
            return <CtaBand key={i} />;
          default:
            return null;
        }
      })}
    </>
  );
}
