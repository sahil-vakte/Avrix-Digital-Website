# Acceptance self-check

✅ = implemented and/or supported by the stated local evidence. ⚠️ = not fully satisfied or not verified; do not treat it as a pass. No Lighthouse or browser score is invented.

| Checklist item from the build pack | Result and evidence |
| --- | --- |
| Monorepo and local setup ≤10 commands | ✅ Frontend/backend/content/deploy/GitHub directories; README includes ten numbered commands. Components are grouped into cohesive modules rather than one file for every visual primitive. |
| `npm ci && npm run build` prerenders every route | ✅ Static prerender tested; includes all nine services, six category routes, posts, legal pages, confirmations and 404. Pagination is generated when posts exceed twelve. |
| Pytest and production deploy check | ✅ See recorded test output; production `check --deploy --fail-level WARNING` passes with strong test configuration. |
| Docker Compose serves API/admin | ⚠️ Compose, Dockerfile and Caddy supplied; Docker is not available here, so container/TLS deployment was not executed. |
| Copy from content; no theme/demo text in components | ✅ Supplied copy retained, with additional UI labels in `content/ui.json`; loader strips editor notes and gates proof. |
| All nine services and all supplied page/post/legal content | ✅ Content schemas, generated routes and prerendered HTML. |
| Unverified proof absent, including structured data | ✅ Loader removes it before generation; unit and HTML checks cover leakage. |
| No regional targeting in titles/meta/H1 | ✅ Validated by content and HTML checks. |
| Footer hides missing site fields | ✅ Conditional fields, null socials hidden, text logo fallback. |
| Unique title/description/canonical/H1/OG/lang | ✅ Static SEO checker covers generated route output and generated PNG existence. |
| Schema.org validation | ⚠️ JSON parses locally; Organization/WebSite/ProfessionalService/Service/FAQ/Breadcrumb/BlogPosting/About/Contact builders supplied. External Schema.org validator not run. |
| Sitemap, robots, RSS and noindex previews | ✅ Build generation and environment handling implemented. Production/preview metadata must still be checked on actual hosting. |
| Redirects cover audited inventory | ⚠️ Supplied file retained, including mappings; query-string rule requires Cloudflare setup. The pack's 301/410 and author-destination conflicts are documented in README. |
| Design tokens/type/components and alternating sections | ✅ Exact supplied colour tokens, self-hosted font families, dark heroes, content-driven section rhythm, forms/menu/FAQ/cards/footer. ⚠️ Visual fidelity not browser-reviewed. |
| Mega menu mouse/keyboard/touch; mobile at 320px | ⚠️ Hover/focus/click, arrow keys, Esc and modal mobile dialog implemented. Keyboard interaction and device layout were not browser-tested. |
| All motion patterns and reduced motion | ⚠️ Hero reveal, scroll reveal/stagger, process draw, count-up, marquee, magnetic CTAs, cursor glow, parallax, route fade, mobile clip reveal and FAQ reveal supplied. Hero words are grouped by measured rows after hydration and SVG icon strokes draw on hover. FAQ reveal uses opacity/clip-path rather than Motion layout-height. Reduced-motion rules are implemented, but full catalogue parity is not certified. |
| Fully readable without JS | ✅ Static HTML contains content, forms, FAQs and links; native details works without JS, with a noscript navigation/email fallback. Form POST requires JS; the email fallback remains available. |
| No horizontal scrolling at five widths | ⚠️ Responsive CSS implemented; browser security blocked visual/device checks. |
| Lighthouse mobile target scores | ⚠️ Not measured. CI configuration enforces the requested scores. |
| LCP/CLS/first-load JS targets | ⚠️ Build-size evidence included; CSS is under budget. Full first-load resources and real CWV have not been measured. Application-only build-graph estimates are recorded in `verification/bundle-budget.json`; third-party Turnstile and real browser network totals remain unmeasured. |
| axe zero serious/critical issues | ⚠️ CI gate supplied; not run here because browser inspection was blocked. |
| Enquiry form validation/spam/UTM/success/error | ✅ Frontend unit tests; backend spam/Turnstile/throttle tests; static form markup. ⚠️ Real Turnstile and browser end-to-end not verified. |
| Submission saves, sends two emails, appears in admin | ✅ Automated tests cover saved records, attribution, two delivered test-backend messages and admin pages. ⚠️ Real SMTP credentials must be verified. |
| Admin dashboard/filters/actions/export/Sales permissions | ✅ Tested list/detail/actions/filtering/formula-safe CSV and permissions; dashboard and timeline implemented. CSV and XLSX export dependencies are included and both formats are tested. |
| Newsletter double opt-in end to end | ✅ API tests exercise creation, confirmation, expiry and unsubscribe. ⚠️ Browser/real-mail loop remains to be run. |
| Retention command | ✅ Dry-run and delete tests; won rows retained; cron sample included. |
| PR checks and preview comment | ⚠️ Workflows supplied; no repository/account was connected. Fork previews intentionally do not receive secrets. |
| Merge deploys frontend and changed backend with health rollback | ⚠️ Workflows and rollout script supplied; live deployment/rollback not exercised. Backend also deploys on deploy-file changes as required by the CI/CD spec. |
| Branch protection; AI instructions; PR template | ✅ Seed instructions and template unchanged. ⚠️ Real CODEOWNERS handle and GitHub branch/environment protection require account setup. |
| Equal Accept/Reject; GA4 absent before consent | ✅ Equal-styled controls and consent unit tests. ⚠️ Network behaviour and GTM tag configuration require live browser verification. |
| Legal pages linked in footer/form | ✅ Links present. ⚠️ Original legal templates still require business details/review. |
| Limited-company footer details | ⚠️ No registration facts supplied. Fields remain null and hidden; fill genuine details if applicable. |

## Additional checks

- Backend email jobs are durable database records, retried by a worker, with per-job locking and an admin failure indicator.
- Submitted spreadsheet cells are escaped in CSV exports to avoid formula execution.
- Newsletter confirmations expire in 48 hours, are rate-limited and use separate unsubscribe tokens.
- Dependency audit is **not clean** under the mandated legacy major versions; see README and `verification/npm-audit.json`.
- No live credentials, real lead records or personal test data are included in the archive.
