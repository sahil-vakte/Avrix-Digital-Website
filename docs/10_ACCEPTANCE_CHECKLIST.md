# Acceptance Checklist: "done" means all of these pass

## Build & structure
- [ ] Monorepo matches `02_ARCHITECTURE.md` §4; `README.md` explains local setup in ≤ 10 commands.
- [ ] `cd frontend && npm ci && npm run build` produces static HTML for **every** route in `04_PAGE_SPECS.md` (check `dist/services/ga4-consulting/index.html` contains the H1 and FAQ text).
- [ ] `cd backend && pytest` passes; `python manage.py check --deploy` passes with prod settings.
- [ ] `docker compose -f deploy/docker-compose.prod.yml up` serves the API + admin locally.
- [ ] All copy comes from `/content`; `grep -r "Lorem\|Avista\|Lisa\|themexriver" frontend/src` returns nothing.

## Content
- [ ] All 9 services, About, Contact, FAQs, Services hub, Blog (3 posts), Legal ×3 and 404 render from content files.
- [ ] Testimonials/stats with `verified:false` don't appear anywhere (including JSON-LD).
- [ ] No "East Midlands" in any title, meta or H1.
- [ ] Footer shows only `site.json` fields that are filled in.

## SEO
- [ ] Every page: unique title ≤ 60, description 120–160, canonical, one H1, OG image, `lang="en-GB"`.
- [ ] JSON-LD validates in the Schema.org validator for Home, one Service, FAQs and one Blog post.
- [ ] `sitemap.xml`, `robots.txt`, `rss.xml` generated; preview builds are `noindex`.
- [ ] `_redirects` covers every URL in `01_SITE_AUDIT.md` §7.

## Design & motion
- [ ] Matches the tokens/type/components in `03_DESIGN_SYSTEM.md`; dark hero, alternating sections.
- [ ] Mega menu works by mouse, keyboard and touch; mobile sheet nav works at 320px.
- [ ] All motion from the catalogue is implemented; `prefers-reduced-motion` disables it.
- [ ] Pages are fully readable with JavaScript disabled.
- [ ] No horizontal scroll at 320/375/768/1024/1440px.

## Performance & accessibility (Lighthouse mobile)
- [ ] Performance ≥ 95 (home ≥ 90), Accessibility ≥ 98, Best Practices 100, SEO 100.
- [ ] LCP < 2.0s, CLS < 0.05, first-load JS < 120 KB gzip.
- [ ] axe: zero serious/critical issues.

## Forms & admin
- [ ] Enquiry form: validation, honeypot, Turnstile, UTM capture, success + error states, email fallback.
- [ ] Submission creates an Enquiry, sends a team email + auto-reply, and appears in the admin with attribution.
- [ ] Admin dashboard cards, filters, bulk actions and CSV export work; the Sales group can't delete.
- [ ] Newsletter double opt-in works end to end.
- [ ] Retention command works.

## CI/CD
- [ ] PR → all checks run → preview URL commented.
- [ ] Merge to `main` → frontend live on Cloudflare Pages; backend redeploys only when `backend/**` changes; health check gates the rollout.
- [ ] Branch protection on; `AGENTS.md`/`CLAUDE.md` present; PR template present.

## Compliance
- [ ] Cookie banner with equal Accept/Reject; GA4 doesn't load before consent (check the Network tab).
- [ ] Privacy, Cookie and Terms pages linked in the footer and the form.
- [ ] Company details in the footer (if a limited company).
