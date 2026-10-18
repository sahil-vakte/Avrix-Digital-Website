# Backend & Admin Panel Spec (Django)

Scope: **enquiries and newsletter sign-ups only.** No page content in the database.

## 1. Project
- `backend/config/settings/{base,dev,prod}.py`, env via `django-environ`.
- Apps: `enquiries`.
- Packages: `Django>=5.1,<5.3`, `djangorestframework`, `django-cors-headers`, `django-environ`, `psycopg[binary]`, `django-unfold`, `gunicorn`, `whitenoise`, `requests` (Turnstile verify), `sentry-sdk` (optional), `django-import-export` (CSV/XLSX export), `pytest`, `pytest-django`, `factory-boy`, `ruff`.
- Timezone `Europe/London`, `LANGUAGE_CODE='en-gb'`.

## 2. Models

### `Enquiry`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID pk | |
| `created_at` / `updated_at` | DateTime | auto |
| `full_name` | Char(120) | required |
| `email` | Email | required |
| `phone` | Char(40) | optional |
| `company` | Char(160) | optional |
| `website` | URL | optional |
| `services` | ArrayField/JSON list of slugs | required, ≥1 (choices = the 9 service slugs + `not-sure`) |
| `budget` | Char choices | `under-1k`, `1k-3k`, `3k-5k`, `5k-10k`, `10k-plus`, `monthly-retainer`, `not-sure` |
| `timeline` | Char choices | `asap`, `1-3-months`, `3-6-months`, `exploring` |
| `message` | Text | required, 20–5000 chars |
| `preferred_contact` | Char choices | `email`, `phone`, `video-call` |
| `marketing_opt_in` | Bool | default False (unticked checkbox) |
| `privacy_ack` | Bool | must be True |
| `status` | Char choices | `new` (default), `contacted`, `qualified`, `proposal-sent`, `won`, `lost`, `spam` |
| `priority` | Char choices | `low`, `normal`, `high` |
| `owner` | FK User, null | assigned team member |
| `internal_notes` | Text | admin only |
| `next_action_at` | DateTime, null | follow-up reminder |
| `source_page` | Char(300) | page URL the form was submitted from |
| `landing_page` | Char(300) | first page in session |
| `referrer` | Char(300) | |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Char(150) | |
| `gclid`, `fbclid`, `msclkid` | Char(255) | |
| `ip_hash` | Char(64) | SHA-256 of IP + secret salt (no raw IP stored) |
| `user_agent` | Char(300) | |
| `is_test` | Bool | true for preview/staging submissions |
| `spam_score` | SmallInt | 0 = clean; honeypot/turnstile/velocity flags raise it |

Indexes: `status`, `created_at`, `email`.

### `EnquiryActivity` (timeline)
`enquiry` FK, `created_at`, `actor` FK User null, `kind` (`status_change`, `note`, `email_sent`, `assigned`), `detail` text. Written automatically on status/owner changes (signals or `save_model`).

### `Subscriber` (newsletter)
`email` unique, `created_at`, `source_page`, `consent_text` (snapshot of wording shown), `confirmed_at` null, `confirm_token`, `unsubscribed_at` null. Double opt-in email with a confirm link (`GET /api/newsletter/confirm/{token}/` → redirect to `/newsletter-confirmed/`).

## 3. API (DRF)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/enquiries/` | public, throttled | Create enquiry |
| POST | `/api/newsletter/` | public, throttled | Subscribe |
| GET | `/api/newsletter/confirm/{token}/` | public | Confirm |
| GET | `/api/newsletter/unsubscribe/{token}/` | public | Unsubscribe |
| GET | `/api/health/` | public | `{"status":"ok"}` for uptime checks |

**POST `/api/enquiries/` request**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.co.uk",
  "phone": "+44 7700 900123",
  "company": "Example Ltd",
  "website": "https://example.co.uk",
  "services": ["performance-marketing", "ga4-consulting"],
  "budget": "1k-3k",
  "timeline": "1-3-months",
  "message": "We spend £3k/month on Google Ads and can't tell what's working…",
  "preferred_contact": "video-call",
  "marketing_opt_in": false,
  "privacy_ack": true,
  "source_page": "/services/ga4-consulting/",
  "attribution": {
    "landing_page": "/services/ga4-consulting/?utm_source=google",
    "referrer": "https://www.google.com/",
    "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "ga4-uk",
    "utm_term": "", "utm_content": "", "gclid": "Cj0K...", "fbclid": "", "msclkid": ""
  },
  "turnstile_token": "0.xxxx",
  "company_website_hp": ""
}
```
**Responses:** `201 {"id": "...", "message": "Thanks, we'll be in touch within 1 working day."}` · `400` field errors (`{"field": ["msg"]}`) · `429` throttled.

**Anti-spam**
1. Honeypot field `company_website_hp` must be empty (visually hidden, `tabindex=-1`, `autocomplete=off`). If filled → return 201 (silent), save with `status=spam`, don't email.
2. Cloudflare Turnstile verified server-side (`https://challenges.cloudflare.com/turnstile/v0/siteverify`). Skip in DEBUG/test.
3. DRF `ScopedRateThrottle`: `enquiries: 5/hour` per IP, `newsletter: 10/hour`.
4. Minimum time-to-submit: the frontend sends `elapsed_ms`; < 3000 → `spam_score += 50`.
5. URL count in the message > 3 → `spam_score += 30`. Score ≥ 50 → `status=spam`, no notification.

