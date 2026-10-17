# AGENTS.md: instructions for AI coding/content agents (Codex, ChatGPT, Claude)

This repo is the AVRIX Digital website (avrixdigital.co.uk).
- `content/`: **all website copy and settings** (Markdown + JSON). Most requests only touch this folder.
- `frontend/`: React + Vite + vite-react-ssg. Prerenders every page to static HTML.
- `backend/`: Django API + admin panel. **Only** handles enquiries and newsletter sign-ups.

## Golden rules
1. **British English** (optimise, colour, enquiry, organisation, programme, licence (noun) / license (verb)).
2. **UK-wide positioning.** Say "UK businesses" / "across the UK". Don't add regional (e.g. East Midlands) targeting to titles, meta or headings.
3. **Voice:** human, practical, honest, results-driven, plain English, no jargon without explanation. Short sentences. Talk about outcomes (leads, revenue, time saved, risk reduced).
4. **Never invent** client names, testimonials, statistics, results, awards, certifications or partner status. If a fact is needed and you don't have it, leave a `TODO(owner):` note in the PR description, not in live copy.
5. `verified: true` on any testimonial/stat requires a human-supplied `evidence_note`. Never flip it yourself.
6. Content-only requests → change only `content/**`. Don't touch code unless asked.
7. Keep URLs stable. If you rename or delete a page, add a 301 to `frontend/public/_redirects`.
8. Run `npm run content:validate && npm run build` (from `frontend/`) before opening a PR. Fix any errors.
9. Open a PR (never push to `main`). Title format: `content: <summary>` / `feat: …` / `fix: …`. Fill in the PR template.
10. No secrets in commits.

## Content schemas (summary; full zod schemas in `frontend/src/content/schemas.ts`)

### Service: `content/services/{slug}.md`
```yaml
---
slug: ga4-consulting                 # must match filename and URL
title: GA4 Consulting                # nav/card name
pillar: grow                         # grow | build | run | hire
order: 2
icon: ga4                            # file in content/assets/icons/{icon}.svg
h1: "GA4 set up properly, so you know what's actually working"
seo_title: "GA4 Consulting for UK Businesses | AVRIX Digital"      # ≤ 60
seo_description: "..."                                            # 120–160
summary: "One-line card summary (≤ 140 chars)"
intro: "Hero lead paragraph"
hero_image: { src: /media/covers/services/ga4-consulting.svg, alt: "..." }  # optional; content/assets/** is served at /media/**
included: [ { title: "...", text: "..." } ]
outcomes: [ { title: "...", text: "..." } ]
tools: [ "GA4", "Google Tag Manager" ]
process: [ { title: "...", text: "..." } ]                        # exactly 4
pricing: { price_from: 499, unit: "one-off", note: "..." }        # optional; omit to hide
faqs: [ { q: "...", a: "..." } ]
related: [ performance-marketing, web-development ]
updated: 2026-10-17
---
## The challenge
...
## Our approach
...
```

### Blog post: `content/blog/{slug}.md`
```yaml
---
slug: ...
title: ...
seo_title: ...          # ≤ 60
seo_description: ...    # 120–160
excerpt: ...            # ≤ 200
category: analytics     # performance-marketing | analytics | cloud-workspace | ai-automation | web | hiring
author: avrix-team
published: 2026-10-17
updated: 2026-10-17
cover: { src: /media/covers/blog/{slug}.svg, alt: "..." }  # replace with real photo later
related_service: ga4-consulting
draft: false
---
(Markdown body; start at H2; no H1)
```

### Testimonial / stat items
```json
{ "id": "...", "verified": false, "evidence_note": "", ... }
```
Only items with `verified: true` render on the site.

## Where things live
| Need to change… | File |
|---|---|
| Phone, email, address, socials, booking link, company number | `content/site.json` |
| Menus | `content/navigation.json` |
| Homepage sections | `content/home.json` |
| General FAQs | `content/faqs.json` |
| A service page | `content/services/{slug}.md` |
| About / Contact / FAQs intro / Services hub intro | `content/pages/*.md` |
| Legal pages | `content/legal/*.md` |
| Redirects | `frontend/public/_redirects` |
| Brand colours/fonts | `frontend/src/styles/tokens.css` (developer change) |
