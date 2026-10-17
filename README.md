# AVRIX Digital website

React + TypeScript + Vite prerendered website, Django API/admin and PostgreSQL.

## Deploy the website and admin together on Cloudflare

Use **Workers & Pages → Create → Import a repository → Workers**, with repository root `/`, Worker name `avrix-digital-website`, build command `npm run build:cloudflare` and deploy command `npm run deploy:cloudflare`. This uses Workers Static Assets and a Django Container, rather than a static Pages deployment. See [the complete setup](docs/CLOUDFLARE.md) for the required database, secrets, Turnstile and email settings, and connecting your domain later.

The admin is at `/manage-7f3k/`; the private, token-protected initial superadmin registration route is `/admin-setup/`. Local `.env` files, database contents and credentials are excluded from Git and the Docker image.

Build output is generated from source. Historical Pages/VPS instructions below describe the alternative deployment and are not the full-stack Cloudflare setup.

## Local setup — 10 commands

Prerequisites: Node 20, npm, Python 3.12. Use Bash (macOS/Linux/WSL) from the extracted `avrix-website` directory. Keep both terminal processes running. Django uses SQLite locally and prints emails to the terminal.

Terminal A:

```bash
cd frontend                                      # 1
cp .env.example .env                            # 2
npm ci                                          # 3
npm run dev                                     # 4
```

Terminal B, starting at the repository root:

```bash
cd backend                                      # 5
python3 -m venv .venv                            # 6
source .venv/bin/activate                        # 7
pip install -r requirements.lock.txt             # 8
cp .env.example .env && python manage.py migrate && python manage.py createcachetable && python manage.py createsuperuser  # 9
python manage.py runserver                       # 10
```

Frontend: http://localhost:5173. API: http://localhost:8000/api/health/. Admin: http://localhost:8000/manage-7f3k/. In PowerShell, use `.venv\Scripts\Activate.ps1` and `Copy-Item` instead of `source` and `cp`; run the three management commands separately.

The supplied development Turnstile key always passes. The backend skips verification only in DEBUG/test. A blank or test Turnstile secret is rejected by production settings. Never expose the development server publicly.

## Commands and verification

```bash
cd frontend
npm run content:validate
npm run lint
npm run typecheck
npm test
VITE_SITE_ENV=production npm run build
npm run seo:check
STRICT_SEO=1 npm run seo:check
npm run preview
```

`build` validates content, copies the assets, installs local font assets, prerenders every route, generates sitemap/robots/RSS, rasterises OG PNGs using the supplied SVG composition with Satori + resvg, generates responsive cover derivatives, creates favicons and the Cloudflare 404 fallback. SVG originals remain the crisp, lightweight website image source. A default/preview build is noindex; only the explicit production environment permits indexing.

```bash
cd backend
source .venv/bin/activate
ruff check .
pytest
python manage.py makemigrations --check --dry-run
python manage.py purge_old_enquiries --dry-run
python manage.py send_pending_emails
```

Production security check uses `DJANGO_SETTINGS_MODULE=config.settings.prod` and requires a strong secret, independent IP hash salt and real Turnstile secret. Tests mock Turnstile and SMTP; no real prospect email is sent by the tests. CI also runs PostgreSQL tests, Lighthouse and axe.

## Environment configuration

The supplied `.env.example` files are unchanged. Do not commit real `.env` files.

Frontend variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Intended public host; canonical content is authoritative in `content/site.json` |
| `VITE_SITE_ENV` | `development`, `preview`, `production`; only production is indexable |
| `VITE_API_URL` | API origin, without trailing slash; required for production builds |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public key |
| `VITE_GA4_ID` / `VITE_GTM_ID` | Optional analytics IDs; GTM takes precedence if both are supplied |

Backend variables:

| Variable(s) | Purpose |
| --- | --- |
| `DJANGO_SETTINGS_MODULE` | `config.settings.dev`, `.test` or `.prod` |
| `DJANGO_SECRET_KEY` | Random secret of at least 50 characters in production |
| `DJANGO_DEBUG` | Environment value; production settings always force false |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts |
| `DATABASE_URL` | SQLite locally, PostgreSQL in production |
| `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_REGEXES` | Exact allowed origins/preview patterns |
| `CSRF_TRUSTED_ORIGINS` | HTTPS admin origin |
| `EMAIL_BACKEND` | Console locally; production forces SMTP |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` | SMTP transport |
| `DEFAULT_FROM_EMAIL`, `ENQUIRY_NOTIFY_TO` | Branded sender and comma-separated team recipients |
| `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES` | Secret and comma-separated allowed hostnames; add the staging host explicitly |
| `IP_HASH_SALT` | Independent random secret; database/cache keys never store raw IPs |
| `ENQUIRY_RETENTION_MONTHS` | Default 24; non-won enquiries are deleted by the daily command |
| `ADMIN_URL` | Default `manage-7f3k/`; use the same path in operational links |
| `SITE_URL`, `API_URL`, `BOOKING_URL` | Email links and newsletter redirect origins |
| `SENTRY_DSN` | Optional; PII capture disabled |

Deployment `.env`: `POSTGRES_PASSWORD` must be a long URL-safe secret and `API_IMAGE` an immutable GHCR image tag. Generate secrets locally using `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Do not reuse the example values.

