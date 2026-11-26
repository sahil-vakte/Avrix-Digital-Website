import raw from './generated.json';
import type { Content } from './schemas';
export const content = raw as unknown as Content;
export const {
  site,
  home,
  nav,
  services,
  solutions,
  offerings,
  caseStudies,
  posts,
  accreditations,
  ui,
} = content;
export { offeringPath } from './paths';
export const hub = (pillar: string) =>
  offerings.find((o) => o.pillar === pillar && o.slug === 'index')!;
export const subPages = (pillar: string) =>
  offerings.filter((o) => o.pillar === pillar && o.slug !== 'index');
export const findOffering = (key: string) => {
  const [pillar, slug] = key.split('/');
  return offerings.find((o) => o.pillar === pillar && o.slug === slug)!;
};
export const caseStudyHref = (slug: string) => `/case-studies/${slug}/`;
export const page = (slug: string) => {
  const result = [...content.pages, ...content.legal].find((p) => p.slug === slug);
  if (!result) throw new Error(`Missing page ${slug}`);
  return result;
};
export const resolveHref = (href = '') =>
  href.startsWith('booking_url_or:') ? site.booking_url || href.slice(15) : href;
export const serviceHref = (slug: string) => `/services/${slug}/`;
export const postHref = (slug: string) => `/blog/${slug}/`;
export const homeSection = (type: string) => home.sections.find((s) => s.type === type)!;
