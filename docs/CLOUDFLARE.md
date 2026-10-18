# Cloudflare: website, API and admin together

The root `wrangler.jsonc` deploys one Worker named `avrix-digital-website`. Static Assets serve the prerendered React pages. `/api/*`, `/manage-7f3k/*`, `/admin-setup/*` and `/static/*` go to the Django Container. All browser requests use the same origin; there is no separate API subdomain to configure.

The backend uses one `basic` container (1 GiB memory) with two Gunicorn workers and sleeps after ten idle minutes. This leaves room for Django admin and data exports. Runtime usage is billable under your Cloudflare plan.

## Requirements

- Cloudflare Workers paid account with Containers enabled. This is not a free static Pages deployment; review the account's Containers pricing before enabling it.
- A persistent PostgreSQL database reachable over the internet, with TLS required in its connection URL (`?sslmode=require`). Cloudflare Containers have ephemeral filesystems: never use SQLite for production. Use a managed PostgreSQL provider and keep backups there. D1 is not a drop-in replacement for this Django application's transactional database.
- A real Cloudflare Turnstile widget/site key and secret, allowed for the exact website hostname.
- An SMTP provider for enquiry notifications and newsletter confirmations. Configure the sender with that provider.

## Connect GitHub and build

1. In Cloudflare **Workers & Pages**, create a **Worker** by importing this GitHub repository. Use the branch containing this setup until the repository has a reviewed production branch.
2. Set the project/Worker name to **`avrix-digital-website`**, matching `wrangler.jsonc`. Root directory: repository root, not `frontend` or `backend`.
3. Build command: **`npm run build`** (or `npm run build:cloudflare`; both run the same build). Deploy command: **`npm run deploy:cloudflare`**. Use Node 22 or later in Workers Builds (`NODE_VERSION=22`). Wrangler is pinned in the root lockfile. Workers Builds builds and uploads the container image; no Docker installation is needed on your PC for that path.
4. Find your account's Workers subdomain. The initial origin is `https://avrix-digital-website.YOUR-SUBDOMAIN.workers.dev`.
5. Add the build variables and runtime settings below before deploying. Run a new deployment after changing them. Keep temporary preview deployments `noindex`.

### Build variables (Workers Builds settings)

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `22` |
| `PUBLIC_ORIGIN` | Your full HTTPS `workers.dev` origin, without trailing slash |
| `VITE_TURNSTILE_SITE_KEY` | Public Turnstile site key for that hostname |
| `VITE_SITE_ENV` | `preview` initially; `production` when ready to be indexed |
| `VITE_GA4_ID`, `VITE_GTM_ID` | Optional analytics identifiers |

Both root build commands install frontend dependencies (including build tools such as `tsx`, even when `NODE_ENV=production`), validate content and build every static page. They force same-origin API/admin URLs and use `PUBLIC_ORIGIN` for canonical URLs, social images and the sitemap. Do not set a separate `VITE_API_URL` for this deployment.

### Runtime variables and secrets (Worker Settings → Variables and Secrets)

Build variables and Worker runtime variables are separate. Set `PUBLIC_ORIGIN` in both places. Keep passwords and keys as **Secrets**, not build variables or committed Wrangler `vars`.

| Name | Type | Purpose |
| --- | --- | --- |
| `PUBLIC_ORIGIN` | Variable | Exact same HTTPS origin as the build |
| `DATABASE_URL` | Secret | `postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require` |
| `DJANGO_SECRET_KEY` | Secret | Random value of at least 50 characters |
| `IP_HASH_SALT` | Secret | Separate random value |
| `TURNSTILE_SECRET_KEY` | Secret | Real secret paired with the public build key |
| `SUPERADMIN_BOOTSTRAP_TOKEN` | Secret | Random token of at least 32 characters for initial registration |
| `EMAIL_HOST` | Variable | SMTP server hostname |
| `EMAIL_PORT` | Variable | Usually `587` |
| `EMAIL_HOST_USER` | Secret | SMTP username |
| `EMAIL_HOST_PASSWORD` | Secret | SMTP password |
| `EMAIL_USE_TLS` | Variable | `true` for STARTTLS |
| `DEFAULT_FROM_EMAIL` | Variable | Verified sender, e.g. `AVRIX Digital <info@avrixdigital.co.uk>` |
| `ENQUIRY_NOTIFY_TO` | Variable | Comma-separated team email addresses |
| `BOOKING_URL` | Variable | Optional; otherwise your contact page |
| `SENTRY_DSN` | Secret | Optional error reporting |