## GitHub setup

1. Create a private repository and push this directory on a feature branch. Open a PR into `main`; do not bypass the review rules in `AGENTS.md`.
2. Replace the comment in `.github/CODEOWNERS` with your actual account. No fictional owner has been inserted.
3. Protect `main`: require a PR, one approval, resolved conversations, current branch and checks (`content`, `frontend`, `accessibility-performance`, `backend`); disallow force pushes/deletion. Restrict bypass permissions. Configure the production environment with the owner as reviewer.
4. Add the secrets and variables below. Same-repository PRs receive previews. Fork PRs run checks without deployment secrets and therefore do not receive automatic previews.
5. Inspect the preview before merging. The frontend deployment also re-runs unit/build checks. The backend workflow tests, pushes an immutable image and deploys via SSH.

### GitHub secrets

- `CLOUDFLARE_API_TOKEN`: Pages deployment permission for the chosen account.
- `CLOUDFLARE_ACCOUNT_ID`.
- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.
- `DEPLOY_HOST_FINGERPRINT`: verify the SSH host key out of band.
- GitHub provides `GITHUB_TOKEN`; the backend workflow grants it `packages:write` to publish GHCR images.

Repository variables: `VITE_API_URL`, `VITE_TURNSTILE_SITE_KEY`, optional `VITE_GA4_ID` / `VITE_GTM_ID`. The environment is selected by the workflow. **Do not put backend secrets in `VITE_*` values**; Vite variables are public browser data.

On the server only: a read-only GHCR token, GitHub read-only deploy key, backend `.env`, deployment `.env`, optional S3/KMS backup configuration. The workflow does not need the server's registry token; authenticate Docker once on the server using `docker login ghcr.io --password-stdin`.

## Cloudflare Pages setup

1. Create a Pages project named `avrix-website`; deploy the static `frontend/dist` directory using the supplied workflow. Do not enable a second, duplicate automatic production deployment path.
2. Add `avrixdigital.co.uk` and `www.avrixdigital.co.uk`. Configure HTTPS and a permanent www-to-apex redirect.
3. Add a Cloudflare Redirect Rule for `/` with query `page_id=31` → `/faqs/` (301). `_redirects` cannot match query strings.
4. The supplied `_redirects` and `_headers` are preserved verbatim. The supplied redirect file chooses 301s for several URLs the audit called 410s, and routes `/author/*` to About rather than Blog. Resolve that audit/spec conflict deliberately before DNS cut-over; the pack explicitly required the seed file unchanged.
5. Create a Turnstile widget for production and staging domains. Set its site key in repository variables and the secret/allowed hostnames in the backend environment. For unbounded PR preview hosts, point to a controlled staging host rather than weakening server-side hostname verification.
6. Configure GTM tags to require the appropriate consent category. The website sets all four Consent Mode v2 defaults to denied and only loads Google scripts after a choice that grants consent.
7. Preview builds have both noindex meta tags and an `X-Robots-Tag` header, with `Disallow: /` in robots. Production builds allow crawling and reference the sitemap.

## VPS / API setup

Use a Linux server with Docker Compose, ports 80/443 open, SSH restricted, and the API container port unexposed. The API's Caddy configuration overwrites `X-Real-IP`; don't place another proxy in front without configuring the trust chain.

