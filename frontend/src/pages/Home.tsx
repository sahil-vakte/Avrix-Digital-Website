import { home, content, services } from '../content';
import { Button, Em } from '../components/ui';
import {
  Ticker,
  HeroDashboard,
  ServiceCard,
  SectionShell,
  IndustryTabs,
  CardGrid,
  FrameworkGrid,
  Timeline,
  Testimonials,
  FAQ,
  CtaBand,
} from '../components/sections';
import type { Item } from '../content/schemas';

export default function Home() {
  return (
    <>
      {home.sections.map((s, i) => {
        const link = s.link && (
          <div className="section-link">
            <Button href={s.link.href!} variant="secondary">
              {s.link.label}
            </Button>
          </div>
        );
        switch (s.type) {
          case 'hero':
            return (
              <section className="home-hero" key={i}>
                <div className="hero-glow" aria-hidden="true" />
                <div className="container">
                  <div className="home-hero-copy">
                    {s.eyebrow && <p className="eyebrow pill-eyebrow">{s.eyebrow}</p>}
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
                  </div>
                  <HeroDashboard section={s} />
                </div>
              </section>
            );
          case 'ticker':
            return <Ticker key={i} section={s} />;
          case 'services_carousel':
            return (
              <SectionShell
                key={i}
                id="services"
                eyebrow={s.eyebrow}
                title={s.title}
                intro={s.intro}
              >
                <div
                  className="carousel stagger"
                  tabIndex={0}
                  aria-label={s.title?.replace(/\*/g, '')}
                >
                  {(s.items as string[]).map((slug) => {
                    const service = services.find((v) => v.slug === slug)!;
                    return <ServiceCard key={slug} s={service} />;
                  })}
                </div>
                {link}
              </SectionShell>
            );
          case 'industries_tabs':
            return (
              <SectionShell key={i} tone="tint" eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <IndustryTabs industries={content.industries.slice(0, 6)} />
                {link}
              </SectionShell>
            );
          case 'capabilities':
            return (
              <SectionShell key={i} eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <CardGrid items={s.items as Item[]} columns={4} className="capability-grid" />
              </SectionShell>
            );
          case 'frameworks':
            return (
              <SectionShell key={i} tone="tint" eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <FrameworkGrid items={s.items as Item[]} />
              </SectionShell>
            );
          case 'advantage':
            return (
              <SectionShell key={i} eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <CardGrid items={s.items as Item[]} columns={4} numbered />
              </SectionShell>
            );
          case 'engagement':
            return (
              <SectionShell key={i} tone="tint" eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <Timeline steps={s.items as Item[]} />
              </SectionShell>
            );
          case 'testimonials':
            return <Testimonials key={i} section={s} />;
          case 'faq':
            return (
              <SectionShell key={i} eyebrow={s.eyebrow} title={s.title} intro={s.intro}>
                <div className="narrow">
                  <FAQ
                    items={content.faqs.groups
                      .flatMap((g) => g.items)
                      .filter((f) => f.show_on_home)}
                  />
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
