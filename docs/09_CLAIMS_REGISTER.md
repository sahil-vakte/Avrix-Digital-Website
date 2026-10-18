# Claims & Testimonials Register: needs owner sign-off before launch

**Why this matters:** Since April 2025 the **Digital Markets, Competition and Consumers Act 2024** makes fake or misleading consumer reviews a banned practice, and the CMA can fine directly (up to 10% of global turnover). The **CAP Code** (ASA) also requires that objective claims ("300% ROAS", "zero data loss") are backed by evidence held *before* publishing. The ASA's remit covers marketing claims on a company's own website.

**How the new site handles it:** every claim and testimonial in `content/` has `verified: true|false`. The React build **only renders items marked `verified: true`**, so nothing goes live until someone has confirmed the evidence. Flip the flag (via a Git edit by ChatGPT/Claude) once evidence is on file.

> Not legal advice. For anything borderline, get a short review from a solicitor or use the ASA's CAP Copy Advice service.

## A. Testimonials (all currently `verified: false`)

| Name shown | Role/location | Claim inside the quote | Evidence needed |
|---|---|---|---|
| Sarah K. | Operations Director, London | M365 migration + rebuilt Google Ads | Written consent from a real client + a record of the engagement |
| James T. | E-Commerce Manager, Manchester | ROAS 1.8x → 4.6x in 90 days | Real client consent + Google Ads/GA4 screenshots |
| Priya M. | CTO, SaaS Startup, Birmingham | 3 candidates in a week, 2 hired | Real client consent + placement records |
| David R. | MD, Professional Services, Leeds | M365 migration in 48h, zero disruption | Real client consent + project record |
| Emma S. | Head of Marketing, FinTech, London | Rebuilt paid media strategy | Real client consent |

If these aren't genuine client quotes, **delete them**. Don't reword them. Replacement route: send a review request to real clients, or embed a Google Business Profile / Trustpilot widget.

## B. Statistics and outcome claims

| Claim (current site) | Location | Risk | Recommendation |
|---|---|---|---|
| "300%+ average ROAS improvement across performance marketing clients" | Home | 🔴 High: averages need a full dataset | Remove until there's data across several clients |
| "80% of clients would recommend Avrix Digital" | Home | 🔴 High: needs a survey method and sample size | Remove, or state "x of y clients surveyed, {month year}" |
| "Microsoft 365 migrations delivered with zero data loss and downtime" | Home | 🟠 Absolute claim | "Planned weekend cut-overs designed to avoid downtime" |
| "4.3/5" rating; skill % bars | Home | 🟠 No source | Removed |
| "Businesses lose an average of 12 hours per employee per week to repetitive tasks" | AI Automation | 🟠 Third-party stat with no citation | Cite a source or soften ("many hours every week") |
| "typically reducing AWS spend by 30–50% in the first 90 days" | AWS | 🟠 | Keep only with past client evidence; otherwise "common savings areas include…" |
| "majority of GA4 setups we audit are missing 40–80% of events" | GA4 | 🟡 | Keep if based on own audits; otherwise soften |
| "Most businesses achieve positive ROI within 60 days" (automation) | AI Automation | 🟡 | Evidence or soften |
| "Copilot saves 2–4 hours per week" | M365 | 🟡 | Attribute to a source, or say "can save hours each week" |
| "over 60% of web traffic is mobile" | Web Dev | ⚪ Generally true; cite a source | Cite or say "most" |
| "zero data loss … guaranteed" | M365 | 🔴 A guarantee creates contractual exposure | Remove "guaranteed" |
| "No placement, no fee"; "12-week replacement guarantee"; fee 12–15% | Talent | 🟡 Must match your T&Cs | Confirm against your terms of business |

## C. Credentials and partner status

| Claim | Evidence to hold |
|---|---|
| "Authorised Microsoft Cloud Solution Provider (CSP)" | Partner Center record / indirect reseller agreement |
| "Authorised Google Workspace reseller" | Google Partner Directory listing / reseller agreement |
| "AWS-certified consultants" | Named individuals' AWS certifications (current) |
| "Certified team" (Google Ads/Meta) | Google Ads / Meta Blueprint certificates |
| Partner logos/badges | Only use badges you have been granted, as per each programme's brand rules |

## D. Pricing on site (confirm current)

| Item | Current site | Status |
|---|---|---|
| Business website | from £499 | Confirm |
| E-commerce store | from £1,999 | Confirm |
| Landing page | from £999 | ⚠️ More than a whole website? Confirm |
| AWS cost audit | from £499 | Confirm |
| AWS managed retainer | from £799/month | Confirm |
| Permanent recruitment fee | 12–15% of first-year salary | Confirm |
| Google Workspace plans | Starter "from £4.60", Standard "from £9.20" per user/month | ⚠️ **Likely out of date.** Google changed Workspace pricing in 2025. Check the current UK list price before publishing, or remove the figures |

All prices live in front matter (`price_from`), so changing them is a one-line Git edit.
