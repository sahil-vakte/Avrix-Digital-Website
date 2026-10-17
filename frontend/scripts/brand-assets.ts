import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { Site } from '../src/content/schemas';

/** Generate conventional browser assets from the owner's supplied originals. */
export async function prepareBrandAssets(site: Site) {
  const source = (url: string) => path.join('../content/assets', url.replace(/^\/media\//, ''));
  const icon = source(site.favicon);
  const pngs = new Map<number, Buffer>();
  for (const size of [16, 32, 48, 96, 180, 192, 512]) {
    const png = await sharp(icon)
      .resize(size, size, { fit: 'contain', background: '#00000000' })
      .png()
      .toBuffer();
    pngs.set(size, png);
    fs.writeFileSync(
      size === 180 ? 'public/apple-touch-icon.png' : `public/favicon-${size}.png`,
      png,
    );
  }
  // PNG images inside a standard multi-size ICO container; no extra dependency.
  const sizes = [16, 32, 48];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + sizes.length * 16;
  const entries = sizes.map((size) => {
    const png = pngs.get(size)!;
    const entry = Buffer.alloc(16);
    entry[0] = size;
    entry[1] = size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  fs.writeFileSync(
    'public/favicon.ico',
    Buffer.concat([header, ...entries, ...sizes.map((size) => pngs.get(size)!)]),
  );
  // Preserve the old favicon URL while replacing its placeholder artwork.
  fs.writeFileSync(
    'public/favicon.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,${pngs.get(96)!.toString('base64')}"/></svg>`,
  );
  const logo = await sharp(source(site.logo.light_on_dark))
    .resize({ width: 410, height: 112, fit: 'inside' })
    .png()
    .toBuffer();
  const searchLogo = await sharp({
    create: { width: 512, height: 160, channels: 4, background: '#1b1614' },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer();
  for (const directory of ['public/media/brand', 'public/brand']) {
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(`${directory}/avrix-logo-search.png`, searchLogo);
  }
  fs.writeFileSync(
    'public/site.webmanifest',
    JSON.stringify(
      {
        name: site.brand_name,
        short_name: site.brand_name,
        start_url: '/',
        display: 'standalone',
        theme_color: '#1b1614',
        background_color: '#1b1614',
        icons: [192, 512].map((size) => ({
          src: `/favicon-${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'any',
        })),
      },
      null,
      2,
    ),
  );
}
