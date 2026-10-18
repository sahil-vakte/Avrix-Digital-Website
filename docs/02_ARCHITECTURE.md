# Architecture: AVRIX Digital website (React + Django)

## 1. Goals (non-negotiable)
1. **SEO first.** Every public URL must be served as **fully rendered HTML** (title, meta, H1, body copy, JSON-LD) *before* JavaScript runs. Google, Bing, LinkedIn/Facebook link previews and AI crawlers must see the content without executing JS.
2. **Content lives in Git.** All pages, services, FAQs, blog posts, testimonials and site settings are Markdown/JSON files in `/content`. ChatGPT or Claude edits these files and opens a pull request. Merging deploys automatically.
3. **Admin panel = enquiries only.** Django handles contact enquiries (and newsletter sign-ups) with a premium admin UI. It doesn't hold page content.
4. **Premium look and feel** with smooth, purposeful motion that never harms Core Web Vitals or accessibility.

## 2. Why not plain Create React App
The brief said "Create React App". Two facts changed that:
- The React team **deprecated Create React App on 14 Feb 2025**. It gets no new features, and react.dev recommends a framework or Vite instead.
- CRA renders only in the browser (client-side). Crawlers get an empty `<div id="root">`, which works directly against the "best SEO" goal.

**Decision:** keep the same developer experience (React, components, React Router), but build with **Vite + `vite-react-ssg`**. It **prerenders every route to static HTML at build time** and then hydrates into a normal React app. It's still "a React app", just one that's SEO-correct and maintained.

> Acceptable alternative if a developer insists: Next.js (App Router) with `output: 'export'`. Everything else in this pack (content, design, Django API, CI/CD) stays the same.

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React 18.3 + TypeScript (strict) | |
| Build / SSG | Vite 5 + `vite-react-ssg` | Prerenders all routes from `/content` |
| Routing | React Router 6 (via vite-react-ssg) | Trailing-slash URLs to match the old site |
| Styling | Tailwind CSS 3.4 + CSS variables (design tokens) | Tokens in `src/styles/tokens.css` |
| Motion | `motion` (Framer Motion) + `lenis` smooth scroll | Respect `prefers-reduced-motion` |
| Head / SEO | `react-helmet-async` (bundled by vite-react-ssg `<Head>`) | Per-route title, meta, canonical, OG, JSON-LD |
| Content parsing | `gray-matter` + `marked`/`remark` at build time; `zod` schemas | Build fails on invalid content |
| Forms | `react-hook-form` + `zod` | Posts to Django API |
| Icons | Inline SVG set in `/content/assets/icons` + `lucide-react` for UI glyphs | |
| Fonts | Self-hosted via `@fontsource-variable/*` | No Google Fonts request (privacy + speed) |
| Backend | Python 3.12, Django 5.1 LTS-track, Django REST Framework | API + admin only |
| Admin UI | `django-unfold` | Modern, premium admin theme |
| DB | PostgreSQL 16 (prod), SQLite (local) | |
| Email | Django SMTP via Microsoft 365 or Google Workspace SMTP relay (or Postmark/SES) | Notification + auto-reply |
| Spam | Honeypot + Cloudflare Turnstile + DRF throttling | |
| Hosting (frontend) | **Cloudflare Pages** (static) | `_redirects`, `_headers`, PR preview URLs, UK edge |
| Hosting (backend) | Docker container on AWS Lightsail / any VPS behind Caddy (auto-HTTPS) at `api.avrixdigital.co.uk` | Alternative: Render/Railway |
| CI/CD | GitHub Actions | Lint, type-check, content validation, tests, Lighthouse, deploy |

## 4. Monorepo layout

