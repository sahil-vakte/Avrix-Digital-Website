import fs from 'node:fs';
import { loadEnv } from 'vite';
import { createElement } from 'react';
import { execFileSync } from 'node:child_process';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import satori from 'satori';
import { decompress } from 'wawoff2';
import { loadContent } from '../src/content/loader';
import { buildRoutes, ogSlug } from '../src/content/routes';
const c = loadContent();
const routes = buildRoutes(c);
const base = c.site.site_url;
const production =
  (process.env.VITE_SITE_ENV || loadEnv('production', process.cwd(), 'VITE_').VITE_SITE_ENV) ===
  'production';
const esc = (v: string) =>
  v.replace(
    /[<>&"']/g,
    (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[ch]!,
  );
let fallback = new Date().toISOString().slice(0, 10);
try {
  fallback =
    execFileSync('git', ['log', '-1', '--format=%cs'], { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim() || fallback;
} catch {
  /* ZIP builds use the build date. */
}
fs.writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
    .filter((r) => !r.noindex)
    .map((r) => `<url><loc>${base}${r.path}</loc><lastmod>${r.updated || fallback}</lastmod></url>`)
    .join('')}</urlset>`,
);
fs.writeFileSync(
  'dist/robots.txt',
  production
    ? `User-agent: *\nAllow: /\nDisallow: /thank-you/\nSitemap: ${base}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n',
);
fs.writeFileSync(
  'dist/rss.xml',
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(c.site.brand_name)}</title><link>${base}/blog/</link><description>${esc(c.pages.find((p) => p.slug === 'blog')!.seo_description)}</description><language>en-gb</language>${c.posts.map((p) => `<item><title>${esc(p.title)}</title><link>${base}/blog/${p.slug}/</link><guid>${base}/blog/${p.slug}/</guid><description>${esc(p.excerpt)}</description><pubDate>${new Date(p.published).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`,
);
fs.mkdirSync('dist/og', { recursive: true });
const font = await decompress(
  fs.readFileSync(
    'node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2',
  ),
);
const fontData = font.buffer.slice(
  font.byteOffset,
  font.byteOffset + font.byteLength,
) as ArrayBuffer;
fs.writeFileSync('public/fonts/display.ttf', font);
const template = fs
  .readFileSync('../content/assets/graphics/og-template.svg', 'utf8')
  .replace(/<text[^>]*>\{\{TITLE\}\}<\/text>/, '')
  .replaceAll('{{EYEBROW}}', esc(c.site.service_area.toUpperCase()))
  .replace(
    '{{LOGO}}',
    `data:image/png;base64,${(await sharp(`public${c.site.logo.light_on_dark}`).png().toBuffer()).toString('base64')}`,
  );
for (const r of routes) {
  const overlay = await satori(
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          width: 1056,
          height: 320,
          fontSize: 64,
          lineHeight: 1.05,
          fontFamily: 'Bricolage',
          fontWeight: 700,
          color: 'white',
          alignItems: 'center',
        },
      },
      r.h1.replaceAll('*', ''),
    ),
    {
      width: 1056,
      height: 320,
      fonts: [{ name: 'Bricolage', data: fontData, weight: 700, style: 'normal' }],
    },
  );
  const merged = template.replace(
    '</svg>',
    `<g transform="translate(72 160)">${overlay.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`,
  );
  fs.writeFileSync(
    `dist/og/${ogSlug(r.path)}.png`,
    new Resvg(merged, { font: { fontFiles: ['public/fonts/display.ttf'], loadSystemFonts: false } })
      .render()
      .asPng(),
  );
}
fs.copyFileSync('dist/og/home.png', 'dist/og/default.png');
for (const folder of ['services', 'blog'])
  for (const file of fs.readdirSync(`../content/assets/covers/${folder}`)) {
    const name = file.replace(/\.svg$/, '');
    for (const width of [640, 1280])
      for (const format of ['webp', 'avif'] as const)
        await sharp(`../content/assets/covers/${folder}/${file}`)
          .resize(width)
          .toFormat(format, { quality: 75, effort: 0 })
          .toFile(`dist/media/covers/${folder}/${name}-${width}.${format}`);
  }
const notFound = 'dist/404/index.html';
if (fs.existsSync(notFound)) fs.copyFileSync(notFound, 'dist/404.html');
if (!production) fs.appendFileSync('dist/_headers', '\n/*\n  X-Robots-Tag: noindex, nofollow\n');
fs.writeFileSync(
  'dist/routes.json',
  JSON.stringify(
    routes.map((r) => ({ path: r.path, noindex: !!r.noindex })),
    null,
    2,
  ),
);
console.log(
  `Generated sitemap, RSS, robots, ${routes.length} OG images, responsive covers and favicons.`,
);