1. Point `api.avrixdigital.co.uk` at the server. Clone into `/opt/avrix-website` using a read-only deploy key.
2. Copy `backend/.env.example` to `backend/.env`, fill every production setting, and set `DJANGO_DEBUG=False`. Set the real SMTP credentials and verified sender domain. Copy `deploy/.env.example` to `deploy/.env` and set the database password.
3. Authenticate Docker for private GHCR pulls. Ensure the SSH deployment account can run Docker and update this checkout.
4. Initial local-image launch: `docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up --build -d`. Caddy obtains a certificate. Static admin assets are served by WhiteNoise through Caddy.
5. Create an administrator: `docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec api python manage.py createsuperuser`. Migrations create Admin and Sales groups. Sales can view/change enquiries but cannot delete or manage users. Staff users must also have `is_staff=True`.
6. Install `deploy/crontab.example` after adjusting the checkout path. The mail worker retries unsent durable jobs every minute. Retention runs daily. Backups require AWS CLI, an instance role or equivalent limited credentials, `BACKUP_BUCKET`, `BACKUP_KMS_KEY_ID`, encryption and a 30-day S3 lifecycle.
7. Verify the health endpoint, admin, a real enquiry, both emails, newsletter confirmation and unsubscribe. Run a backup restore drill before accepting production leads.

`deploy/rollout.sh` pulls an immutable image, starts it and polls the public health endpoint. If the health check fails it restores the previously running image. **Database migrations are not reversed automatically**: use backward-compatible expand/contract migrations and a verified pre-deploy backup for schema changes.

## Content editing with ChatGPT or Claude

All editable content lives under `content/`. The validated build reads Markdown front matter and JSON; neither Django nor a live API is needed to render the website. Page content is sanitised; Markdown starts at H2. Asterisks in heading fields become serif italic emphasis. `booking_url_or:/contact-us/` resolves to the booking URL or the contact page. Missing site fields and empty team collections are hidden.

Ask the AI to change only the relevant content files on a `content/*` branch, retain British English, preserve URLs, and open a PR. Run `content:validate`, the build and SEO checks, review the PR preview, then merge. A testimonial/stat may be marked verified only after a human supplies evidence and consent; unverified entries are filtered out before browser data is generated. A new section type requires a code change and schema support. See `docs/08_AI_CONTENT_WORKFLOW.md` for prompts.

The seed files have been retained unchanged. `content/ui.json` is the added source for missing interface labels and confirmation-page metadata. The brand folder has no real logo, so a live-text AVRIX wordmark is used and no fake logo or person is introduced. The supplied monogram is the fallback favicon. Real team photography and a booking URL remain optional.

## Security and launch limitations

The source pack fixes Vite at major 5 and React Router at major 6. The dependency audit still reports advisories on those legacy development/routing dependencies that require newer majors to eliminate. The patch versions were updated within the specified stack. Deployment serves static output, not a Vite development server; internal links use validated local hrefs, and SSR occurs at build time without visitor input. These mitigations are **not** a claim of a clean dependency audit. See `verification/npm-audit.json` and approve a stack upgrade before calling the project fully security-cleared.

Lighthouse, axe, responsive browser interaction, Docker/PostgreSQL integration and real-provider email/Turnstile checks were not verified in this environment. CI and setup instructions provide those gates. Browser visual inspection was blocked by browser security policy. The supplied legal copy is a template with unresolved business identity/provider fields; complete and review it before public launch. The ZIP is a full implementation and build handoff, not evidence that these external gates have passed.

## Owner TODOs

- `content/faqs.json:74` — "_owner_check": "TODO(owner): confirm notice period and minimum term to match your terms of business."
- `content/pages/about.md:8` — team_image: null          # TODO(owner): { src, alt } real founder/team photo. Section hides when null
- `content/pages/about.md:9` — team: []                  # TODO(owner): [{ name, role, photo, linkedin, bio }]. Hidden when empty. No placeholder people.
- `content/services/google-workspace.md:34` — _owner_check: "TODO(owner): old site listed Starter £4.60 and Standard £9.20 per user/month. Google changed Workspace pricing in 2025, so check current UK list prices before adding figures back."
- `content/services/talent-acquisition.md:34` — _owner_check: "TODO(owner): confirm fee model wording matches your terms of business (old meta said 'all-inclusive daily rate'; old page said 'weekly margin')."
- `content/services/web-development.md:34` — _owner_check: "TODO(owner): confirm prices. A landing page currently costs more than a whole website."
- `content/site.json:33` — "_notes": "TODO(owner): fill legal_name, company_number, registered_office (shown in footer if a limited company), phone, booking_url (Calendly / Microsoft Bookings / Google appointment page) and social profile URLs. Null values are hidden on the site."

Additional launch decisions from the pack: supply the actual SVG logos; verify or delete the retained unverified testimonials/statistics; confirm AWS and recruitment pricing/guarantees; complete and review the three legal templates; export Search Console/GA4 landing-page history for redirect coverage; configure actual GitHub ownership, credentials and DNS. None of these has been fabricated.

See `FILE_TREE.txt` for the complete packaged file tree and `ACCEPTANCE_REPORT.md` for the item-by-item self-check.
