# Shourya — Designer & Developer

A single-page 3D-creator portfolio built with **React**, **TypeScript**, **Tailwind CSS**,
**Framer Motion** and **Lucide React**, plus a **glassmorphism admin panel** for editing the
site visually and reading enquiries — while the public site stays a fully static build that
deploys to GitHub Pages unchanged.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
npm run audit    # verify every committed image exists, has a 2x twin and isn't duplicated
```

## Public site

| Route         | Section                                                          |
| ------------- | ---------------------------------------------------------------- |
| `/`           | Hero, scrolling preview strip, About, Services, Project cards     |
| `/about`      | Scroll-revealed bio with four decorative 3D objects              |
| `/projects`   | Sticky-stacking project cards that scale as you scroll past      |
| `/pricing`    | Services, plus any pricing packages added from the admin panel   |
| `/contact`    | Contact panel and the enquiry form                               |
| `/admin/*`    | The admin panel (login required)                                 |

## Admin panel

`/admin` is the same design language as the portfolio — glass surfaces, gradient display type,
Kanit, subtle borders — laid out as a dashboard instead of a marketing page.

```
/admin
├── Dashboard      stats, recent enquiries, quick edits, live preview
├── Website        Hero · About · Services · Previews · Pricing · Contact · Navigation & SEO
├── Projects       title, category, description, info, technologies, URL, CTA, images, order, visibility
├── Images         library, upload, replace, alt text, usage map, remove
├── Enquiries      inbox: read/unread, archive, search, filter, sort
└── Settings       account, publishing, export/import, reset
```

* **Edit → Preview → Save.** The preview is the real site in an iframe, opened with
  `?preview=draft`, so it renders your *unsaved* edits in the actual layout — there is no
  second copy of the design to keep in sync.
* **Image replacement without touching code.** Projects → Porsche 911 → Main image A →
  Change image → pick from the library or upload → Save. The same flow drives the hero
  portrait, the About profile picture, the 3D decorations, the preview strip and the share image.
* **Uploads are optimised in the browser** before they are sent: resized (never upscaled),
  re-encoded to WebP, and stored as a 1x/2x pair so `srcset` keeps working. A SHA-256 hash is
  checked first, so uploading the same file twice reuses the existing asset instead of storing
  a duplicate.
* **Errors are surfaced, never swallowed.** Upload type/size/failure, failed saves, failed
  enquiry submissions, auth failures, network errors and missing images all produce a readable
  message; a bad image reference falls back to the hero portrait rather than a broken icon.

## Connecting the backend (one time)

The public site is static. Authentication, content storage, uploads and enquiries need a small
external backend — **Supabase** (Postgres + Auth + Storage + RLS) is the only dependency
added, and it is loaded as a separate chunk that visitors never download.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, paste and run [`supabase/schema.sql`](supabase/schema.sql). It
   creates `site_content`, `enquiries`, the public `portfolio` storage bucket and every
   row-level security policy.
3. **Authentication → Users → Add user** — this email/password is the only credential that
   opens `/admin`.
4. **Project Settings → API** — copy *Project URL* and the *anon/publishable* key.
5. `cp .env.example .env.local` and fill them in, then restart the dev server.

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

`.env.local` is git-ignored. **Never** put the `service_role` key in a `VITE_` variable — Vite
inlines those into the public bundle. Row-level security (in the SQL file) is what actually
protects the data: the public site may only *read* the published content and *insert*
enquiries; every read, update and delete of content and enquiries requires a signed-in session.

### Publishing paths

Content is resolved in this order, so the site is never blank and never broken:

1. the published document in Supabase (when configured),
2. `public/content/site.json`, if you committed an export,
3. the last known copy cached in the browser,
4. the defaults in `src/content/defaults.ts`.

Without a backend the admin still works — it saves to the browser and **Settings → Export
site.json** produces the exact file to drop into `public/content/` for a GitHub Pages-only
workflow.

## Content architecture

```
src/content/
  types.ts              the shape of every editable field
  defaults.ts           the shipped copy, verbatim (single source of truth)
  resolve.ts            validation, fallbacks, usage map, image resolution
  SiteContentProvider.tsx  draft/published state, preview mode, cross-tab sync
src/admin/              the panel (lazily loaded — never in the visitor's bundle)
supabase/schema.sql     tables, storage bucket, RLS policies
```

The public sections read that data instead of holding their own strings, so editing a headline
in the panel and rebuilding the code can never disagree.

## Asset policy

Every visual asset is served from `public/assets`. The page makes **no requests to third-party
image hosts** and renders identically with all external hosts blocked. Uploaded images go to the
Supabase bucket and are registered in the content document, so the site keeps working whether
the image is a committed file or an upload.

| Area              | Original        | Shipped    | Change                     |
| ----------------- | --------------- | ---------- | -------------------------- |
| 21 marquee GIFs   | 168 MB          | 73.3 MB    | animated WebP, q72/q62     |
| portrait + 3D     | 3.5 MB PNG      | 0.45 MB    | WebP, alpha lossless       |
| 9 project shots   | 7.0 MB PNG/WebP | 2.4 MB     | WebP q90                   |
| **Total**         | **~179 MB**     | **76.2 MB**| **2.4× smaller**           |

* **Animated previews → animated WebP.** Frame count and per-frame durations are preserved.
* **Stills → WebP**, chosen by measuring PSNR against a lossless reference (≥ ~36 dB).
* **1x + 2x per asset**, served through `srcset`/`sizes`; the 2x variant is emitted at the
  source's own width when the source is narrower — **nothing is ever upscaled**.
* `width`/`height` are always emitted, so images cannot cause layout shift. Everything below the
  fold is `loading="lazy"`; the hero portrait is preloaded in `index.html` and the preload is
  released if the portrait is ever replaced.
* `npm run audit` fails the build check if a referenced file is missing, a 1x file has no 2x
  twin, or two files are byte-identical.

## Verification performed

Against the production build in `dist/` via `vite preview`:

* `npm run build` is clean — 0 TypeScript errors, no Vite/ESM issues.
* Lighthouse on the public home page: **accessibility 0.98, best practices 1.00, SEO 1.00**.
* `/`, `/about`, `/pricing`, `/projects`, `/contact`, `/admin` all render; 74 images, **0
  broken**, every one with `alt` text and explicit dimensions.
* Admin panel walked end-to-end against a stubbed session: dashboard, all seven website tabs,
  the project editor, the image library, the enquiry inbox and settings all render; editing a
  headline marks the draft dirty, the save bar appears, and the live preview shows the
  unsaved change in the real site.
* Auth gate verified: with no backend configured, `/admin` refuses to show a local password
  form and explains the setup instead of pretending to be secure.

## Notes

* Fonts: **Kanit** 300–900 from Google Fonts (the only external request the page makes).
* Palette: background `#0C0C0C`, foreground `#D7E2EA`.
* Display headings use the `.hero-heading` vertical gradient text treatment.
* `robots.txt` and `sitemap.xml` are published; the page title, meta description, Open Graph and
  Twitter tags come from `index.html` and are then kept in step with the editable settings.
