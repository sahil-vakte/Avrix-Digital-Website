# Design System: "Make it count"

**Direction:** confident, editorial, technical. Think high-end consultancy with an engineering edge: dark "ink" sections with a single electric accent, large expressive type, generous whitespace, precise grid lines and motion that **reveals and explains** rather than decorates. It must not look like a theme.

**Three things that make it feel premium:**
1. **Typography does the heavy lifting.** Huge display headlines (up to 120px) with one word set in a serif italic for emphasis.
2. **One accent colour, used sparingly.** Volt lime only for primary CTAs, key numbers and active states.
3. **Fine detail.** Hairline borders, a subtle grain overlay, a cursor-aware glow on cards, a magnetic primary button, and numbers that count up only when they're real.

> Brand colours: the current logo is monochrome (white on dark, black on light). The palette below is designed around a monochrome logo. If AVRIX has fixed brand hex values, replace **only** the tokens in `tokens.css`; every component reads from tokens.

---

## 1. Colour tokens (`src/styles/tokens.css`)

```css
:root {
  /* Neutrals */
  --ink-950: #07080C;   /* page background (dark sections) */
  --ink-900: #0B0D13;
  --ink-800: #13161F;   /* cards on dark */
  --ink-700: #1C2030;   /* borders on dark (use at 1px) */
  --ink-500: #4A5068;
  --ink-300: #9AA0B4;   /* muted text on dark */
  --paper-50: #FAFAF7;  /* light section background */
  --paper-100:#F2F1EC;
  --paper-200:#E6E4DC;  /* borders on light */
  --text-on-light: #0B0D13;
  --muted-on-light:#565B6B;

  /* Accent */
  --volt-400: #D4FF3A;  /* primary CTA bg on dark, highlights */
  --volt-500: #C2F01F;  /* hover */
  --iris-500: #6D5BFF;  /* links on light, gradient start */
  --iris-300: #A89CFF;
  --aqua-400: #3AE0D4;  /* gradient end, data viz */

  /* Semantic */
  --success: #2BD67B;
  --warning: #FFB020;
  --danger:  #FF5A5F;

  /* Effects */
  --grad-signal: linear-gradient(120deg, var(--iris-500) 0%, var(--aqua-400) 100%);
  --glow-volt: 0 0 0 1px rgba(212,255,58,.35), 0 10px 40px -10px rgba(212,255,58,.45);
  --radius-sm: 10px; --radius-md: 16px; --radius-lg: 24px; --radius-xl: 32px; --radius-pill: 999px;
  --shadow-card: 0 1px 0 rgba(255,255,255,.04) inset, 0 20px 50px -20px rgba(0,0,0,.6);
}
```

**Usage rules**
- Dark sections: `--ink-950` background, white headings, `--ink-300` body, `--ink-700` hairlines.
- Light sections: `--paper-50` background, `--text-on-light` headings, `--muted-on-light` body.
- Alternate dark and light sections down the page to create rhythm. The **hero is always dark**.
- Volt lime is **never** used for body text on light backgrounds (fails contrast). On light sections the primary button is ink with white text.
- All text/background pairs must meet **WCAG 2.2 AA** (4.5:1 body, 3:1 large text/UI).

## 2. Typography

| Role | Font (self-hosted, variable) | Package |
|---|---|---|
| Display / headings | **Bricolage Grotesque** (wght 400–800, opsz) | `@fontsource-variable/bricolage-grotesque` |
| Body / UI | **Geist** | `@fontsource-variable/geist` |
| Numbers, eyebrows, code | **Geist Mono** | `@fontsource-variable/geist-mono` |
| Emphasis word in headlines | **Instrument Serif Italic** | `@fontsource/instrument-serif` (400 italic) |

Fluid type scale (use `clamp`):

| Token | Size | Line-height | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | clamp(3rem, 7vw + 1rem, 7.5rem) | 0.95 | -0.035em | Home hero H1 |
| `display-lg` | clamp(2.5rem, 5vw + 1rem, 5rem) | 1.0 | -0.03em | Page hero H1 |
| `h2` | clamp(2rem, 3vw + 1rem, 3.5rem) | 1.05 | -0.025em | Section titles |
| `h3` | clamp(1.375rem, 1vw + 1rem, 1.75rem) | 1.2 | -0.015em | Card titles |
| `lead` | clamp(1.125rem, .5vw + 1rem, 1.375rem) | 1.55 | -0.005em | Intro paragraphs |
| `body` | 1.0625rem (17px) | 1.65 | 0 | Body |
| `small` | 0.875rem | 1.5 | 0 | Meta |
| `eyebrow` | 0.75rem, Geist Mono, uppercase | 1 | 0.14em | Section labels, e.g. `[ 01 / SERVICES ]` |

