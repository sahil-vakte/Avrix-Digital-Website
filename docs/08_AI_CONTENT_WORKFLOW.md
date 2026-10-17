# Managing the website with ChatGPT / Claude (Git-based content)

## The model
- **Website content = files in `/content`** (Markdown + JSON). There's no CMS login for content.
- **You ask an AI** (Codex in ChatGPT, or Claude with GitHub access) to make a change. It edits the files on a new branch and opens a **pull request**.
- **CI checks the change** (content rules, build, SEO, accessibility, speed) and posts a **preview link**.
- **You review the preview and click Merge.** The site goes live automatically in about 2 minutes.
- **Enquiries** are the only thing managed in the Django admin panel.

`AGENTS.md` / `CLAUDE.md` in the repo tell the AI exactly where things live and what rules to follow, so prompts can be short.

## One-time setup
1. Create a private GitHub repo `avrix-website`; push the generated code.
2. Turn on branch protection for `main` (see `07_CICD_SPEC.md`).
3. Connect the repo to Cloudflare Pages and add the deploy secrets.
4. Connect GitHub to your AI tool:
   - **ChatGPT:** open Codex, connect your GitHub account, and select the `avrix-website` repo/environment.
   - **Claude:** use Claude Code (web or desktop) with the GitHub repo attached.
5. Test it with: *"Change the footer tagline to 'Make it count.' and open a PR."*

## Prompt templates (copy, fill in, paste)

**Edit copy**
> In the avrix-website repo, update `content/services/ga4-consulting.md`: rewrite the intro to emphasise e-commerce tracking for Shopify and WooCommerce stores. Keep British English, keep the SEO title under 60 characters, and don't add any unverified statistics. Open a PR titled "GA4 page: e-commerce emphasis".

**New blog post**
> Write a new blog post for avrix-website, about 1,200 words, on "{topic}" for UK SME owners. Follow AGENTS.md (front matter schema, British English, H2/H3 structure, internal links to {service}, plain-English, no invented statistics: cite a source or leave it out). Create `content/blog/{slug}.md`, add a 1600×900 cover using one of the brand graphics, and open a PR.

**Price change**
> Update `price_from` for web-development to £{x} and the landing page price in the pricing notes. Update the matching FAQ answer. Open a PR.

**Verify a testimonial**
> In `content/testimonials.json` set `verified: true` for "{name}" and add `evidence_note: "Written consent received {date}, stored in {location}"`. Open a PR.

**New service**
> Add a new service "{name}" to avrix-website: create `content/services/{slug}.md` following the schema of the existing services, add an icon SVG to `content/assets/icons/`, add it to the right pillar in `content/navigation.json`, and add 2 related-service links. Open a PR.

**SEO sweep**
> Review every file in `content/` for seo_title/seo_description length, duplicate titles, missing internal links and US spellings. Fix them in one PR with a summary table in the description.

## Guardrails (also in AGENTS.md)
- AI edits **only** `content/**` for content requests. Code changes need an explicit "change the code" request.
- Never set `verified: true` without an `evidence_note` supplied by a human.
- Never invent client names, results, statistics, certifications or reviews.
- Never commit secrets or `.env` files.
- One topic per PR; descriptive PR title; fill in the PR template.
- If CI fails, the AI fixes it on the same branch.
