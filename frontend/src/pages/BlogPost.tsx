import { page, posts, services, ui } from '../content';
import type { RouteRecord } from '../content/routes';
import { PageHero, ServiceGrid, BlogTeaser, SectionShell } from '../components/sections';
import { Breadcrumbs, Prose } from '../components/ui';
import raw from '../content/generated-posts.json';
const bodies = raw as Record<string, { html: string; toc: { id: string; text: string }[] }>;
const date = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
export default function BlogPost({ route }: { route: RouteRecord }) {
  const blog = page('blog');
  const post = { ...posts.find((p) => p.slug === route.slug)!, ...bodies[route.slug!] };
  const category = blog.categories?.find((c) => c.key === post.category)?.label;
  return (
    <>
      <PageHero
        eyebrow={`${category} · ${post.readTime} ${ui.minutes}`}
        title={post.title}
        lead={post.excerpt}
        actions={false}
      >
        <Breadcrumbs items={[{ label: ui.blog, href: '/blog/' }]} />
      </PageHero>
      <section className="section light">
        <div className="container">
          <p className="article-meta">
            {ui.author} · <time dateTime={post.published}>{date(post.published)}</time> ·{' '}
            {ui.updated}: {date(post.updated)}
          </p>
          <img
            className="article-cover"
            src={post.cover.src}
            alt={post.cover.alt}
            width="1600"
            height="900"
          />
          <div className="article-grid">
            <nav className="toc card" aria-label={ui.contents}>
              <strong>{ui.contents}</strong>
              {post.toc.map((t) => (
                <a key={t.id} href={`#${t.id}`}>
                  {t.text}
                </a>
              ))}
            </nav>
            <Prose html={post.html} />
          </div>
        </div>
      </section>
      <SectionShell tone="tint" eyebrow={ui.related} title={`How AVRIX can *help*`}>
        <ServiceGrid items={services.filter((s) => s.slug === post.related_service)} />
      </SectionShell>
      {posts.length > 1 && (
        <SectionShell eyebrow={ui.blog} title={`More *insights*`}>
          <BlogTeaser items={posts.filter((p) => p.slug !== post.slug).slice(0, 3)} />
        </SectionShell>
      )}
    </>
  );
}