**CORS:** only the production domain(s) and the Cloudflare Pages preview regex. `CSRF` not required for this token-less JSON API (no cookies used), but set `CORS_ALLOW_CREDENTIALS=False`.

## 4. Emails (`enquiries/emails.py`, HTML + text templates)
1. **Team notification** → `ENQUIRY_NOTIFY_TO`. Subject: `New enquiry: {services} — {full_name} ({company})`. Body: all fields, attribution block, and a "Open in admin" deep link. `Reply-To` = the enquirer.
2. **Auto-reply to enquirer.** Subject: `Thanks for getting in touch with AVRIX Digital`. Branded, plain-English: what happens next (reply within 1 working day), booking link to skip the queue, a copy of their message, and contact details. No marketing content unless `marketing_opt_in`.
3. Send asynchronously after the response (`transaction.on_commit` + a thread, or Django-Q/Celery if added later). An email failure must **never** lose the enquiry. Log it and show a "email failed" badge in the admin.

## 5. Admin panel (django-unfold)

**Branding:** site title "AVRIX Admin", ink sidebar, Volt accent (`UNFOLD = {"COLORS": {...}}`), logo, custom login page. Admin at `ADMIN_URL` (non-default path).

**Dashboard (custom index)** cards:
- New enquiries (today / 7 days / 30 days)
- Enquiries by status (pipeline bar)
- Top services requested (30 days)
- Top sources (utm_source / referrer) (30 days)
- "Needs follow-up": `next_action_at` ≤ today
- Latest 10 enquiries table

**Enquiry list**
- Columns: created (relative), name, company, services (badges), budget, status (coloured badge), owner, source, priority.
- Filters: status, services, budget, owner, created date range, utm_source, is_test, spam.
- Search: name, email, company, message.
- Bulk actions: mark contacted / qualified / spam, assign to me, export CSV/XLSX (via django-import-export), delete (with confirmation).
- Default ordering `-created_at`; default filter hides `spam` and `is_test`.

**Enquiry detail**
- Tabs: *Enquiry* (read-only submitted fields), *Pipeline* (status, priority, owner, next_action_at, internal_notes; editable), *Attribution* (read-only UTM etc.), *Timeline* (EnquiryActivity inline, read-only).
- Buttons: "Reply by email" (`mailto:` with subject prefilled), "Copy details", "Mark as spam".

**Subscribers admin:** list, filters (confirmed/unsubscribed), export.

**Users & permissions:** groups `Admin` (all) and `Sales` (view/change enquiries; no delete, no user management). 2FA recommended (`django-otp` optional phase 2).

## 6. Data protection
- Management command `purge_old_enquiries` (run daily via cron in the container or a GitHub Actions schedule calling a protected endpoint): deletes enquiries older than `ENQUIRY_RETENTION_MONTHS` unless status is `won` (or anonymises them by blanking personal fields).
- No raw IPs stored. DB backups encrypted (nightly `pg_dump` to S3 with 30-day lifecycle).
- Privacy policy (see `content/legal/privacy-policy.md`) lists the purposes, lawful basis (legitimate interests for responding to enquiries; consent for marketing), retention and processors (hosting, email).

## 7. Tests (pytest, ≥ 90% coverage on `enquiries`)
- Valid submission → 201, row saved, 2 emails queued.
- Missing/invalid fields → 400 with field errors.
- Honeypot filled → 201, saved as spam, no emails.
- Turnstile failure → 400.
- Throttle → 429 after 5.
- Admin list/detail load for an Admin user; a Sales user can't delete.
- Retention command deletes old non-won rows.

## 8. Docker & deploy
- `backend/Dockerfile`: python:3.12-slim, non-root user, `collectstatic`, `gunicorn config.wsgi -w 3 -b 0.0.0.0:8000`.
- `deploy/docker-compose.prod.yml`: `api`, `db` (postgres:16, volume), `caddy` (TLS for `api.avrixdigital.co.uk`, reverse proxy to `api:8000`; serves `/static/` for the admin).
- Migrations run on container start (`python manage.py migrate --noinput`).
- Health check `GET /api/health/`.
