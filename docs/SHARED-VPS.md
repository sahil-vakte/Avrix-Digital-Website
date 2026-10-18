# Avrix on the existing WIMS server

Website: `https://avrixdigital.co.uk`. SSH connection details are kept outside this public repository.
Cloudflare hosting and Containers are not used. Turnstile is only the form's
spam protection and can run on a website hosted on this server.

## Temporary preview without DNS or email

The owner has requested deployment before DNS, SMTP and Turnstile are ready.
For that phase build with `VITE_SITE_ENV=preview` and
`VITE_PUBLIC_FORMS_ENABLED=false`, and set `PUBLIC_FORMS_ENABLED=False` in the
server environment. Both submission APIs return 503 without saving records or
queuing email. The frontend displays an availability notice instead of a form.
Production settings still require a real Turnstile secret whenever forms are enabled.

Enable `nginx-preview.conf` on port `8081` for a temporary IP preview. It blocks
the API, admin and registration routes, and sends `X-Robots-Tag: noindex, nofollow`.
The Django API remains bound to loopback. Do not expose admin login over HTTP.
The HTTP domain bootstrap site can be enabled alongside it for future ACME.

When DNS and credentials are ready, configure HTTPS, authenticate SMTP, add both
domain names to the Turnstile widget, set both form flags to true, rebuild with
`VITE_SITE_ENV=production`, and restart only Avrix. Remove the temporary preview
site and any firewall exception for port 8081 after the domain is verified.

## Isolation

- Keep the existing WIMS Supervisor program, Python environment, Redis, source,
  Nginx site and certificates unchanged.
- Use a separate `avrix` system user, `/opt/avrix-website` directory, Python 3.12
  virtual environment, PostgreSQL database and local API port `8011`.
- Build the frontend off the server. Do not upgrade its existing Node installation.
- Install only the Avrix systemd units in `deploy/vps`. The slice caps the combined
  Avrix application and email retry CPU at 40% and memory at 640 MB. The Avrix
  PostgreSQL cluster must also be assigned to `avrix.slice` with a unit override;
  otherwise the database is outside these limits.
- Add a new Nginx site for Avrix. Run `nginx -t` before a graceful reload. Do not
  restart Nginx or restart/update all Supervisor programs.

## Deployment verification

The website is deployed at `https://avrixdigital.co.uk/`. All 36 generated pages
passed HTTPS checks, missing pages return 404, and HTTP/www redirect to the
canonical HTTPS domain. HTTPS health, admin login, initial registration and
fingerprinted admin CSS checks pass. The production build permits indexing.
Forms remain disabled and submissions return 503. Backup restoration was
verified in a separate temporary database. WIMS process identity and site
configuration were preserved, and its HTTPS health check passed after deployment.

A separate certificate covers the apex and www, with scheduled renewal and an
Avrix-specific checked Nginx reload hook. The temporary HTTP preview site and its
additional firewall exception have been removed. Initial registration requires
the one-use production token, delivered privately into the owner's ignored local
`backend/.env` as `VPS_SUPERADMIN_BOOTSTRAP_TOKEN`. Do not commit that value or
place it in a URL. Old DNS cache entries may persist during the cutover.

Production Turnstile, SMTP and initial admin registration remain outstanding.
Off-server backup storage is also outstanding.
Server-specific deployment records are retained privately.

## Continuous deployment

See [the change workflow](CHANGE-WORKFLOW.md). CI waits for all required jobs and
deploys only a successful push to `main`. The root-owned deployment entry point
is installed at `/usr/local/sbin/avrix-deploy`, with a forced-command SSH gateway
at `/usr/local/bin/avrix-ci-gateway`. Root-owned files are installed separately
from application releases, so routine app deployments cannot replace them.

The `avrix-ci` account accepts only `deploy <full-commit-sha>` with a bounded
archive on stdin. Its sudo rule permits only this validated entry point. The
release contains tracked backend/deployment sources and the tested frontend
artifact, never production environment files or local database contents.

Each release now has a `.venv`; the API, email retry and retention commands use
the active release's environment. Bootstrap releases can link `.venv` to the
original environment until the first automated release. A pre-migration backup,
health checks and application rollback are part of the deployment handler.

## Release layout and configuration

Use `/opt/avrix-website/releases/<release>/` with `backend/` and `frontend/dist/`,
and point `current` to the active release. Store secrets only in
`shared/backend.env`, owned by root with group `avrix` and mode `0640`.
Do not copy a development database, `.env`, virtual environment or local accounts.