**Headline pattern:** `Turn clicks into <em>customers.</em>`. The `<em>` renders in Instrument Serif Italic, same size, no colour change (or Volt on dark for one word max per page).

**Eyebrow pattern:** Geist Mono in brackets with an index, e.g. `[ 02 — HOW WE WORK ]`.

## 3. Layout & grid

- Container: `max-width: 1320px; padding-inline: clamp(16px, 4vw, 40px)`.
- 12-column grid, 24px gap (16px on mobile).
- Section vertical padding: `clamp(80px, 10vw, 160px)`.
- Visible **hairline grid lines** (1px, `--ink-700` at 60% opacity) on dark sections as a signature detail: 4 vertical lines aligned to the column grid, fading in on scroll.
- Subtle **grain overlay** on dark sections (SVG noise at 4% opacity, `pointer-events:none`, provided in `assets/graphics/grain.svg`).

## 4. Breakpoints

| Name | Min width | Notes |
|---|---|---|
| `xs` | 0 | Single column, 16px gutters, bottom sticky CTA bar on service pages |
| `sm` | 640px | |
| `md` | 768px | 2-column cards |
| `lg` | 1024px | Desktop nav + mega menu appear |
| `xl` | 1280px | Full 12-col layouts |
| `2xl` | 1536px | Container caps at 1320px |

**Responsive musts:** no horizontal scroll at 320px; tap targets ≥ 44×44px; the mega menu becomes a full-screen sheet with accordion groups on mobile; tables become stacked cards under `md`; images use `srcset` + `sizes`; hero type never wraps to more than 4 lines on a 375px screen.

## 5. Components (build all in `src/components/ui` and `sections`)

| Component | Spec |
|---|---|
| **Header** | Transparent over the hero. After 80px of scroll it becomes `ink-950/80` with `backdrop-blur(16px)` and a hairline bottom border. Hides on scroll-down and shows on scroll-up. Logo left; nav centre; right side: "Book a call" (primary, magnetic) |
| **Mega menu (Services)** | Opens on hover/focus/click. 3 columns: *Grow* (Performance Marketing, GA4 Consulting), *Build & automate* (Web Development, Web Applications, AI Automation), *Run & secure* (Microsoft 365 & Copilot, Google Workspace, AWS Consulting), plus *Hire* (Talent Acquisition). Each item: icon, title, one-line summary. Right panel: featured CTA card. Fully keyboard accessible (Esc closes, arrow keys move) |
| **Mobile nav** | Full-screen ink sheet, large type links, staggered reveal, service groups as accordions, CTA pinned at the bottom |
| **Button** | Variants: `primary` (Volt bg, ink text, pill), `secondary` (transparent, 1px border, white text), `ghost`, `link` (underline grows from left). Sizes sm/md/lg. Primary has an arrow icon that slides 4px on hover; **magnetic** effect on desktop pointer devices only |
| **Service card** | Ink-800 card with hairline border, icon (stroke SVG), title, summary, "Explore →". Hover: border brightens, a **radial cursor-following glow** (CSS vars `--mx/--my`), icon strokes animate (`stroke-dashoffset`) |
| **Stat** | Big Geist Mono number + label + optional source footnote. **Renders only if `verified: true`** |
| **Testimonial** | Quote in large display type, name, role, company. Carousel only if ≥3 verified; otherwise a static grid. **Renders only if `verified: true`** |
| **Process steps** | 4 steps, numbered 01–04, connected by an SVG line that draws on scroll |
| **FAQ accordion** | Native `<details>/<summary>` styled (works without JS = SEO-safe). Plus icon rotates to ×. Height animation via Motion |
| **CTA band** | Full-width dark band, giant headline, primary + secondary buttons, animated gradient mesh behind (`assets/graphics/mesh-*.svg`) |
| **Enquiry form** | See `06_BACKEND_ADMIN_SPEC.md`. Floating labels, inline validation, a success state with an animated tick, error state with an email fallback |
| **Breadcrumbs** | Mono, small, `Home / Services / GA4 Consulting`, with BreadcrumbList JSON-LD |
| **Cookie banner** | Bottom-left card, "Accept all", "Reject non-essential", "Preferences". Equal prominence for accept and reject (ICO guidance) |
| **Prose** | Blog/legal typography: 68ch measure, styled H2/H3, lists, blockquote, tables, code |

