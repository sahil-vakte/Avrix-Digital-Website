import raw from './generated.json';
import type { Content } from './schemas';
export const content = raw as unknown as Content;
export const { site, home, nav, services, solutions, posts, ui } = content;
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