Generate each random secret locally with `python -c "import secrets; print(secrets.token_urlsafe(64))"`. Do not reuse development keys. The local backend `.env` is not uploaded. Secrets are explicitly passed from the Worker to Django at container startup.

For CLI deployments, install Docker for the image build, then run from the root:

```powershell
npm.cmd ci
npx.cmd wrangler login
# Add every required runtime variable/secret through the dashboard first.
$env:PUBLIC_ORIGIN = 'https://avrix-digital-website.YOUR-SUBDOMAIN.workers.dev'
$env:VITE_TURNSTILE_SITE_KEY = 'YOUR_PUBLIC_SITE_KEY'
$env:VITE_SITE_ENV = 'preview'
npm.cmd run build:cloudflare
npm.cmd run deploy:cloudflare
```

## Verify and create the first administrator

After the first deployment, visit `/api/health/` and expect `{"status":"ok"}`. The container runs database migrations and creates the rate-limit cache table automatically before Gunicorn starts. The first request after an idle period can take longer while the container starts.

Visit `/admin-setup/` directly and enter the runtime bootstrap token to create the first superadmin. It is not linked in navigation. After success, remove `SUPERADMIN_BOOTSTRAP_TOKEN` from Cloudflare and redeploy. The database records token use, preventing reuse even before removal. Sign in at `/manage-7f3k/` or use the footer Admin login link.

Submit a real enquiry, confirm it appears in admin, open its detail drawer, update its status and check both notification emails. Test newsletter confirmation too. Preview submissions are labelled test and excluded from production admin lists; use `VITE_SITE_ENV=production` when checking live enquiries.

Pending email jobs are persisted in PostgreSQL. The container retries them on startup and every minute while awake. It sleeps after ten idle minutes; retries resume when a request next starts it. For guaranteed timed retries during quiet periods, configure a scheduled authenticated health request, or adopt an always-on mail worker. Retention management remains available through `purge_old_enquiries`; schedule it according to your data policy.

## Connect your domain later

Add `avrixdigital.co.uk` as a **Custom Domain** on the same Worker. Set `PUBLIC_ORIGIN=https://avrixdigital.co.uk` in both build and runtime settings, allow the domain in Turnstile, set `VITE_SITE_ENV=production` and rebuild/redeploy. The API, admin, email links and SEO URLs then use your domain. Configure a redirect for `www` and disable the old `workers.dev` public route after verifying the custom domain. The database stays the same.

## CI and limits of local verification

CI checks source, frontend tests/build/SEO, backend tests, the Docker image build and production container startup against PostgreSQL, including admin login and static assets. Legacy Pages and VPS deploy workflows are opt-in via `ENABLE_LEGACY_PAGES_DEPLOY` and `ENABLE_LEGACY_VPS_DEPLOY`; leave them unset for this setup. Production monitoring is opt-in via `ENABLE_PRODUCTION_MONITORING`.

Wrangler's non-production version upload is not a complete Containers preview deployment. Use a separate staging Worker/database for a full-stack staging environment. A successful local static build or Wrangler dry run does not verify your Cloudflare account, database connectivity, SMTP delivery or live Turnstile credentials; perform the checks above after configuring the account.

The mobile audit runs performance, accessibility, best practices and SEO together. Its LCP budget is 2.5 seconds, the [Core Web Vitals good threshold](https://web.dev/articles/lcp), alongside the existing performance-score and 0.05 layout-shift budgets. The former 2-second internal LCP target was stricter than this standard. The page bootstrap paints prerendered content before loading React; the reading experience remains available while the interactive layer starts.

References: [Static frontend with a container backend](https://developers.cloudflare.com/containers/examples/container-backend/), [Git builds and container deployment](https://developers.cloudflare.com/containers/guides/deploy/), [Passing runtime secrets](https://developers.cloudflare.com/containers/examples/env-vars-and-secrets/).