```
avrix-website/
├─ AGENTS.md                 # Rules for AI editors (Codex/ChatGPT/Claude)
├─ CLAUDE.md                 # Same rules (Claude reads this file name)
├─ README.md
├─ content/                  # ← ALL editable website content (AI edits here)
│  ├─ site.json              # company details, contact, socials, booking URL, legal IDs
│  ├─ navigation.json        # header + footer menus
│  ├─ home.json              # homepage sections
│  ├─ faqs.json              # global FAQs (FAQ page + homepage)
│  ├─ testimonials.json      # verified flag gates rendering
│  ├─ stats.json             # verified flag gates rendering
│  ├─ pages/                 # about.md, contact.md, faqs.md, services.md, blog.md, 404.md
│  ├─ services/              # 9 × {slug}.md (front matter + body)
│  ├─ blog/                  # {slug}.md posts
│  ├─ case-studies/          # empty at launch; collection ready
│  ├─ legal/                 # privacy-policy.md, cookie-policy.md, terms.md
│  └─ assets/                # images, icons, graphics referenced by content
├─ frontend/
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ tailwind.config.ts
│  ├─ public/                # _redirects, _headers, favicon set, robots.txt (generated)
│  ├─ scripts/               # generate-sitemap.ts, generate-rss.ts, validate-content.ts, og-images.ts
│  └─ src/
│     ├─ main.tsx            # vite-react-ssg entry
│     ├─ routes.tsx          # route table built from /content
│     ├─ content/            # loaders + zod schemas (reads ../../content)
│     ├─ components/
│     │  ├─ layout/          # Header, MegaMenu, MobileNav, Footer, Breadcrumbs, CookieBanner
│     │  ├─ sections/        # Hero, LogoStrip, ServiceGrid, Process, Stats, Testimonials, FAQ, CTA, BlogTeaser, ContentBlock, Comparison, PricingFrom
│     │  ├─ ui/              # Button, Card, Badge, Accordion, Input, Select, Textarea, Checkbox, Tag
│     │  ├─ motion/          # Reveal, Stagger, MagneticButton, SplitText, ParallaxLayer, CountUp, Marquee
│     │  └─ seo/             # Seo, JsonLd builders
│     ├─ pages/              # Home, About, ServicesHub, ServiceDetail, Faqs, Contact, BlogIndex, BlogPost, Legal, NotFound, ThankYou
│     ├─ lib/                # api.ts (enquiry POST), utm.ts, analytics.ts (consent-aware GA4), cn.ts
│     └─ styles/             # tokens.css, globals.css, prose.css
├─ backend/
│  ├─ manage.py
│  ├─ pyproject.toml / requirements.txt
│  ├─ Dockerfile
│  ├─ config/                # settings (base/dev/prod), urls, wsgi/asgi
│  └─ enquiries/             # models, serializers, views, admin, emails, tests, management/commands
├─ deploy/
│  ├─ docker-compose.prod.yml   # api + postgres + caddy
│  └─ Caddyfile
└─ .github/
   ├─ workflows/ci.yml           # PR checks
   ├─ workflows/deploy-frontend.yml
   ├─ workflows/deploy-backend.yml
   ├─ pull_request_template.md
   └─ CODEOWNERS
```

## 5. Data flow

```
Content edit (ChatGPT / Claude / human)
  └─► branch + PR on GitHub
        └─► CI: validate content (zod) → typecheck → build (prerender all routes) → Lighthouse CI → preview URL
              └─► merge to main
                    └─► deploy-frontend → Cloudflare Pages (static HTML, live in ~1–2 min)

Visitor submits enquiry form
  └─► POST https://api.avrixdigital.co.uk/api/enquiries/   (Turnstile token + honeypot + UTM data)
        └─► Django validates → saves Enquiry → emails team → auto-reply to enquirer
              └─► Team manages it in /admin (status, notes, owner, CSV export)
```

The frontend **never** needs the backend to render pages. If the API is down, the site still works and the form shows a fallback ("Email us at info@…").

## 6. Environments

| Env | Frontend | Backend | Trigger |
|---|---|---|---|
| Local | `npm run dev` (http://localhost:5173) | `python manage.py runserver` (http://localhost:8000) | — |
| Preview | Cloudflare Pages preview URL per PR | Points at staging API (or production with `X-Env: preview` and `is_test=True`) | Every PR |
| Production | https://avrixdigital.co.uk | https://api.avrixdigital.co.uk | Merge to `main` |

## 7. Environment variables

**frontend/.env.example**
```
VITE_SITE_URL=https://avrixdigital.co.uk
VITE_API_URL=https://api.avrixdigital.co.uk
VITE_TURNSTILE_SITE_KEY=
VITE_GA4_ID=G-XXXXXXXXXX
VITE_GTM_ID=
```

**backend/.env.example**
```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.avrixdigital.co.uk
DATABASE_URL=postgres://avrix:password@db:5432/avrix
CORS_ALLOWED_ORIGINS=https://avrixdigital.co.uk,https://www.avrixdigital.co.uk
CORS_ALLOWED_ORIGIN_REGEXES=^https://[a-z0-9-]+\.avrix-website\.pages\.dev$
CSRF_TRUSTED_ORIGINS=https://api.avrixdigital.co.uk
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=AVRIX Digital <info@avrixdigital.co.uk>
ENQUIRY_NOTIFY_TO=info@avrixdigital.co.uk
TURNSTILE_SECRET_KEY=
ENQUIRY_RETENTION_MONTHS=24
ADMIN_URL=manage-7f3k/        # non-default admin path
SENTRY_DSN=
```
