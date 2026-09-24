# Image Credits

Three quiet atmospheric backgrounds are stored locally in `images/editorial/` and used under the [Unsplash License](https://unsplash.com/license).

| Local file | Source | Use |
|---|---|---|
| `hero-abstract.webp` | https://unsplash.com/photos/jCH-S3oaBf8 | Homepage hero background and source artwork for the social card |
| `project-architecture.webp` | https://unsplash.com/photos/dOG0z4-gqp0 | Homepage work background |
| `hero-architecture.webp` | https://unsplash.com/photos/bGXDyiv_yiA | Homepage contact background and dedicated contact-page background |

`og-image.jpg` is a locally generated 1200×630 social-sharing image derived from `hero-abstract.webp` with portfolio text overlaid.

No people, laptops, workshops or image-card grids are used.

## Replacing a background

1. Put the optimized WebP file inside `images/editorial/`.
2. Keep the existing filename to replace it without changing page markup.
3. If using a different filename, update the relevant `src` values in `index.html` and `contact.html`.
4. Regenerate `SHOURYA-PORTFOLIO.html` from the production homepage if that standalone artifact is retained.
5. Update `og-image.jpg` if the hero artwork changes.
6. Add the new source to this file.
