import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitize from 'sanitize-html';
import { z } from 'zod';
import {
  homeSchema,
  siteSchema,
  navSchema,
  pageSchema,
  serviceSchema,
  solutionSchema,
  blogSchema,
  statSchema,
  testimonialSchema,
  faq,
  type Content,
} from './schemas';
const root = path.resolve(process.cwd(), '../content');
export function markdown(source: string) {
  if (/^# /m.test(source)) throw new Error('Markdown body must not contain H1');
  const toc: { id: string; text: string }[] = [];
  const html = sanitize(marked.parse(source, { async: false }), {
    allowedTags: sanitize.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height'],
    },
  }).replace(/<h2>(.*?)<\/h2>/g, (_, t: string) => {
    const text = t.replace(/<[^>]+>/g, '');
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    toc.push({ id, text });
    return `<h2 id="${id}">${t}</h2>`;
  });
  return { html, toc };
}
function read(name: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}
function collection<T>(folder: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  return fs
    .readdirSync(path.join(root, folder))
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const parsed = matter(fs.readFileSync(path.join(root, folder, f), 'utf8'));
      const data = schema.parse(parsed.data);
      if (
        (data as { slug: string }).slug !== f.slice(0, -3) &&
        !(folder === 'pages' && f === 'contact.md')
      )
        throw new Error(`Slug mismatch: ${f}`);
      return {
        ...data,
        ...markdown(parsed.content),
        readTime: Math.max(1, Math.ceil(parsed.content.split(/\s+/).length / 200)),
      };
    });
}
export function loadContent(): Content {
  const site = siteSchema.parse(read('site.json'));
  if (process.env.VITE_SITE_URL) {
    const origin = new URL(process.env.VITE_SITE_URL);
    if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password)
      throw new Error('VITE_SITE_URL must be an HTTPS origin');
    site.site_url = origin.origin;
  }
  const data: Content = {
    site,
    home: homeSchema.parse(read('home.json')),
    nav: navSchema.parse(read('navigation.json')),
    pages: collection('pages', pageSchema),
    legal: collection('legal', pageSchema),
    services: collection('services', serviceSchema).sort((a, b) => a.order - b.order),
    solutions: collection('solutions', solutionSchema).sort((a, b) => a.order - b.order),
    posts: collection('blog', blogSchema)
      .filter((p) => !p.draft)
      .sort((a, b) => b.published.localeCompare(a.published)),
    faqs: z
      .object({
        groups: z.array(z.object({ key: z.string(), label: z.string(), items: z.array(faq) })),
      })
      .parse(read('faqs.json')),
    stats: z
      .object({ items: z.array(statSchema) })
      .parse(read('stats.json'))
      .items.filter((v) => v.verified),
    testimonials: z
      .object({ items: z.array(testimonialSchema) })
      .parse(read('testimonials.json'))
      .items.filter((v) => v.verified),
    ui: z.record(z.string()).parse(read('ui.json')),
    hasLogo: fs.existsSync(
      path.join(root, 'assets', site.logo.light_on_dark.replace(/^\/media\//, '')),
    ),
  };
  const slugs = new Set(data.services.map((s) => s.slug));
  for (const s of data.services) {
    for (const r of s.related) if (!slugs.has(r)) throw new Error(`Unknown related service ${r}`);
    if (!fs.existsSync(path.join(root, `assets/icons/${s.icon}.svg`)))
      throw new Error(`Missing icon ${s.icon}`);
  }
  for (const p of data.posts)
    if (!slugs.has(p.related_service)) throw new Error(`Unknown service ${p.related_service}`);
  for (const group of data.nav.mega_menu)
    for (const s of group.items) if (!slugs.has(s)) throw new Error(`Unknown menu service ${s}`);
  for (const solution of data.solutions) {
    if (!fs.existsSync(path.join(root, `assets/icons/${solution.icon}.svg`)))
      throw new Error(`Missing solution icon ${solution.icon}`);
    const ids = solution.sections.map((section) => section.id);
    if (new Set(ids).size !== ids.length)
      throw new Error(`Duplicate feature anchors in ${solution.slug}`);
  }
  const metas = [
    data.home,
    ...data.pages,
    ...data.legal,
    ...data.services,
    ...data.solutions,
    ...data.posts,
  ];
  const titles = new Set<string>();
  for (const m of metas) {
    if (titles.has(m.seo_title)) throw new Error(`Duplicate title ${m.seo_title}`);
    titles.add(m.seo_title);
    if (m.seo_title.length > 60 || m.seo_description.length < 120 || m.seo_description.length > 160)
      console.warn(
        `OWNER SEO REVIEW: ${m.seo_title} (${m.seo_title.length}/${m.seo_description.length})`,
      );
    if (/East Midlands/i.test(m.seo_title + m.seo_description + ('h1' in m ? m.h1 : '')))
      throw new Error('Regional targeting');
  }
  const routes = new Set([
    '/',
    ...data.pages.map((p) => `/${p.slug}/`),
    ...data.legal.map((p) => `/${p.slug}/`),
    ...data.services.map((p) => `/services/${p.slug}/`),
    ...data.solutions.map((p) => `/solutions/${p.slug}/`),
    ...data.posts.map((p) => `/blog/${p.slug}/`),
  ]);
  const walk = (v: unknown, key = '') => {
    if (typeof v === 'string') {
      if (
        key === 'src' &&
        v.startsWith('/media/') &&
        !fs.existsSync(path.join(root, 'assets', v.slice(7)))
      )
        throw new Error(`Missing asset ${v}`);
      if (key === 'href' && v.startsWith('/') && !routes.has(v.split('#')[0]))
        throw new Error(`Unknown link ${v}`);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(data);
  return data;
}
