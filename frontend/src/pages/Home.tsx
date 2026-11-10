import { home, content } from '../content';
import { Button } from '../components/ui';
import { Hero, Marquee, ValueGrid, Proof, FAQ, BlogTeaser, CtaBand } from '../components/sections';
import {
  Frameworks,
  IndustriesShowcase,
  Roadmap,
  SectionHead,
  ServiceCarousel,
  ServicesMatrix,
} from '../components/sections/Showcase';
import type { Item } from '../content/schemas';
import SolutionCards from '../components/sections/SolutionCards';
export default function Home() {
  return (
    <>
      {home.sections.map((s, i) => {
        if (s.type === 'hero') return <Hero key={i} section={s} home />;
        if (s.type === 'marquee') return <Marquee key={i} section={s} />;
        if (s.type === 'cta_band') return <CtaBand key={i} />;
        return (
          <section
            key={i}
            className={`section light section-${s.type}`}
            id={s.type === 'service_carousel' ? 'services' : undefined}
          >
            <div className="container">
              {s.type !== 'proof' && (
                <SectionHead eyebrow={s.eyebrow} title={s.title || s.statement} intro={s.intro} />
              )}
              {s.type === 'service_carousel' && <ServiceCarousel />}
              {s.type === 'industries_showcase' && <IndustriesShowcase />}
              {s.type === 'services_matrix' && <ServicesMatrix groups={s.groups!} />}
              {s.type === 'frameworks' && <Frameworks items={s.items as Item[]} />}
              {['pillars', 'values'].includes(s.type) && <ValueGrid items={s.items as Item[]} />}
              {s.type === 'solutions' && <SolutionCards />}
              {(s.type === 'process' || s.type === 'roadmap') && <Roadmap steps={s.steps!} />}
              {s.type === 'proof' && <Proof section={s} />}
              {s.type === 'faq' && (
                <FAQ
                  items={content.faqs.groups
                    .flatMap((g) => g.items)
                    .filter((f) => f.show_on_home)
                    .slice(0, 6)}
                />
              )}
              {s.type === 'blog_teaser' && <BlogTeaser />}
              {s.link && (
                <div className="section-link">
                  <Button href={s.link.href!} variant="secondary" size="sm">
                    {s.link.label}
                  </Button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
