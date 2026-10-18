# SEO Spec

## 1. Rendering
- Every route is **prerendered to static HTML** by `vite-react-ssg`. The HTML must contain: `<title>`, meta description, canonical, robots, OG/Twitter tags, JSON-LD, one H1, all body copy, FAQ answers (inside `<details>`) and internal links.
- **CI test:** after the build, a script parses each `dist/**/index.html` and fails if any page lacks a title, a meta description, a canonical or exactly one `<h1>`, or if the title/description is duplicated across pages.

## 2. URLs
- Lowercase, hyphenated, **trailing slash** (matches the existing WordPress URLs, so no ranking loss).
- Canonical host: `https://avrixdigital.co.uk/` (non-www). 301 `www` → apex at Cloudflare.
- Service URLs are **unchanged** from the current site.
- Redirects: `frontend/public/_redirects` (supplied). Before go-live, add any extra URL with traffic or backlinks from the GSC/GA4 exports.

## 3. Head template (component `<Seo>`)
```html
<html lang="en-GB">
<title>{seo_title}</title>                                   <!-- ≤ 60 chars, brand suffix " | AVRIX Digital" -->
<meta name="description" content="{seo_description}">       <!-- 140–160 chars -->
<link rel="canonical" href="{SITE_URL}{path}">
<meta name="robots" content="index,follow,max-image-preview:large"> <!-- noindex for /thank-you/, previews, 404 -->
<meta property="og:locale" content="en_GB">
<meta property="og:type" content="website|article">
<meta property="og:site_name" content="AVRIX Digital">
<meta property="og:title" content="{og_title || seo_title}">
<meta property="og:description" content="{seo_description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE_URL}/og/{slug}.png">      <!-- 1200×630, generated at build -->
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"> + png fallbacks + apple-touch-icon
<meta name="theme-color" content="#07080C">
```
Preview deployments (`*.pages.dev`) must output `noindex` (env `VITE_SITE_ENV !== 'production'`).

## 4. Structured data (JSON-LD builders in `src/components/seo/jsonld.ts`)

| Page | Types |
|---|---|
| All | `Organization` (name, legalName, url, logo, email, telephone?, sameAs[], address?), `WebSite` |
| Home | + `ProfessionalService` (areaServed: "GB", serviceType list, priceRange "££") |
| Service | `Service` (name, description, provider → Organization, areaServed GB, offers.price if `price_from`), `FAQPage`, `BreadcrumbList` |
| FAQs | `FAQPage`, `BreadcrumbList` |
| Blog index | `Blog`, `BreadcrumbList` |
| Blog post | `BlogPosting` (headline, datePublished, dateModified, author, image, publisher), `BreadcrumbList` |
| About | `AboutPage` + Organization |
| Contact | `ContactPage` |

Don't output `AggregateRating` or `Review` markup (self-serving reviews aren't eligible for review rich results, and the testimonials need verification first).

## 5. Generated files (build scripts)
- `sitemap.xml`: every indexable route with `<lastmod>` from front matter `updated` (falls back to git commit date). Excludes noindex/draft pages.
- `robots.txt`: production allows all, links the sitemap, disallows `/thank-you/`. Preview: `Disallow: /`.
- `rss.xml`: blog feed.
- `/og/{slug}.png`: auto-generated OG images (satori + resvg) using the template in `content/assets/graphics/og-template.svg`: dark ink background, page title in Bricolage, AVRIX wordmark, Volt accent bar.
- `llms.txt` (optional): plain-text site summary + key URLs for AI assistants.

## 6. On-page rules (enforced by content schema)
- `seo_title` ≤ 60 chars, `seo_description` 120–160 chars. The build warns outside these ranges and errors if a field is missing.
- One H1 per page (from `h1` front matter). The body Markdown starts at H2.
- Every image needs `alt` (the schema rejects empty alt unless `decorative: true`).
- Internal linking: each service page links to 2–3 related services and 1 relevant blog post; every blog post links to its `related_service`.
- Use UK spelling, UK-wide geography ("across the UK"). **Don't** use regional terms in titles/meta (positioning decision).

## 7. Performance budgets (Lighthouse CI on every PR, mobile profile)

| Metric | Budget |
|---|---|
| Performance | ≥ 95 (home ≥ 90 allowed because of hero motion) |
| Accessibility / Best practices / SEO | ≥ 98 / ≥ 100 / 100 |
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 150ms |
| JS (gzip) first load | < 120 KB |
| CSS (gzip) | < 30 KB |
| Fonts | ≤ 3 files preloaded (display + body woff2), `font-display: swap`, subset to Latin |

Techniques: route-level code splitting, Motion `LazyMotion` + `domAnimation` features only, no jQuery, no carousel library (CSS scroll-snap), images via `vite-imagetools` (AVIF/WebP, responsive `srcset`), inline critical CSS (`beasties`), preload the LCP font.

## 8. Analytics & consent
- Google Consent Mode v2: default `denied` for `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`; update on consent.
- GA4 (or GTM) loads only after consent. Events: `generate_lead` (form success, with `service` and `budget` params), `book_call_click`, `email_click`, `phone_click`, `newsletter_signup`, `file_download`.
- UTM/gclid/fbclid/msclkid captured on landing in `sessionStorage` (first-touch) and sent with the enquiry. This is first-party data that's strictly necessary to handle the enquiry; mention it in the privacy policy.

## 9. Launch checklist (SEO)
1. Export GSC (16 months) + GA4 landing pages → add any missing redirects.
2. Crawl the staging site with Screaming Frog: 0 broken links, 0 missing titles/H1s, every redirect resolves in one hop.
3. Switch DNS → verify `https://avrixdigital.co.uk/` serves the new site; test 20 old URLs for a 301.
4. Submit the new `sitemap.xml` in GSC and Bing Webmaster Tools; remove the old sitemaps.
5. Monitor GSC Coverage + Performance daily for 2 weeks, weekly for 2 months.
6. Update the Google Business Profile URL/description to match the new positioning.
