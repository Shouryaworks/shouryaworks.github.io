# Shourya Portfolio

Static GitHub Pages portfolio for an independent web designer and front-end developer.

## Pages

- `index.html` — production homepage
- `contact.html` — dedicated contact flow with Gmail compose and copy-email fallback
- `SHOURYA-PORTFOLIO.html` — generated standalone homepage artifact; `contact.html` must remain beside it
- `build_standalone.py` — regenerates that artifact from the production homepage, CSS, JavaScript and local images

## Contact flow

Homepage CTA → `contact.html` → Gmail compose in a new browser tab or clipboard copy.

The site does not use desktop-email links, so Linux will not invoke `xdg-open` or a local mail application.

## Local development

From the repository root:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/`
- `http://localhost:4173/contact.html`

## Production files

- `styles.css` — shared visual system and homepage layout
- `script.js` — homepage scroll progress and year
- `contact.css` — contact-page layout and interaction states
- `contact.js` — clipboard copy behavior and year
- `favicon.svg` — site favicon
- `og-image.jpg` — 1200×630 social sharing image derived from the existing abstract hero artwork
- `images/editorial/` — local WebP backgrounds
- `IMAGE_CREDITS.md` — source photography and replacement guidance
- `robots.txt` — crawler policy
- `sitemap.xml` — homepage and contact-page discovery

## Deployment

The repository root is the GitHub Pages source. Commit all HTML, CSS, JavaScript, image and metadata files together so relative links such as `contact.html` resolve after deployment.
