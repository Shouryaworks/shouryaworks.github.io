/**
 * Every visual asset used by the site lives in `public/assets` and is produced
 * by the local asset pipeline (animated WebP for the marquee, WebP for stills).
 *
 * Each entry carries the real intrinsic size of both files so `srcset`
 * descriptors stay truthful and `width`/`height` prevent layout shift.
 *
 * This module is also the *catalog* the admin image library is seeded from:
 * `localImages` lists every committed file, including the three `ed-*` project
 * screenshots that the portfolio does not currently place on a card.
 */

export type LocalImage = {
  /** 1x file, e.g. "/assets/portrait/shourya.webp" */
  src: string;
  /** 2x file, e.g. "/assets/portrait/shourya@2x.webp" */
  src2x: string;
  /** intrinsic width of the 1x file */
  width: number;
  /** intrinsic height of the 1x file */
  height: number;
  /** intrinsic width of the 2x file (what the `srcset` descriptor advertises) */
  width2x: number;
};

/** A committed file plus the metadata the admin library shows. */
export type LocalImageEntry = LocalImage & {
  /** stable id used by the content document, e.g. "local:projects/nova-1" */
  id: string;
  /** group folder, also used as the library filter */
  group: string;
  /** file name without the `@2x` suffix and extension */
  name: string;
  alt: string;
};

const img = (
  dir: string,
  slug: string,
  width: number,
  height: number,
  width2x: number,
): LocalImage => ({
  src: `/assets/${dir}/${slug}.webp`,
  src2x: `/assets/${dir}/${slug}@2x.webp`,
  width,
  height,
  width2x,
});

/* ------------------------------------------------------------------ hero -- */

export const heroPortrait = img("portrait", "shourya", 520, 563, 1040);

export const HERO_PORTRAIT_SIZES =
  "(min-width: 1024px) 520px, (min-width: 768px) 440px, (min-width: 640px) 360px, 280px";

/* --------------------------------------------------------------- marquee -- */

export type MarqueeItem = LocalImage & { slug: string; alt: string };

/** Tiles render at 420x270 in an object-cover box, so 420 is the 1x width. */
const MARQUEE_1X_W = 420;
const MARQUEE_2X_W = 640;

const marquee = (slug: string, alt: string, height: number): MarqueeItem => ({
  ...img("marquee", slug, MARQUEE_1X_W, height, MARQUEE_2X_W),
  slug,
  alt,
});

export const marqueeRowOne: MarqueeItem[] = [
  marquee("01-space-voyage", "Space voyage website preview", 308),
  marquee("02-codenest", "CodeNest developer platform preview", 302),
  marquee("03-vex-ventures", "Vex Ventures landing page preview", 316),
  marquee("04-stellar-ai-v2", "Stellar AI landing page preview", 314),
  marquee("05-asme", "ASME landing page preview", 306),
  marquee("06-transform-data", "Transform Data dashboard preview", 310),
  marquee("07-vitara", "Vitara landing page preview", 292),
  marquee("08-terra", "Terra landing page preview", 306),
  marquee("09-skyelite", "Skyelite landing page preview", 318),
  marquee("10-aethera", "Aethera landing page preview", 306),
  marquee("11-designpro", "DesignPro landing page preview", 298),
];

export const marqueeRowTwo: MarqueeItem[] = [
  marquee("12-stellar-ai", "Stellar AI website preview", 372),
  marquee("13-xportfolio", "X Portfolio website preview", 320),
  marquee("14-orbit-web3", "Orbit Web3 landing page preview", 316),
  marquee("15-nexora", "Nexora landing page preview", 290),
  marquee("16-evr-ventures", "EVR Ventures landing page preview", 328),
  marquee("17-planet-orbit", "Planet Orbit website preview", 320),
  marquee("18-new-era", "New Era landing page preview", 298),
  marquee("19-wealth", "Wealth landing page preview", 300),
  marquee("20-luminex", "Luminex landing page preview", 316),
  marquee("21-nexus", "Nexus landing page preview", 330),
];

/* ------------------------------------------------------------------ about -- */

export const decorMoon = img("decor", "moon", 210, 210, 420);
export const decorP59 = img("decor", "p59", 180, 191, 360);
export const decorLego = img("decor", "lego", 210, 256, 420);
export const decorGroup = img("decor", "group", 220, 216, 440);

/* --------------------------------------------------------------- projects -- */

/** Project screenshots render at 640px wide in a cover box. */
export const projectImage = (slug: string, width2x: number) =>
  img("projects", slug, 640, 478, width2x);

/**
 * Committed project screenshots. `ed-*` is kept available for the image
 * library even though no card uses it today.
 */
export const projectScreenshots: Array<{ slug: string; width2x: number; alt: string }> = [
  { slug: "nova-1", width2x: 1280, alt: "NOVA Dinajpur screen one" },
  { slug: "nova-2", width2x: 1280, alt: "NOVA Dinajpur screen two" },
  { slug: "nova-3", width2x: 1280, alt: "NOVA Dinajpur hero screen" },
  { slug: "p911-1", width2x: 1200, alt: "Porsche 911 showcase screen one" },
  { slug: "p911-2", width2x: 1280, alt: "Porsche 911 showcase screen two" },
  { slug: "p911-3", width2x: 1200, alt: "Porsche 911 showcase hero screen" },
  { slug: "ed-1", width2x: 1280, alt: "Unused project screenshot" },
  { slug: "ed-2", width2x: 1280, alt: "Unused project screenshot" },
  { slug: "ed-3", width2x: 1280, alt: "Unused project screenshot" },
];

/* --------------------------------------------------------------- catalog -- */

type Seed = { name: string; alt: string; image: LocalImage };

const entry = (group: string, seed: Seed): LocalImageEntry => ({
  ...seed.image,
  id: `local:${group}/${seed.name}`,
  group,
  name: seed.name,
  alt: seed.alt,
});

/** Every committed file, ordered the way the library groups them. */
export const localImages: LocalImageEntry[] = [
  entry("portrait", { name: "shourya", alt: "Portrait of Shourya", image: heroPortrait }),
  entry("decor", { name: "moon", alt: "3D moon", image: decorMoon }),
  entry("decor", { name: "lego", alt: "3D lego brick", image: decorLego }),
  entry("decor", { name: "p59", alt: "3D abstract object", image: decorP59 }),
  entry("decor", { name: "group", alt: "3D abstract group", image: decorGroup }),
  ...marqueeRowOne.map((item) =>
    entry("marquee", { name: item.slug, alt: item.alt, image: item }),
  ),
  ...marqueeRowTwo.map((item) =>
    entry("marquee", { name: item.slug, alt: item.alt, image: item }),
  ),
  ...projectScreenshots.map((item) =>
    entry("projects", {
      name: item.slug,
      alt: item.alt,
      image: projectImage(item.slug, item.width2x),
    }),
  ),
];

export const localImageById = new Map(localImages.map((item) => [item.id, item]));

/** Converts a committed file into the shape the admin library stores. */
export function toAsset(item: LocalImageEntry) {
  return {
    id: item.id,
    src: item.src,
    src2x: item.src2x,
    width: item.width,
    height: item.height,
    width2x: item.width2x,
    alt: item.alt,
    origin: "local" as const,
    group: item.group,
  };
}
