import { z } from 'zod';
const text = z.string().min(1);
export const link = z.object({ label: text, href: text.optional(), action: text.optional() });
export const image = z
  .object({ src: text, alt: z.string(), decorative: z.boolean().optional() })
  .refine((v) => v.decorative || v.alt.trim().length > 0, 'Image needs alt text');
export const item = z.object({
  title: text,
  text: text,
  icon: text.optional(),
  n: text.optional(),
  services: z.array(text).optional(),
  key: text.optional(),
});
export const faq = z.object({ q: text, a: text, show_on_home: z.boolean().optional() });
const date = z
  .union([z.string(), z.date()])
  .transform((v) => new Date(v).toISOString().slice(0, 10));
const meta = { seo_title: text, seo_description: text };
const field = z.object({
  name: text,
  label: text,
  type: text,
  required: z.boolean().optional(),
  autocomplete: text.optional(),
  placeholder: text.optional(),
  minLength: z.number().optional(),
  options: z.array(z.object({ value: text, label: text })).optional(),
});
export const pageSchema = z.object({
  ...meta,
  slug: text,
  h1: text,
  eyebrow: text.optional(),
  lead: text.optional(),
  updated: date.optional(),
  last_updated: date.optional(),
  hide_cta_band: z.boolean().optional(),
  robots: text.optional(),
  team_image: image.nullable().optional(),
  team: z
    .array(z.object({ name: text, role: text, photo: image, linkedin: text.optional(), bio: text }))
    .optional(),
  values: z.array(item).optional(),
  links: z.array(link).optional(),
  search_placeholder: text.optional(),
  filters: z.array(z.object({ key: text, label: text })).optional(),
  helper: z
    .object({
      title: text,
      scenarios: z.array(z.object({ problem: text, service: text, then: text.nullable() })),
    })
    .optional(),
  categories: z.array(z.object({ key: text, label: text })).optional(),
  newsletter: z.object({ title: text, text: text, consent: text }).optional(),
  next_steps: z.array(item).optional(),
  side_card: z.object({ title: text, text: text }).optional(),
  privacy_note: text.optional(),
  faqs: z.array(faq).optional(),
  form: z
    .object({
      title: text,
      submit_label: text,
      success_title: text,
      success_text: text,
      error_text: text,
      fields: z.array(field),
    })
    .optional(),
  review_required: z.boolean().optional(),
});
export const serviceSchema = z.object({
  ...meta,
  slug: text.regex(/^[a-z0-9-]+$/),
  title: text,
  h1: text,
  pillar: z.enum(['grow', 'build', 'run', 'hire']),
  order: z.number().int(),
  icon: text,
  summary: text.max(140),
  intro: text,
  hero_image: image.optional(),
  included: z.array(item),
  outcomes: z.array(item),
  tools: z.array(text),
  process: z.array(item).length(4),
  pricing: z
    .object({ price_from: z.number().nonnegative().nullable(), unit: text, note: text })
    .optional(),
  faqs: z.array(faq),
  related: z.array(text).min(2).max(3),
  updated: date,
});
export const solutionSchema = z.object({
  ...meta,
  slug: text.regex(/^[a-z0-9-]+$/),
  title: text,
  h1: text,
  eyebrow: text,
  summary: text.max(180),
  lead: text,
  icon: text,
  order: z.number().int(),
  preview: image,
  highlights: z.array(item),
  sections: z.array(
    z.object({ id: text, title: text, intro: text.optional(), items: z.array(item) }),
  ),
  workflow: z.array(item),
  industries: z.array(item),
  setup_note: text,
  faqs: z.array(faq),
  updated: date,
});
export const blogSchema = z.object({
  ...meta,
  slug: text,
  title: text,
  excerpt: text.max(200),
  category: z.enum([
    'performance-marketing',
    'analytics',
    'cloud-workspace',
    'ai-automation',
    'web',
    'hiring',
  ]),
  author: text,
  published: date,
  updated: date,
  cover: image,
  related_service: text,
  draft: z.boolean(),
});
export const sectionSchema = z.object({
  type: z.enum([
    'hero',
    'marquee',
    'pillars',
    'split_statement',
    'service_grid',
    'solutions',
    'values',
    'process',
    'proof',
    'faq',
    'blog_teaser',
    'cta_band',
  ]),
  eyebrow: text.optional(),
  h1: text.optional(),
  title: text.optional(),
  lead: text.optional(),
  text: text.optional(),
  intro: text.optional(),
  statement: text.optional(),
  body: text.optional(),
  label: text.optional(),
  items: z.union([z.array(text), z.array(item)]).optional(),
  steps: z.array(item).optional(),
  promises: z.array(item).optional(),
  promises_title: text.optional(),
  signal_chips: z.array(text).optional(),
  pillar_tabs: z.array(z.object({ label: text, text: text, href: text })).optional(),
  primary_cta: link.optional(),
  secondary_cta: link.optional(),
  link: link.optional(),
  count: z.number().optional(),
});
export const homeSchema = z.object({ ...meta, sections: z.array(sectionSchema) });
export const siteSchema = z.object({
  brand_name: text,
  legal_name: text.nullable(),
  company_number: text.nullable(),
  registered_office: text.nullable(),
  vat_number: text.nullable(),
  tagline: text,
  site_url: z.string().url(),
  email: z.string().email(),
  phone: text.nullable(),
  booking_url: z.string().url().nullable(),
  booking_label: text,
  response_promise: text,
  service_area: text,
  opening_hours: text,
  socials: z.record(z.string().url().nullable()),
  default_og_image: text,
  favicon: text,
  logo: z.object({ light_on_dark: text, dark_on_light: text, search: text.optional(), alt: text }),
  analytics: z.object({ ga4_id: text.nullable(), gtm_id: text.nullable() }),
});
const evidence = { id: text, verified: z.boolean(), evidence_note: z.string() };
export const statSchema = z
  .object({ ...evidence, value: text, label: text, source_note: z.string() })
  .refine((v) => !v.verified || v.evidence_note.trim().length > 0, 'Verified claims need evidence');
