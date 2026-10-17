import { page, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import { Hero } from '../components/sections';
import { Prose } from '../components/ui';
import raw from '../content/generated-legal.json';
const bodies = raw as Record<string, { html: string; toc: { id: string; text: string }[] }>;
export default function Legal({ route }: { route: RouteRecord }) {
  const p = { ...page(route.slug!), ...bodies[route.slug!] };
  const hero = <Hero section={{ type: 'hero', h1: route.h1 }} />;
  return (
    <>
      {hero}
      <section className="section light">
        <div className="container">
          <p>
            {ui.updated}: {p!.last_updated}
          </p>
          <div className="article-grid">
            <nav className="toc" aria-label={ui.contents}>
              {p!.toc.map((t) => (
                <a key={t.id} href={`#${t.id}`}>
                  {t.text}
                </a>
              ))}
            </nav>
            <Prose html={p!.html} />
          </div>
        </div>
      </section>
    </>
  );
}
