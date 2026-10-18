import type { Content } from './schemas';
export type RouteRecord = {
  path: string;
  kind:
    | 'home'
    | 'about'
    | 'services'
    | 'service'
    | 'solutions'
    | 'solution'
    | 'faqs'
    | 'contact'
    | 'blog'
    | 'post'
    | 'legal'
    | '404'
    | 'thank-you'
    | 'newsletter';
  slug?: string;
  category?: string;
  pageNumber?: number;
  seo_title: string;
  seo_description: string;
  h1: string;
  noindex?: boolean;
  updated?: string;
};
export function buildRoutes(c: Content): RouteRecord[] {
  const result: RouteRecord[] = [
    { path: '/', kind: 'home', ...c.home, h1: c.home.sections.find((s) => s.type === 'hero')!.h1! },
  ];
  const kinds: Record<string, RouteRecord['kind']> = {
    about: 'about',
    services: 'services',
    solutions: 'solutions',
    faqs: 'faqs',
    'contact-us': 'contact',
    blog: 'blog',
    '404': '404',
  };
  c.pages.forEach((p) =>
    result.push({
      path: p.slug === '404' ? '/404/' : `/${p.slug}/`,
      kind: kinds[p.slug],
      ...p,
      noindex: p.slug === '404',
    }),
  );
  c.services.forEach((s) => result.push({ path: `/services/${s.slug}/`, kind: 'service', ...s }));
  c.solutions.forEach((s) =>
    result.push({ path: `/solutions/${s.slug}/`, kind: 'solution', ...s }),
  );
  c.posts.forEach((p) =>
    result.push({ path: `/blog/${p.slug}/`, kind: 'post', ...p, h1: p.title }),
  );
  c.legal.forEach((p) => result.push({ path: `/${p.slug}/`, kind: 'legal', ...p }));
  const blog = c.pages.find((p) => p.slug === 'blog')!;
  for (const category of blog.categories || []) {
    const selected = c.posts.filter((p) => p.category === category.key);

    result.push({
      path: `/blog/category/${category.key}/`,
      kind: 'blog',
      category: category.key,
      h1: category.label,
      seo_title: `${category.label} Insights | ${c.site.brand_name}`,
      seo_description: blog.seo_description.replace(
        'Practical guides and plain-English advice',
        `${category.label} advice`,
      ),
      updated: selected[0]?.updated,
      noindex: !selected.length,
    });
  }
  for (let n = 2; n <= Math.ceil(c.posts.length / 12); n++)
    result.push({
      path: `/blog/page/${n}/`,
      kind: 'blog',
      pageNumber: n,
      h1: `${blog.h1} — ${n}`,
      seo_title: `Insights: Page ${n} | ${c.site.brand_name}`,
      seo_description: `Page ${n}. ${blog.seo_description}`,
      updated: c.posts[0].updated,
    });
  result.push({
    path: '/thank-you/',
    kind: 'thank-you',
    h1: c.ui.thankYouTitle,
    seo_title: `Thank you | ${c.site.brand_name}`,
    seo_description: c.ui.thankYouDescription,
    noindex: true,
  });
  for (const [slug, key] of [
    ['newsletter-confirmed', 'newsletterConfirmed'],
    ['newsletter-unsubscribed', 'newsletterUnsubscribed'],
    ['newsletter-invalid', 'newsletterInvalid'],
  ])
    result.push({
      path: `/${slug}/`,
      kind: 'newsletter',
      h1: c.ui[key],
      seo_title: `${c.ui[key].slice(0, 40)} | ${c.site.brand_name}`,
      seo_description: c.ui[key + 'Description'],
      noindex: true,
    });
  return result;
}
export const ogSlug = (path: string) =>
  path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replaceAll('/', '-');
