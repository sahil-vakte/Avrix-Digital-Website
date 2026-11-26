import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitize from 'sanitize-html';
import { z } from 'zod';
import {
  accreditationsSchema,
  offeringSchema,
  caseStudySchema,
  pillarKeys,
  homeSchema,
  siteSchema,
  navSchema,
  pageSchema,
  serviceSchema,
  solutionSchema,
  industrySchema,
  blogSchema,
  statSchema,
  testimonialSchema,
  faq,
  type Content,
} from './schemas';
import { offeringPath } from './paths';
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
/** Front-matter-only collection (no Markdown body is rendered). */
function frontMatter<T>(folder: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [] as T[];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const data = schema.parse(matter(fs.readFileSync(path.join(dir, f), 'utf8')).data);
      if ((data as { slug: string }).slug !== f.slice(0, -3))
        throw new Error(`Slug mismatch: ${folder}/${f}`);
      return data;
    });
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
    if (
      origin.protocol !== 'https:' ||
      origin.pathname !== '/' ||
      origin.search ||
      origin.hash ||
      origin.username ||
      origin.password
    )
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
    offerings: pillarKeys
      .flatMap((p) =>
        frontMatter(`pillars/${p}`, offeringSchema).map((o) => {
          if (o.pillar !== p) throw new Error(`Pillar mismatch: ${p}/${o.slug}`);
          return o;
        }),
      )
      .sort((a, b) => a.order - b.order),
    caseStudies: frontMatter('case-studies', caseStudySchema).sort((a, b) => a.order - b.order),
    industries: collection('industries', industrySchema).sort((a, b) => a.order - b.order),
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
    accreditations: (() => {
      const a = accreditationsSchema.parse(read('accreditations.json'));
      for (const item of a.items)
        if (!fs.existsSync(path.join(root, 'assets', item.logo.replace(/^\/media\//, ''))))
          throw new Error(`Accreditation logo missing: ${item.logo}`);
      return { ...a, items: a.items.filter((i) => i.show) };
    })(),
    ui: z.record(z.string()).parse(read('ui.json')),
    hasLogo: fs.existsSync(
      path.join(root, 'assets', site.logo.light_on_dark.replace(/^\/media\//, '')),
    ),
  };
  // Solutions can be switched off in site.json. When hidden, the pages are not
  // built and every link to them is removed, so nothing points at a missing page.
  if (!site.show_solutions) {
    const keep = (l: { href?: string }) => !l.href?.startsWith('/solutions/');
    data.solutions = [];
    data.pages = data.pages.filter((p) => p.slug !== 'solutions');
    data.nav.header = data.nav.header.filter(keep);
    data.nav.footer.explore = data.nav.footer.explore.filter(keep);
    for (const p of data.pages)
      for (const f of p.form?.fields || [])
        if (f.options) f.options = f.options.filter((o) => o.value !== 'security-products');
  }
  const slugs = new Set(data.services.map((s) => s.slug));
  for (const s of data.services) {
    for (const r of s.related) if (!slugs.has(r)) throw new Error(`Unknown related service ${r}`);
    if (!fs.existsSync(path.join(root, `assets/icons/${s.icon}.svg`)))
      throw new Error(`Missing icon ${s.icon}`);
  }
  for (const p of data.posts)
    if (!slugs.has(p.related_service)) throw new Error(`Unknown service ${p.related_service}`);
  const studySlugs = new Set(data.caseStudies.map((c) => c.slug));
  for (const p of pillarKeys)
    if (!data.offerings.some((o) => o.pillar === p && o.slug === 'index'))
      throw new Error(`Missing hub for ${p}`);
  for (const o of data.offerings) {
    for (const s of o.services || []) if (!slugs.has(s)) throw new Error(`Unknown service ${s}`);
    for (const c of o.case_studies || [])
      if (!studySlugs.has(c)) throw new Error(`Unknown case study ${c} in ${o.slug}`);
    if (!fs.existsSync(path.join(root, `assets/icons/${o.icon}.svg`)))
      throw new Error(`Missing icon ${o.icon}`);
  }
  for (const s of data.home.sections)
    if (s.type === 'proof')
      for (const c of s.items as string[])
        if (!studySlugs.has(c)) throw new Error(`Unknown case study ${c} on home`);
  for (const group of data.nav.mega_menu)
    if (!fs.existsSync(path.join(root, `assets/icons/${group.icon}.svg`)))
      throw new Error(`Missing icon ${group.icon}`);
  for (const industry of data.industries) {
    for (const r of industry.services)
      if (!slugs.has(r)) throw new Error(`Unknown industry service ${r}`);
    if (!fs.existsSync(path.join(root, `assets/icons/${industry.icon}.svg`)))
      throw new Error(`Missing industry icon ${industry.icon}`);
  }
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
    ...data.offerings,
    ...data.caseStudies,
    ...data.industries,
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
    ...data.offerings.map(offeringPath),
    ...data.caseStudies.map((p) => `/case-studies/${p.slug}/`),
    ...data.industries.map((p) => `/industries/${p.slug}/`),
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