Set `DJANGO_SETTINGS_MODULE=config.settings.vps`, a fresh strong
`DJANGO_SECRET_KEY`, separate `IP_HASH_SALT`, a dedicated PostgreSQL
`DATABASE_URL`, and a fresh one-use `SUPERADMIN_BOOTSTRAP_TOKEN`.
Set `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS=avrixdigital.co.uk,www.avrixdigital.co.uk`,
`SITE_URL=https://avrixdigital.co.uk`, `API_URL=https://avrixdigital.co.uk`,
`CSRF_TRUSTED_ORIGINS=https://avrixdigital.co.uk`,
`CORS_ALLOWED_ORIGINS=https://avrixdigital.co.uk`, `CORS_ALLOWED_ORIGIN_REGEXES=`,
`ADMIN_URL=manage-7f3k/` and real `TURNSTILE_SECRET_KEY`.

Hostinger Email uses `EMAIL_HOST=smtp.hostinger.com`, `EMAIL_PORT=587`,
`EMAIL_USE_TLS=True`, the full mailbox address as `EMAIL_HOST_USER` and its password
as `EMAIL_HOST_PASSWORD`. Configure `DEFAULT_FROM_EMAIL` and `ENQUIRY_NOTIFY_TO`
with the intended addresses. Set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`.
The SMTP login must be verified separately from website deployment.

Build the frontend with `VITE_SITE_URL=https://avrixdigital.co.uk`,
`VITE_API_SAME_ORIGIN=true`, `VITE_SITE_ENV=production`,
`VITE_ADMIN_URL=/manage-7f3k/` and a real `VITE_TURNSTILE_SITE_KEY`.
From `frontend/`, run `npm ci --include=dev`, `npm run content:validate` and
`npm run build`. The root `npm run build` remains the Cloudflare build path;
do not use that command for this VPS rollout.

Before serving, run Django `check --deploy`, `migrate`, `createcachetable` and
`collectstatic --noinput` with the production environment. Install and enable
`avrix-api.service` and `avrix-mail.timer`. Confirm API health, admin login and
admin static assets. The admin URL is `/manage-7f3k/`; initial registration is
`/admin-setup/` and requires the one-use token. Remove that token after use.

## DNS and HTTPS

First enable the HTTP bootstrap site, retaining the existing WIMS site.
In Hostinger DNS, point the apex A record (`@`) to the server?s public IPv4 address and `www`
to `avrixdigital.co.uk` using a CNAME. Remove only conflicting old website A/AAAA
records. Preserve MX and email TXT records; mailbox migration is a separate task.

After both names resolve to this server, obtain a separate Let's Encrypt
certificate with Certbot's **webroot** method and
`/opt/avrix-website/shared/acme` as the webroot. Do not let Certbot rewrite WIMS.
Install `nginx-https.conf` only after the certificate files exist. Check syntax,
reload gracefully, and verify renewal's deploy hook also performs a checked
Nginx reload. Never replace WIMS certificates or renewal configuration.

## Acceptance, backups and rollback

Record WIMS HTTP status, Supervisor PID/uptime and Nginx configuration hash
before and after each rollout step. Check both domains over HTTPS, Avrix nested
routes, missing-page 404s, form Turnstile verification, enquiry persistence,
notification delivery, admin access and server memory/CPU.

Schedule daily PostgreSQL custom-format dumps of only the Avrix database, with
restricted permissions and seven daily copies. Keep an off-server copy and
verify restoration before treating backups as complete. Schedule enquiry
retention cleanup using the project's management command. Neither job should
read, delete or back up WIMS data.

The supplied `avrix-backup.timer` runs `backup.sh` as `postgres` against port
5433; its dedicated backup directory must be owned by `postgres` with mode 0700.
The dump is published only after `pg_restore --list` succeeds. This checks archive
structure, not full restorability. The `avrix-retention.timer` applies the configured
enquiry retention policy. The mail retry timer should remain disabled until SMTP
and forms are ready.

For a later release rollback, switch `current` to the previous release and restart
only `avrix-api`. Database migrations require a separate compatibility decision;
never automatically reverse a migration or restore over a live database.
To withdraw this initial site, disable only the Avrix Nginx symlink and services,
check Nginx syntax and reload gracefully. Preserve its database and shared files.
