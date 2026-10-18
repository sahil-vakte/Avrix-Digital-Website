Owner-supplied brand assets:
- `avrix-logo-white.webp`: original white AVRIX wordmark, displayed on dark backgrounds.
- `avrix-favicon.webp`: original red mark with transparency, used for favicons and app icons.

`content/site.json` selects these assets. The preparation script creates square PNG favicons, a multi-size ICO, an Apple touch icon and a web manifest for both development and production. It also creates a dark-backed PNG of the supplied wordmark for organisation search metadata and light surfaces. Social preview images embed the original wordmark.

Keep the source WebP files unchanged. Generated variants live in `frontend/public/` and are copied into the static build.
