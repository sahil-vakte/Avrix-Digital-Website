import { home, content } from '../content';
import { Heading, Button } from '../components/ui';
import {
  Hero,
  Marquee,
  ValueGrid,
  Process,
  Proof,
  FAQ,
  BlogTeaser,
  CtaBand,
  ServicesFilter,
} from '../components/sections';
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
            className={`section ${['values', 'proof'].includes(s.type) ? 'dark' : 'light'} section-${s.type}`}
            id={s.type === 'service_grid' ? 'services' : undefined}
          >
            <div className="container">
              {s.type !== 'proof' && (
                <Heading eyebrow={s.eyebrow} title={s.title || s.statement} intro={s.intro} />
              )}
              {['pillars', 'values'].includes(s.type) && <ValueGrid items={s.items as Item[]} />}
              {s.type === 'split_statement' && (
                <div className="split-copy">
                  <p className="lead">{s.body}</p>
                </div>
              )}
              {s.type === 'service_grid' && <ServicesFilter rich={false} />}
              {s.type === 'solutions' && <SolutionCards />}
              {s.type === 'process' && <Process steps={s.steps!} />}
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
                  <Button href={s.link.href!} variant="link">
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
