import fs from 'node:fs';
import { load } from 'cheerio';
import { loadContent } from '../src/content/loader';
import { buildRoutes, ogSlug } from '../src/content/routes';
const routes = buildRoutes(loadContent());
const titles = new Set<string>();
const descriptions = new Set<string>();
const errors: string[] = [];
const warnings: string[] = [];
for (const r of routes) {
  const file = `dist${r.path}index.html`;
  if (!fs.existsSync(file)) {
    errors.push(`Missing ${file}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const $ = load(html);
  const title = $('title').text();
  const desc = $('meta[name="description"]').attr('content') || '';
  if (!title || title.length > 60 || titles.has(title))
    errors.push(`${r.path}: invalid/duplicate title`);
  titles.add(title);
  if (!desc) errors.push(`${r.path}: missing description`);
  if (descriptions.has(desc)) errors.push(`${r.path}: duplicate description`);
  descriptions.add(desc);
  if (desc.length < 120 || desc.length > 160)
    warnings.push(`${r.path}: supplied/derived description is ${desc.length} characters`);
  if (
    !$('link[rel="canonical"]').attr('href') ||
    $('h1').length !== 1 ||
    $('html').attr('lang') !== 'en-GB'
  )
    errors.push(`${r.path}: canonical/H1/lang`);
  if (!fs.existsSync(`dist/og/${ogSlug(r.path)}.png`)) errors.push(`${r.path}: missing OG`);
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      JSON.parse($(el).text());
    } catch {
      errors.push(`${r.path}: malformed JSON-LD`);
    }
  });
  if (/East Midlands/i.test(title + desc + $('h1').text()))
    errors.push(`${r.path}: regional targeting`);
  if (/Sarah K\.|James T\.|300%\+/.test(html)) errors.push(`${r.path}: unverified claim leakage`);
}
console.log(`${routes.length} pages checked.`);
warnings.forEach((w) => console.warn('OWNER REVIEW:', w));
errors.forEach((e) => console.error(e));
if (errors.length || (process.env.STRICT_SEO === '1' && warnings.length)) process.exit(1);