## 6. Motion system

Library: **Motion** (`motion/react`) + **Lenis** for smooth scrolling (desktop only; disabled for reduced motion and touch).

**Principles**
1. Motion **explains hierarchy** (what to read first), it doesn't decorate.
2. Animate only `transform` and `opacity` (plus `clip-path` for reveals). Never animate layout properties.
3. **Content must be visible without JS.** Initial hidden states are applied only after hydration via a `.js-ready` class on `<html>`. Prerendered HTML is fully visible, so there's no SEO or LCP penalty.
4. `prefers-reduced-motion: reduce` → all reveals become instant, no parallax, no smooth scroll, no marquee, no magnetic effects.

**Tokens**
```ts
export const ease = {
  out: [0.22, 1, 0.36, 1],      // default
  inOut: [0.65, 0, 0.35, 1],
  spring: { type: "spring", stiffness: 260, damping: 26 }
};
export const dur = { xs: .15, sm: .3, md: .6, lg: .9, xl: 1.2 };
```

**Catalogue**

| Name | Where | Behaviour |
|---|---|---|
| `HeroIntro` | Home + page heroes | H1 split into lines; each line slides up from a clipped mask (y: 100% → 0) with a 0.08s stagger; then the lead fades in, then CTAs. Total ≤ 1.1s. **The H1 is present in HTML at full opacity before hydration** (LCP safe) |
| `Reveal` | Section headings, cards | Fade + 24px rise when 20% in view, once |
| `Stagger` | Grids/lists | Children reveal 0.06s apart |
| `DrawLine` | Process, timelines | SVG path `pathLength` 0→1 linked to scroll progress |
| `CountUp` | Verified stats | Counts from 0 to value in 1.2s when in view; the final number is in the HTML |
| `Marquee` | Platform/tool logos strip ("Google Ads · Meta · GA4 · Microsoft 365 · AWS · Make.com …") | Infinite CSS marquee, pauses on hover, stops for reduced motion |
| `MagneticButton` | Primary CTAs | Follows the pointer up to 8px; springs back |
| `CursorGlow` | Cards | Radial gradient follows the pointer inside the card |
| `ParallaxLayer` | Hero mesh graphic | translateY at 0.15× scroll; disabled < 1024px |
| `PageTransition` | Route changes | 250ms fade + 8px rise of `<main>`; scroll to top |
| `MenuSheet` | Mobile nav | Clip-path circle expanding from the menu button |
| `Accordion` | FAQs | Height auto via Motion `layout`; icon rotates 45° |
| `HoverUnderline` | Links | Underline scales X from left |

**Hero visual (home):** an animated **gradient mesh + fine dot-grid** (`assets/graphics/hero-mesh.svg` + CSS animated `background-position`) with three floating "signal" chips that drift slowly: `ROAS ↑`, `Tickets ↓`, `Hires ✓`. They're lightweight DOM elements, not a canvas or WebGL (keeps JS budget small).

## 7. Imagery
- Avoid generic stock where possible. Preferred, in order: (1) real team/office/client-work photography; (2) abstract brand graphics from `assets/graphics`; (3) AI-generated abstract imagery using the prompts in `ASSET_MANIFEST.md`.
- Photography treatment: slightly desaturated, cool shadows, 2px inner radius frame, optional duotone (ink → iris).
- All images: AVIF + WebP via `vite-imagetools`, explicit width/height, `loading="lazy"` except the LCP image, `fetchpriority="high"` on the LCP image.

## 8. Iconography
Custom 1.5px-stroke line icons in `assets/icons/` (24×24 viewBox, `currentColor`), one per service plus process steps. UI glyphs (arrows, chevrons, menu) from `lucide-react`.

## 9. Accessibility checklist (build must pass)
- Lighthouse Accessibility ≥ 98; axe-core zero serious/critical violations in CI.
- Visible focus ring: 2px Volt outline with a 2px offset on dark; 2px Iris on light.
- Skip-to-content link. Landmarks: header/nav/main/footer.
- Mega menu and accordion follow WAI-ARIA Authoring Practices.
- Form fields have labels, error messages linked with `aria-describedby`, and success announced via `aria-live="polite"`.
