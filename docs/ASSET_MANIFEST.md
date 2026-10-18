# Asset Manifest

## A. Included in this pack (`repo-seed/content/assets/`)

| Path | What | Use |
|---|---|---|
| `icons/*.svg` (19) | 1.5px line icons, `currentColor`, 24×24 | 9 services, 4 process steps, 4 values, arrow, tick |
| `graphics/hero-mesh.svg` | Ink background, iris/aqua/volt glow, dot grid | Home hero background (animate `background-position` / parallax) |
| `graphics/cta-mesh.svg` | Wide gradient mesh | CTA band background |
| `graphics/grain.svg` | Tileable noise at 6% | Overlay on dark sections |
| `graphics/grid-lines.svg` | 4-column hairline grid | Signature grid overlay on dark sections |
| `graphics/og-template.svg` | 1200×630 OG layout with `{{EYEBROW}}`/`{{TITLE}}` | Build script generates `/og/{slug}.png` |
| `graphics/favicon-placeholder.svg` | **Placeholder** monogram | Replace with the real logo mark |
| `covers/services/*.svg` (9) | 1600×900 branded service covers | Service hero image + cards until real photography exists |
| `covers/blog/*.svg` (3) | 1600×900 branded article covers | Blog covers |

Served at `/media/**` (the build copies `content/assets` → `dist/media`). The build should also rasterise covers to AVIF/WebP for `og:image` and social sharing.

## B. Existing assets to bring across (download from the live site before it's switched off)

| Asset | Current URL | Action |
|---|---|---|
| Logo (white, for dark backgrounds) | https://avrixdigital.co.uk/wp-content/uploads/2026/03/cropped-Avrix_Logo_White.png | **Ask the designer for the SVG master.** Save as `content/assets/brand/avrix-logo-white.svg` |
| Logo (black, for light backgrounds) | https://avrixdigital.co.uk/wp-content/uploads/2026/03/Avrix_Logo_Back-1.png | → `brand/avrix-logo-black.svg` |
| Favicon | https://avrixdigital.co.uk/wp-content/uploads/2025/11/fevicon-1.webp | Recreate as `favicon.svg` + 32/180/192/512 PNGs |
| "MAKE IT COUNT" wordmark | https://avrixdigital.co.uk/wp-content/uploads/2025/11/MAKE-IT-COUNT.png | Optional: the new footer sets this in live type instead |
| M365 hero | …/2026/03/microsoft-365.webp | Optional reuse (check licence) |
| Service photos (Envato stock, e.g. `robot-and-woman-working-on-laptop…`, `tablet-presentation-and-business-people…`, `businessman-holding-cloud-computing-diagram…`) | …/2026/03/*.jpg | Reuse only if the licence covers it. **Don't reuse** `a-man-takes-out-a-suspicious-person-from-the-crowd…` for recruitment (wrong message) |

**Don't bring across:** theme demo images (`h2-img-*`, `p2-img-*`, `p3-*`, `f3-*`, `os1-*`, `cta2-*`, `author-7.webp` "Lisa", `hy-icon.gif`), or the themexriver demo video.

## C. Photography wish-list (highest impact on trust)
1. Founder/team portraits: dark backdrop, side light, 4:5 and 1:1 crops.
2. Candid working shots: workshop at a whiteboard, laptop with a dashboard, video call.
3. Screens of real work (anonymised dashboards, automation flows, website builds) for future case studies.

## D. AI image prompts (for abstract hero art, if no photography yet)
Keep everything abstract: **no people, no logos, no text in the image.**

1. *Hero (home):* "Abstract dark navy-black background, soft volumetric glow in violet (#6D5BFF) and aqua (#3AE0D4) with a faint lime (#D4FF3A) highlight, fine dot grid, subtle film grain, premium tech consultancy aesthetic, minimal, wide 16:9, no text"
2. *Grow pillar:* "Minimal 3D glass bars rising left to right on a near-black background, violet-to-aqua gradient reflections, soft studio lighting, abstract data growth, no text"
3. *Build pillar:* "Abstract floating translucent UI panels and connected nodes on a black background, aqua and violet light trails, clean and minimal, no text"
4. *Run pillar:* "Abstract translucent glass shield and cloud forms on a dark background, cool violet lighting, a single lime accent light, minimal, no text"
5. *Hire pillar:* "Abstract constellation of glowing points connecting into a network on a black background, violet and lime highlights, minimal, no text"

Export at 2400px wide and convert to AVIF/WebP in the build.