export const testimonialSchema = z
  .object({
    ...evidence,
    name: text,
    role: text,
    company: text.nullable(),
    location: text,
    service: z.array(text),
    quote: text,
  })
  .refine(
    (v) => !v.verified || v.evidence_note.trim().length > 0,
    'Verified reviews need evidence',
  );
export const navSchema = z.object({
  header: z.array(link.extend({ mega: z.boolean().optional() })),
  header_cta: link,
  mega_menu: z.array(z.object({ pillar: text, label: text, blurb: text, items: z.array(text) })),
  mega_feature: z.object({ title: text, text: text, cta: link }),
  footer: z.object({ company: z.array(link), legal: z.array(link) }),
});
export type Section = z.infer<typeof sectionSchema>;
export type Item = z.infer<typeof item>;
export type Faq = z.infer<typeof faq>;
export type Service = z.infer<typeof serviceSchema> & {
  html: string;
  toc: { id: string; text: string }[];
};
export type Page = z.infer<typeof pageSchema> & {
  html: string;
  toc: { id: string; text: string }[];
};
export type Post = z.infer<typeof blogSchema> & {
  html: string;
  toc: { id: string; text: string }[];
  readTime: number;
};
export type Site = z.infer<typeof siteSchema>;
export type Solution = z.infer<typeof solutionSchema> & {
  html: string;
  toc: { id: string; text: string }[];
};
export type Content = {
  site: Site;
  home: z.infer<typeof homeSchema>;
  nav: z.infer<typeof navSchema>;
  services: Service[];
  solutions: Solution[];
  posts: Post[];
  pages: Page[];
  legal: Page[];
  faqs: { groups: { key: string; label: string; items: Faq[] }[] };
  stats: z.infer<typeof statSchema>[];
  testimonials: z.infer<typeof testimonialSchema>[];
  ui: Record<string, string>;
  hasLogo: boolean;
};
