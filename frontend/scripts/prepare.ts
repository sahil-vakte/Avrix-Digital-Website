import fs from 'node:fs';
import path from 'node:path';
import { loadContent } from '../src/content/loader';
import { prepareBrandAssets } from './brand-assets';
fs.mkdirSync('src/content', { recursive: true });
const data = loadContent();
for (const collection of ['pages', 'legal', 'services', 'solutions', 'posts'] as const) {
  const bodies = Object.fromEntries(
    data[collection].map((p) => [p.slug, { html: p.html, toc: p.toc }]),
  );
  fs.writeFileSync(`src/content/generated-${collection}.json`, JSON.stringify(bodies));
}
fs.writeFileSync(
  'src/content/generated.json',
  JSON.stringify(data, (key, value) => (key === 'html' ? '' : key === 'toc' ? [] : value)),
);
fs.cpSync('../content/assets', 'public/media', { recursive: true });
fs.cpSync('../content/assets/brand', 'public/brand', { recursive: true });
await prepareBrandAssets(data.site);
fs.mkdirSync('public/fonts', { recursive: true });
for (const [pkg, name, match] of [
  ['@fontsource-variable/bricolage-grotesque', 'display', 'latin-standard-normal.woff2'],
  ['@fontsource-variable/geist', 'body', 'latin-wght-normal.woff2'],
  ['@fontsource-variable/geist-mono', 'mono', 'latin-wght-normal.woff2'],
  ['@fontsource/instrument-serif', 'serif', 'latin-400-italic.woff2'],
]) {
  const dir = `node_modules/${pkg}/files`;
  const file = fs.readdirSync(dir).find((f) => f.endsWith(match) && !f.includes('latin-ext'));
  if (!file) throw new Error(`Missing font ${pkg}`);
  fs.copyFileSync(path.join(dir, file), `public/fonts/${name}.woff2`);
}
