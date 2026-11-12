# AGENTS.md: instructions for AI coding/content agents (Codex, ChatGPT, Claude)

This repo is the AVRIX website (avrixdigital.co.uk): a cyber security site for UK and European businesses.
- `content/`: **all website copy and settings** (Markdown + JSON). Most requests only touch this folder.
- `frontend/`: React + Vite + vite-react-ssg. Prerenders every page to static HTML.
- `backend/`: Django API + admin panel. **Only** handles enquiries and newsletter sign-ups.

## Golden rules
1. **British English** (optimise, colour, enquiry, organisation, programme, licence (noun) / license (verb)).
2. **UK and Europe positioning.** Say "UK and European businesses" / "across the UK and Europe". Don't add regional (e.g. East Midlands) targeting to titles, meta or headings. Cover UK and EU rules where relevant (UK GDPR and EU GDPR, UK NIS and NIS2, DORA).
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
slug: penetration-testing           # must match filename and URL
title: Web & Mobile App Penetration Testing
pillar: offensive                   # offensive | managed | compliance | response
order: 1
icon: penetration-testing           # file in content/assets/icons/{icon}.svg
h1: "Penetration testing that finds what *scanners miss*"   # *words* render in the brand gradient
seo_title: "..."                                            # ≤ 60
seo_description: "..."                                      # 120–160
summary: "One-line card summary (≤ 140 chars)"
intro: "Hero lead paragraph"
tags: [ "OWASP Top 10", "Free retest" ]                     # optional, up to 4 hero chips
explainer: { title: "...", intro: "...", cards: [ { title, label, text, bullets: [...] } ] }  # optional
included: [ { title: "...", text: "..." } ]                 # "What's included" cards
outcomes: [ { title: "...", text: "..." } ]                 # key benefits
tools: [ "OWASP Top 10", "ISO 27001" ]                      # frameworks and standards strip
process: [ { title: "...", text: "..." } ]                  # 4 to 6 steps
deliverables: [ { title, text, bullets: [...] } ]           # optional
faqs: [ { q: "...", a: "..." } ]
related: [ api-security-testing, cloud-security-assessment ]
updated: 2026-11-12
---
## What is ...?
...
## How we ...
...
```

### Industry: `content/industries/{slug}.md`
Front matter only: `title`, `h1`, `eyebrow`, `icon`, `order`, `summary`, `lead`, `tagline`,
`tags` (4), `points` (3, shown on the homepage tabs), `pillars` (6 cards with `bullets`),
`lifecycle` (5 stages), `frameworks`, `services` (service slugs), `faqs`, `updated`, SEO fields.

### Blog post: `content/blog/{slug}.md`
```yaml
---
slug: ...
title: ...
seo_title: ...          # ≤ 60
seo_description: ...    # 120–160
excerpt: ...            # ≤ 200
category: compliance    # threats | compliance | guides
author: avrix-team
published: 2026-10-17
updated: 2026-10-17
cover: { src: /media/covers/blog/{slug}.svg, alt: "..." }  # replace with real photo later
related_service: cyber-essentials
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
