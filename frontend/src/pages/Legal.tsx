import { page, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import { PageHero } from '../components/sections';
import { Breadcrumbs, Prose } from '../components/ui';
import raw from '../content/generated-legal.json';
const bodies = raw as Record<string, { html: string; toc: { id: string; text: string }[] }>;
export default function Legal({ route }: { route: RouteRecord }) {
  const p = { ...page(route.slug!), ...bodies[route.slug!] };
  return (
    <>
      <PageHero title={route.h1} actions={false}>
        <Breadcrumbs items={[{ label: route.h1.replace(/\*/g, ''), href: route.path }]} />
      </PageHero>
      <section className="section light">
        <div className="container">
          <p className="article-meta">
            {ui.updated}: {p.last_updated}
          </p>
          <div className="article-grid">
            <nav className="toc card" aria-label={ui.contents}>
              <strong>{ui.contents}</strong>
              {p.toc.map((t) => (
                <a key={t.id} href={`#${t.id}`}>
                  {t.text}
                </a>
              ))}
            </nav>
            <Prose html={p.html} />
          </div>
        </div>
      </section>
    </>
  );
}
