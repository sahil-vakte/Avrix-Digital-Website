# Page Specs: layout of every route

All copy comes from `/content`. **Don't hard-code copy in components.** Section order below is the default. Where a content file has a `sections` array, render in that order (so AI editors can reorder sections by editing JSON).

## Route table

| Route | Template | Source |
|---|---|---|
| `/` | Home | `content/home.json` |
| `/about/` | About | `content/pages/about.md` |
| `/services/` | ServicesHub | `content/pages/services.md` + all `content/services/*.md` |
| `/services/{slug}/` ×9 | ServiceDetail | `content/services/{slug}.md` |
| `/faqs/` | Faqs | `content/pages/faqs.md` + `content/faqs.json` + service FAQs |
| `/contact-us/` | Contact | `content/pages/contact.md` |
| `/thank-you/` | ThankYou (noindex) | inline |
| `/blog/` | BlogIndex (+ `/blog/page/{n}/` if > 12 posts) | `content/blog/*.md` |
| `/blog/category/{slug}/` | BlogIndex filtered | derived |
| `/blog/{slug}/` | BlogPost | `content/blog/{slug}.md` |
| `/privacy-policy/`, `/cookie-policy/`, `/terms/` | Legal | `content/legal/*.md` |
| `/404` | NotFound (served for unknown paths) | `content/pages/404.md` |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | generated at build | scripts |

---

## Global (every page)
1. Skip link → Header (transparent on hero) → `<main>` → CTA band (unless the page opts out with `hide_cta_band: true`) → Footer.
2. **Footer** (dark): big "Make it count." wordmark line; columns: *Services* (all 9), *Company* (About, FAQs, Blog, Contact), *Legal* (Privacy, Cookies, Terms, Cookie preferences button); contact block (email, phone if set, booking link); newsletter mini-form; social icons (only those with URLs); bottom row: `© {year} {legal_name}. Registered in England & Wales No. {company_number}. Registered office: {address}`. Hide any missing fields gracefully.
3. **Cookie banner** on first visit.

## Home `/`
| # | Section | Component | Notes |
|---|---|---|---|
| 1 | Hero | `HeroHome` | Dark. Eyebrow, H1 (display-xl) with serif-italic emphasis word, lead, primary CTA "Book a free 30-minute call", secondary "Explore services". Animated mesh + signal chips. Below the fold edge: 3 pillar tabs ("Grow · Run · Hire") replacing the old slider: static content, no carousel |
| 2 | Platform strip | `Marquee` | Text/logo marquee of platforms worked with (text-only by default: partner logos need permission) |
| 3 | Three pillars | `PillarCards` | Grow (marketing + analytics), Build & Run (web, apps, cloud, automation), Hire (talent). Each links to its services |
| 4 | Intro / positioning | `SplitStatement` | Large statement left, supporting paragraph + "About us" link right |
| 5 | Services grid | `ServiceGrid` | All 9 service cards grouped, cursor glow |
| 6 | Why AVRIX | `ValueGrid` | 4 differentiators (one partner, plain English reporting, you own your accounts, flat fees) |
| 7 | How we work | `Process` | 01 Discover → 02 Plan → 03 Build & launch → 04 Measure & improve, with a drawn connector line |
| 8 | Proof | `Stats` + `Testimonials` | **Render only verified items.** If none are verified, show the "Our promises" block instead (content in home.json: `promises`) |
| 9 | FAQ (6 items) | `FaqAccordion` | from `faqs.json` where `show_on_home: true` |
| 10 | Insights | `BlogTeaser` | Latest 3 posts |
| 11 | CTA band | `CtaBand` | |

## About `/about/`
1. Page hero (dark): H1, lead.
2. Story (light): two-column, founder/team image slot (`team_image`, optional) + story copy.
3. Values (3 cards).
4. What we do (compact service list grouped by pillar).
5. How we work (reuse the Process component).
6. Team (optional collection `team` in front matter; hidden if empty: **no placeholder people**).
7. CTA band.

## Services hub `/services/`
1. Page hero: H1 "Services", lead.
2. Pillar filter chips (All · Grow · Build & automate · Run & secure · Hire). Filtering is a client-side enhancement; all cards stay in the HTML.
3. Services grid (9 cards with summary, 3 bullet outcomes, "from" price if present).
4. "Not sure where to start?" helper: 3 common scenarios → recommended service.
5. FAQ (general).
6. CTA band.

## Service detail `/services/{slug}/`
| # | Section | Source (front matter) |
|---|---|---|
| 1 | Hero: breadcrumbs, eyebrow (pillar), H1 = `h1`, lead = `intro`, CTAs, hero image/graphic | `h1`, `intro`, `hero_image` |
| 2 | Sticky in-page nav (desktop): Overview · What's included · Process · Pricing · FAQs | auto |
| 3 | Overview: the problem → our approach (2 columns) | body sections `## The challenge` / `## Our approach` |
| 4 | What's included: icon list grid | `included[]` |
| 5 | Outcomes: 3–4 benefit cards | `outcomes[]` |
| 6 | Platforms & tools (chips) | `tools[]` |
| 7 | Process (service-specific 4 steps) | `process[]` |
| 8 | Pricing "from" + what affects price (if `price_from` set) | `pricing` |
| 9 | FAQs (FAQPage schema) | `faqs[]` |
| 10 | Related services (2–3) | `related[]` |
| 11 | Enquiry form pre-selected with this service | — |
| Mobile | Sticky bottom bar: "Book a call" + "Enquire" | — |

## FAQs `/faqs/`
Hero → search box (client-side filter, enhancement only) → grouped accordions: General, Working with us, Pricing & contracts, then one group per service (pulled from each service's `faqs[]`) → CTA.

## Contact `/contact-us/`
1. Hero (dark), H1 "Let's talk about what you need", lead, response promise.
2. Two columns: **left** = enquiry form (full version); **right** = "Prefer to talk?" card with booking link, email, phone (if set), "What happens next" 3-step list, privacy reassurance.
3. FAQ: 3 contact-related questions.
Hide the global CTA band on this page.

## Blog index `/blog/`
Hero (H1 "Insights") → category chips → featured latest post (large) → grid (12 per page) → newsletter CTA.
Each card: image, category, title, excerpt, read time, date.

## Blog post `/blog/{slug}/`
Breadcrumbs → category + read time → H1 → author + date (published/updated) → hero image → table of contents (auto from H2s, sticky on desktop) → prose → "Related service" CTA card (from `related_service`) → author box → related posts (3) → CTA band.

## Legal pages
Simple prose layout, "Last updated" date from front matter, ToC.

## 404
Dark, big "404", "This page doesn't count.", links to Home, Services, Contact, and a search-like list of all services.

## Thank you `/thank-you/` (noindex)
Confirmation, what happens next, a link to book a call, 3 latest posts. Fires the GA4 `generate_lead` event **only if consent was granted** (the form also fires it on success; de-duplicate with a session flag).
