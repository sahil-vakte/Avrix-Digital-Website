import { content, page, posts, services, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import { Hero, ServiceGrid, BlogTeaser } from '../components/sections';
import { Breadcrumbs, Prose } from '../components/ui';
import raw from '../content/generated-posts.json';
const bodies = raw as Record<string, { html: string; toc: { id: string; text: string }[] }>;
export default function BlogPost({ route }: { route: RouteRecord }) {
  const blog = page('blog');

  const post = { ...posts.find((p) => p.slug === route.slug)!, ...bodies[route.slug!] };
  return (
    <>
      <Hero
        section={{
          type: 'hero',
          h1: post.title,
          eyebrow: `${post.category} · ${post.readTime} ${ui.minutes}`,
        }}
      >
        <Breadcrumbs items={[{ label: blog.h1.replaceAll('*', ''), href: '/blog/' }]} />
      </Hero>
      <section className="section light">
        <div className="container">
          <p>
            {ui.author} · <time dateTime={post.published}>{post.published}</time> · {ui.updated}:{' '}
            {post.updated}
          </p>
          <img
            className="article-cover"
            src={post.cover.src}
            alt={post.cover.alt}
            width="1600"
            height="900"
          />
          <div className="article-grid">
            <nav className="toc" aria-label={ui.contents}>
              <strong>{ui.contents}</strong>
              {post.toc.map((t) => (
                <a key={t.id} href={`#${t.id}`}>
                  {t.text}
                </a>
              ))}
            </nav>
            <Prose html={post.html} />
          </div>
          <div className="author-box">
            <h2>{ui.author}</h2>
            <a href="/about/">{content.nav.footer.company[0].label}</a>
          </div>
          <ServiceGrid items={services.filter((s) => s.slug === post.related_service)} />
          <BlogTeaser items={posts.filter((p) => p.slug !== post.slug).slice(0, 3)} />
        </div>
      </section>
    </>
  );
}
