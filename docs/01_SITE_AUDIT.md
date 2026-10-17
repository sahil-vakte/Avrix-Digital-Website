# AVRIX Digital: Website Audit (avrixdigital.co.uk)

**Audit date:** 17 October 2026
**Current platform:** WordPress + Elementor 4.3.5 + Yoast SEO, built on a purchased theme ("Avista" by ThemeXriver)
**Pages reviewed:** Home, About, Services hub, all 9 service pages, Contact, Blog, plus every XML sitemap

> **What this means for the business, in one paragraph.**
> The service pages have strong, specific copy that sells well. The rest of the site still has a lot of leftover demo content from the theme: placeholder names, dummy blog posts, broken counters ("0+ years"), template links and a hot-linked demo video from the theme author's server. Prospects judging a digital agency by its own website will notice these straight away, so trust and enquiry rate suffer. Some statistics and all of the testimonials also carry **compliance risk** if they cannot be evidenced (see `09_CLAIMS_REGISTER.md`). The rebuild fixes every item below by design.

Severity key: 🔴 Critical (hurts trust, conversions or compliance now) · 🟠 High · 🟡 Medium · ⚪ Low

---

## 1. Trust and credibility issues (template leftovers)

| # | Sev | Where | Finding | Business impact | Fix in rebuild |
|---|---|---|---|---|---|
| 1.1 | 🔴 | Every page | The preloader reads **"L A D I N G . . ."** (the "O" is the favicon image) | First impression is a broken loading screen | No preloader. Content renders instantly (prerendered HTML) |
| 1.2 | 🔴 | Home | The counters show **"0+ Years of experience"** twice (the animation fails) | Tells prospects the agency has zero experience | Real numbers rendered in the HTML; the animation only enhances them |
| 1.3 | 🔴 | Home | Portfolio heading renders as **"Portfolio WO p3-title-img-1 f3-img-6 RK"** (image file names showing) | Looks broken and unfinished | Portfolio section removed until real case studies exist (Case Studies collection ready in CMS) |
| 1.4 | 🔴 | Home | Portfolio cards ("Product Branding", "Brand Strategy", "Website Design") link to `/services/smart-schedule-control/`, a theme demo URL | Dead ends; these services aren't offered | Removed |
| 1.5 | 🔴 | Home | The testimonial video hot-links `http://themexriver.com/wp/avista/t2-video-1.mp4` (theme author's server, served over HTTP) | Third-party demo content; mixed content; can disappear at any time | Removed |
| 1.6 | 🔴 | About, Contact | **"Hi 👋 I'm Lisa, Customer Manager"** with a stock photo (`author-7.webp`) | A fictional staff member presented as real is misleading | Replaced with a real founder/team block (photo and name supplied by owner) or a neutral CTA |
| 1.7 | 🔴 | Services hub, breadcrumbs | Page title **"Archives: Avista Services"**; every service breadcrumb reads "Home › Services › **Avista Services** › …" | Exposes the template name; poor UX | Clean breadcrumbs: Home › Services › {Service} |
| 1.8 | 🔴 | Blog | All 6 posts are **theme demo posts** with identical "IT consulting involves…" excerpts, typos ("Get The Most Out **Og** The Creativity", "Digital **Advertis Ing**"), dates from **2024** (before the business existed, "since 2025") and a "2023 trends" post | Thin, duplicate, outdated content; undermines expertise | Delete all; return 410 Gone; launch with 3 new original posts (supplied in this pack) |
| 1.9 | 🟠 | Blog, Services hub | Author shown as **avrixdigital@gmail.com** on every post/service | Looks unprofessional; exposes a Gmail address to scrapers | Author = "AVRIX Digital Team" (or named author profile) |
| 1.10 | 🟠 | Blog sidebar | Categories "Clock Fly Strategy", "Brand Design Identity", two entries reading **"Category Not Found"**; tag "Trendy" | Template junk | Clean taxonomy: Performance Marketing, Analytics, Cloud & Workspace, AI Automation, Web, Hiring |
| 1.11 | 🟠 | Home, About, Contact | "Check Our Projects" block with template mockups (`cta2-mockup.webp`, `cta2-ss-1..3.webp`) | Shows projects that aren't AVRIX's | Removed |
| 1.12 | 🟠 | Home | "SINCE 2025" repeated three times as a marquee; "avrix- make it count"; "Avrix - Creative Agency" | Positions AVRIX as a "creative agency", which doesn't match the services | One brand line: "Make it count." |
| 1.13 | 🟡 | Footer | "Keep up **out** latest update subscribe our newsletter!" / "make with ♥ by" (heart missing) / "© All rights reserved" (no year or company) | Grammar errors on every page | Corrected footer copy |
| 1.14 | 🟡 | Header | Social icons all link to `#` | Dead links | Real profile URLs from `site.json`; icons hidden when no URL is set |

## 2. Content accuracy and consistency

| # | Sev | Finding | Fix |
|---|---|---|---|
| 2.1 | 🔴 | Home FAQ "What makes your agency different from competitors?" **re-uses the answer** from "How do you measure campaign success?" | New answer written (see `content/faqs.json`) |
| 2.2 | 🔴 | AI Automation FAQ is corrupted: *"What kind of support do you offer? What services does yWe offer 24/7 customer support via live chat… our AI agency offer?"* It also claims **24/7 live chat**, which the site doesn't have | Rewritten. Support claim aligned to what is actually offered |
| 2.3 | 🟠 | **Positioning conflict.** Meta descriptions on Home, About, Services and Web Development and the Web App page body say *"East Midlands focus"*; Home says *"built for Global businesses"*; elsewhere it's UK SMEs | One position: **UK-wide, for SMEs**. East Midlands references removed from titles/meta/body |
| 2.4 | 🟠 | Meta descriptions lead with "web applications… and recruitment" but the homepage leads with marketing + cloud + talent | Meta rewritten to match the actual service mix |
| 2.5 | 🟠 | Talent Acquisition: meta says "agreed all-inclusive **daily rate**" while the page says "competitive **weekly margin** on the contractor's day rate" | Aligned wording (owner to confirm model) |
| 2.6 | 🟡 | Work-process steps numbered **01, 02, 03, 01** (the last should be 04); steps 2 and 3 share the same icon | Fixed numbering; unique icons supplied |
| 2.7 | 🟡 | M365 page says "most projects completed within **5 working days**" while its FAQ says migrations take "**2–3 working days**" | Clarified: migration 2–3 days (≤50 users); full project incl. Intune/training ≈5 days |
| 2.8 | 🟡 | Web Development pricing: business website **from £499** but landing page **from £999** (a single landing page costs more than a whole site) | Flagged for owner confirmation; kept in content as `price_from` fields so they're easy to change |
| 2.9 | 🟡 | "Response time: 1 hours" | "We reply within 1 working day" (or owner's real SLA) |
| 2.10 | 🟡 | Skills bars (Performance Marketing 92%, Cloud 95%, Web 88%, AI 85%) and "4.3/5" rating have no source | Removed (meaningless to buyers and unverifiable) |
| 2.11 | ⚪ | Nav label "Ai Automation" | "AI Automation" |

## 3. SEO and technical

| # | Sev | Finding | Fix |
|---|---|---|---|
| 3.1 | 🔴 | **Homepage has no H1** (the hero slides use H2) | One H1 per page, enforced by the page template |
| 3.2 | 🔴 | Indexed junk URLs in sitemaps: `/sample-page/`, `/teams/`, `/teams/melissa-lee/`, `/teams/melissa-lee-2/`, WooCommerce `product_cat` and `product_tag` sitemaps, `author` sitemap | Removed. 301/410 rules in `redirects.json` |
| 3.3 | 🟠 | Nav "FAQs" links to `/?page_id=31` (non-canonical, likely a 404 or duplicate) | Dedicated `/faqs/` page with FAQPage schema |
| 3.4 | 🟠 | AWS nav link uses `http://` | All internal links relative and HTTPS |
| 3.5 | 🟠 | `og:locale` = `en_US` on a UK site | `en_GB`; `<html lang="en-GB">` |
| 3.6 | 🟠 | Blog index has no meta description; title "Blog - AVRIX DIGITAL" | Unique titles/meta on every route, generated from content front matter |
| 3.7 | 🟠 | `/services/web-application-development/` exists but **isn't in the navigation**, and overlaps with Web Development | Added to nav; clear split: *Websites* vs *Web Applications*, cross-linked |
| 3.8 | 🟠 | Empty links: "Our Services" tabs and About values link to `<>` | Real links |
| 3.9 | 🟠 | Placeholder link text `https://avrixdigital.co.uk/our-services/` printed on the homepage | Removed. 301 `/our-services/` → `/services/` |
| 3.10 | 🟡 | Many images have empty alt text; stock filenames (e.g. `a-man-takes-out-a-suspicious-person-from-the-crowd…jpg` used for **recruitment**) | Descriptive alt text required by the content schema (build fails without it) |
| 3.11 | 🟡 | Heavy stack (Elementor + theme JS + preloader + sliders + jQuery) | Prerendered static HTML, < 120 KB JS on first load, Lighthouse ≥ 95 targets (see `05_SEO_SPEC.md`) |
| 3.12 | 🟡 | Service pages are a **custom post type archive** with blog-style meta (date, "Comments(0)") | Service pages are proper landing pages: no dates, no comments |
| 3.13 | 🟡 | No visible structured data beyond Yoast defaults (not verified in source) | Organization, ProfessionalService, WebSite, Service, FAQPage, BreadcrumbList, BlogPosting JSON-LD |

## 4. Conversion and lead capture

| # | Sev | Finding | Fix |
|---|---|---|---|
| 4.1 | 🔴 | "Schedule a call" button links back to the same contact page; there's no booking tool | Primary CTA "Book a free 30-minute call" → booking URL from `site.json` (Calendly/MS Bookings/Google Appointment), with the form as fallback |
| 4.2 | 🟠 | No phone number or business address anywhere | Contact details block from `site.json` (show only the fields provided) |
| 4.3 | 🟠 | Service pages have **no CTA** or contact form at all (they end at the FAQ) | Every service page ends with an enquiry form pre-filled with that service |
| 4.4 | 🟠 | The form doesn't capture where the lead came from | Hidden UTM/gclid/fbclid/landing page/referrer capture stored in the admin panel |
| 4.5 | 🟡 | Newsletter signup in footer with no consent wording | Double-opt-in-ready subscriber model + consent text |

## 5. Legal and compliance (UK)

| # | Sev | Finding | Fix |
|---|---|---|---|
| 5.1 | 🔴 | **No Privacy Policy, Cookie Policy or Terms** linked anywhere, despite forms collecting personal data and (likely) analytics | Legal page templates supplied (`content/legal/`) for review |
| 5.2 | 🔴 | No cookie consent banner seen | Consent banner with Google Consent Mode v2; analytics/ads tags load only after consent |
| 5.3 | 🔴 | **Testimonials and performance claims** (e.g. "300%+ average ROAS", "80% would recommend", "zero data loss", named reviewers) need evidence. Under the **DMCC Act 2024** (fake/unsubstantiated reviews banned since April 2025) and the **CAP Code** (claims must be substantiated), unverifiable ones are a regulatory risk | Every claim and testimonial carries a `verified` flag; unverified items **don't render**. See `09_CLAIMS_REGISTER.md` |
| 5.4 | 🟠 | If trading as a limited company: the website should show the registered name, company number and registered office (Companies Act / Company Regulations 2008) | Fields in `site.json` → footer |
| 5.5 | 🟡 | Partner claims ("authorised Microsoft CSP", "authorised Google Workspace reseller", "AWS-certified", "certified team") | Keep only where evidence exists; partner badges only with permission |

---

## 6. What's worth keeping

- **Service page copy** (Performance Marketing, GA4, AI Automation, Web Development, M365 & Copilot, Google Workspace, AWS, Talent Acquisition, Web Applications) is specific, benefit-led and SEO-friendly. It's carried into the new content files with fixes.
- **Service URLs** (`/services/{slug}/`) are clean. They're **kept exactly** so the rebuild doesn't lose rankings.
- **FAQ content** on service pages is strong and gets FAQPage schema.
- **Brand line** "Make it count."

## 7. URL inventory (from sitemaps, 17 Oct 2026)

| URL | Action |
|---|---|
| `/` | Keep |
| `/about/` | Keep |
| `/contact-us/` | Keep (canonical contact URL, don't rename) |
| `/services/` | Keep (rebuilt as a proper hub) |
| `/services/performance-marketing/` | Keep |
| `/services/ga4-consulting/` | Keep |
| `/services/ai-automation/` | Keep |
| `/services/web-development/` | Keep |
| `/services/web-application-development/` | Keep + add to nav |
| `/services/google-workspace/` | Keep |
| `/services/microsoft-365-copilot/` | Keep |
| `/services/aws-consulting/` | Keep |
| `/services/talent-acquisition/` | Keep |
| `/blog/` | Keep |
| `/?page_id=31` | 301 → `/faqs/` (new), via a Cloudflare Redirect Rule because `_redirects` ignores query strings |
| `/sample-page/` | 410 |
| `/teams/`, `/teams/*` | 301 → `/about/` |
| 6 demo blog posts | 410 (or 301 → `/blog/`; see redirects) |
| `/category/*`, `/tag/*`, `/author/*` | 301 → `/blog/` |
| `/our-services/`, `/services/smart-schedule-control/` | 301 → `/services/` |
| WooCommerce `/product-category/*`, `/product-tag/*` | 410 |

## 8. Not measured in this audit
Lighthouse/Core Web Vitals scores, Search Console coverage and backlink profile weren't available from here. Before launch, export **GSC Performance (last 16 months, by page)** and **GA4 landing pages (last 12 months)** so any URL with traffic or links gets a redirect.
