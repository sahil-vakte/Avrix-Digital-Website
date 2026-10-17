# CI/CD Spec (GitHub Actions)

## Branching
- `main` = production. **Protected:** PR required, all checks green, 1 approval (the owner), no force-push.
- Work happens on `content/*`, `feat/*` and `fix/*` branches. AI tools (ChatGPT/Claude/Codex) always open PRs; they never push to `main`.
- Every PR gets a **Cloudflare Pages preview URL** posted as a comment, so the owner can review on a phone before merging.

## Workflows

### `.github/workflows/ci.yml` (on pull_request + push to main)
Jobs (run in parallel where possible):
1. **content**: `npm ci` → `npm run content:validate` (zod schemas for every file in `/content`: required fields, SEO lengths, alt text, valid internal links, slugs unique, `related[]` slugs exist, no `verified: true` without a `evidence_note`). Posts a readable summary to the PR on failure.
2. **frontend**: `npm run lint` (eslint) → `npm run typecheck` (tsc) → `npm run test` (vitest + Testing Library: form validation, consent logic, utm capture) → `npm run build` (prerender) → `npm run seo:check` (title/description/canonical/H1 checks on `dist`) → `npx linkinator dist --recurse --skip "^(?!http://localhost)"` → upload `dist` as an artifact.
3. **a11y + lighthouse**: serve `dist`, run `@lhci/cli autorun` with budgets from `05_SEO_SPEC.md` on `/`, `/services/`, `/services/ga4-consulting/`, `/contact-us/`, `/blog/` + `axe` via `@axe-core/cli`. Fail under budget.
4. **backend** (only if `backend/**` changed): Python 3.12, Postgres service container → `pip install -r requirements.txt` → `ruff check` → `python manage.py check --deploy` (with prod-like env) → `pytest --cov`.

### `.github/workflows/deploy-frontend.yml`
- Trigger: push to `main` touching `content/**` or `frontend/**`; plus `workflow_dispatch`.
- Steps: checkout (fetch-depth 0 so `lastmod` can use git dates) → setup-node 20 → `npm ci` → `npm run build` with `VITE_SITE_ENV=production` → `cloudflare/wrangler-action@v3` `pages deploy frontend/dist --project-name=avrix-website --branch=main`.
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, plus build vars (`VITE_*`) as repository variables.
- PR previews: the same workflow on `pull_request` deploys `--branch=${{ github.head_ref }}` with `VITE_SITE_ENV=preview` (noindex) and comments the URL.

> Simpler alternative: connect the repo directly in the Cloudflare Pages dashboard (build command `npm run build`, root `frontend`, output `dist`). Cloudflare then handles previews automatically. Keep CI checks in GitHub Actions either way.

### `.github/workflows/deploy-backend.yml`
- Trigger: push to `main` touching `backend/**` or `deploy/**`.
- Steps: build Docker image → push to GHCR (`ghcr.io/{owner}/avrix-api:{sha}` + `:latest`) → SSH to the server (`appleboy/ssh-action`) → `docker compose -f deploy/docker-compose.prod.yml pull && up -d` → curl `/api/health/` (retry 10×) → on failure roll back to the previous tag.
- Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `GHCR_TOKEN` (or use `GITHUB_TOKEN` with packages:write).

### `.github/workflows/scheduled.yml`
- Weekly: Lighthouse on production + a broken external link check → opens an issue if anything fails.
- Daily: call the retention purge (if not run by cron in the container).

## Repo hygiene files
- `.github/pull_request_template.md`: What changed / Why / Pages affected / Screenshots / Checklist (content validated, British English, no unverified claims, alt text added).
- `.github/CODEOWNERS`: `* @<owner-github-username>`.
- `.github/dependabot.yml`: npm + pip + github-actions, weekly, grouped.
- `.editorconfig`, `.nvmrc` (20), `.python-version` (3.12), Prettier config.

## Typical change timings
| Change | Path to live |
|---|---|
| Fix a typo / update a price | AI edits a file → PR → checks (~3 min) → merge → live in ~2 min |
| New blog post | AI adds `content/blog/{slug}.md` + image → PR preview → merge |
| New service page | AI adds `content/services/{slug}.md` + icon + nav entry → PR → merge |
| New section type | Developer task (component + schema), then content can use it |
