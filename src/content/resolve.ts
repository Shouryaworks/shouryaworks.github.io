import { localImageById, type LocalImage } from "../assets";
import { defaultContent } from "./defaults";
import type {
  Enquiry,
  ImageAsset,
  NavLink,
  PricingTier,
  ProjectImage,
  ProjectImageSlot,
  ProjectInfoRow,
  ProjectItem,
  ServiceItem,
  SiteContent,
  SocialLink,
} from "./types";

/* ---------------------------------------------------------------- helpers -- */

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const num = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const strArray = (value: unknown, fallback: string[]): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;

const obj = <T extends Record<string, unknown>>(value: unknown, fallback: T): T =>
  isObject(value) ? ({ ...fallback, ...value } as T) : fallback;

let idCounter = 0;
/** Readable, collision-resistant id for rows created in the admin panel. */
export function newId(prefix: string): string {
  idCounter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${idCounter.toString(36)}${random}`;
}

function navLinks(value: unknown, fallback: NavLink[]): NavLink[] {
  if (!Array.isArray(value)) return fallback;
  const out: NavLink[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    const label = str(item.label, "");
    const href = str(item.href, "");
    if (!label || !href) return;
    out.push({ id: str(item.id, `nav-${index}-${label.toLowerCase()}`), label, href });
  });
  return out.length ? out : fallback;
}

function socialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  const out: SocialLink[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    const label = str(item.label, "");
    const href = str(item.href, "");
    if (!label || !href) return;
    out.push({ id: str(item.id, `social-${index}`), label, href });
  });
  return out;
}

function serviceItems(value: unknown, fallback: ServiceItem[]): ServiceItem[] {
  if (!Array.isArray(value)) return fallback;
  const out: ServiceItem[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    const title = str(item.title, "");
    if (!title) return;
    out.push({
      id: str(item.id, `service-${index}`),
      title,
      description: str(item.description, ""),
      icon: str(item.icon, "sparkles"),
      visible: bool(item.visible, true),
    });
  });
  return out;
}

function projectInfo(value: unknown): ProjectInfoRow[] {
  if (!Array.isArray(value)) return [];
  const out: ProjectInfoRow[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    out.push({
      id: str(item.id, `info-${index}`),
      label: str(item.label, ""),
      value: str(item.value, ""),
    });
  });
  return out;
}

const SLOT_ORDER: ProjectImageSlot[] = ["a", "b", "c", "extra"];

function projectImages(value: unknown, fallback: ProjectImage[]): ProjectImage[] {
  if (!Array.isArray(value)) return fallback;
  const out: ProjectImage[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    const image = str(item.image, "");
    if (!image) return;
    const slot = SLOT_ORDER.includes(item.slot as ProjectImageSlot)
      ? (item.slot as ProjectImageSlot)
      : "extra";
    out.push({
      id: str(item.id, `img-${index}`),
      image,
      alt: str(item.alt, ""),
      slot,
    });
  });
  return out;
}

function projectItems(value: unknown, fallback: ProjectItem[]): ProjectItem[] {
  if (!Array.isArray(value)) return fallback;
  const out: ProjectItem[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    const name = str(item.name, "");
    if (!name) return;
    const number = str(item.number, String(index + 1).padStart(2, "0"));
    const images = projectImages(item.images, []);
    out.push({
      id: str(item.id, `project-${index}-${number}`),
      number,
      name,
      category: str(item.category, ""),
      description: str(item.description, ""),
      info: projectInfo(item.info),
      technologies: strArray(item.technologies, []),
      url: str(item.url, ""),
      ctaText: str(item.ctaText, "Live Project"),
      images: images.length ? images : projectImages([], []),
      visible: bool(item.visible, true),
    });
  });
  return out;
}

function pricingTiers(value: unknown): PricingTier[] {
  if (!Array.isArray(value)) return [];
  const out: PricingTier[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    out.push({
      id: str(item.id, `tier-${index}`),
      title: str(item.title, "Package"),
      price: str(item.price, ""),
      period: str(item.period, ""),
      description: str(item.description, ""),
      features: strArray(item.features, []),
      ctaText: str(item.ctaText, "Enquire"),
      ctaHref: str(item.ctaHref, "/contact"),
      highlighted: bool(item.highlighted, false),
      visible: bool(item.visible, true),
    });
  });
  return out;
}

function assetRows(value: unknown): ImageAsset[] {
  if (!Array.isArray(value)) return [];
  const out: ImageAsset[] = [];
  value.forEach((item, index) => {
    if (!isObject(item)) return;
    const src = str(item.src, "");
    if (!src) return;
    out.push({
      id: str(item.id, `upload-${index}`),
      src,
      src2x: str(item.src2x, "") || undefined,
      width: num(item.width, 1600),
      height: num(item.height, 1000),
      width2x: num(item.width2x, 0) || undefined,
      alt: str(item.alt, ""),
      bytes: num(item.bytes, 0) || undefined,
      format: str(item.format, "") || undefined,
      origin: item.origin === "local" ? "local" : "upload",
      group: str(item.group, "uploads"),
      path: str(item.path, "") || undefined,
      hash: str(item.hash, "") || undefined,
      addedAt: str(item.addedAt, "") || undefined,
    });
  });
  return out;
}

/** Returns a copy of `content` with every image reference pointing at `id`. */
export function replaceImageReference(content: SiteContent, from: string, to: string): SiteContent {
  const next = structuredClone(content);
  if (next.hero.portrait === from) next.hero.portrait = to;
  if (next.about.profileImage === from) next.about.profileImage = to;
  if (next.settings.ogImage === from) next.settings.ogImage = to;
  (Object.keys(next.about.decor) as Array<keyof typeof next.about.decor>).forEach((key) => {
    if (next.about.decor[key] === from) next.about.decor[key] = to;
  });
  next.marquee.rowOne = next.marquee.rowOne.map((id) => (id === from ? to : id));
  next.marquee.rowTwo = next.marquee.rowTwo.map((id) => (id === from ? to : id));
  next.services.items.forEach((item) => {
    if (item.icon === from) item.icon = to;
  });
  next.projects.items.forEach((project) => {
    project.images.forEach((image) => {
      if (image.image === from) image.image = to;
    });
  });
  return next;
}

/** Drops every reference to `id`, falling back to empty strings. */
export function clearImageReference(content: SiteContent, id: string): SiteContent {
  const blank = (current: string) => (current === id ? "" : current);
  const next = structuredClone(content);
  if (next.hero.portrait === id) next.hero.portrait = "";
  if (next.about.profileImage === id) next.about.profileImage = "";
  if (next.settings.ogImage === id) next.settings.ogImage = "";
  (Object.keys(next.about.decor) as Array<keyof typeof next.about.decor>).forEach((key) => {
    next.about.decor[key] = blank(next.about.decor[key]);
  });
  next.marquee.rowOne = next.marquee.rowOne.filter((entry) => entry !== id);
  next.marquee.rowTwo = next.marquee.rowTwo.filter((entry) => entry !== id);
  next.services.items.forEach((item) => {
    if (item.icon === id) item.icon = "";
  });
  next.projects.items.forEach((project) => {
    project.images = project.images.filter((image) => image.image !== id);
  });
  next.assets = next.assets.filter((asset) => asset.id !== id);
  return next;
}

/* --------------------------------------------------------------- resolver -- */

/**
 * Coerces anything (a Supabase row, an imported JSON file, a cached draft)
 * into a complete `SiteContent`. Missing sections fall back to the shipped
 * defaults, so a partial or corrupt document can never blank the website.
 */
export function resolveContent(input: unknown): SiteContent {
  const base = defaultContent;
  if (!isObject(input)) return structuredClone(base);

  const hero = obj<Record<string, unknown>>(input.hero, base.hero as never);
  const about = obj<Record<string, unknown>>(input.about, base.about as never);
  const decor = obj<Record<string, unknown>>(about.decor, base.about.decor as never);
  const services = obj<Record<string, unknown>>(input.services, base.services as never);
  const pricing = obj<Record<string, unknown>>(input.pricing, base.pricing as never);
  const projectsRaw = obj<Record<string, unknown>>(input.projects, base.projects as never);
  const marquee = obj<Record<string, unknown>>(input.marquee, base.marquee as never);
  const contact = obj<Record<string, unknown>>(input.contact, base.contact as never);
  const settings = obj<Record<string, unknown>>(input.settings, base.settings as never);

  return {
    version: num(input.version, base.version),
    updatedAt: str(input.updatedAt, base.updatedAt),
    assets: assetRows(input.assets),
    hero: {
      headline: str(hero.headline, base.hero.headline),
      subtitle: str(hero.subtitle, base.hero.subtitle),
      description: str(hero.description, base.hero.description),
      ctaText: str(hero.ctaText, base.hero.ctaText),
      ctaHref: str(hero.ctaHref, base.hero.ctaHref),
      portrait: str(hero.portrait, base.hero.portrait),
      portraitAlt: str(hero.portraitAlt, base.hero.portraitAlt),
      badge: str(hero.badge, base.hero.badge),
    },
    about: {
      title: str(about.title, base.about.title),
      body: str(about.body, base.about.body),
      extraTitle: str(about.extraTitle, base.about.extraTitle),
      extraText: str(about.extraText, base.about.extraText),
      ctaText: str(about.ctaText, base.about.ctaText),
      ctaHref: str(about.ctaHref, base.about.ctaHref),
      location: str(about.location, base.about.location),
      profileImage: str(about.profileImage, base.about.profileImage),
      decor: {
        moon: str(decor.moon, base.about.decor.moon),
        lego: str(decor.lego, base.about.decor.lego),
        p59: str(decor.p59, base.about.decor.p59),
        group: str(decor.group, base.about.decor.group),
      },
    },
    services: {
      title: str(services.title, base.services.title),
      description: str(services.description, base.services.description),
      items: serviceItems(services.items, base.services.items),
    },
    pricing: {
      title: str(pricing.title, base.pricing.title),
      subtitle: str(pricing.subtitle, base.pricing.subtitle),
      note: str(pricing.note, base.pricing.note),
      tiers: pricingTiers(pricing.tiers),
    },
    projects: {
      title: str(projectsRaw.title, base.projects.title),
      subtitle: str(projectsRaw.subtitle, base.projects.subtitle),
      items: projectItems(projectsRaw.items, base.projects.items),
    },
    marquee: {
      title: str(marquee.title, base.marquee.title),
      rowOne: strArray(marquee.rowOne, base.marquee.rowOne),
      rowTwo: strArray(marquee.rowTwo, base.marquee.rowTwo),
    },
    contact: {
      eyebrow: str(contact.eyebrow, base.contact.eyebrow),
      title: str(contact.title, base.contact.title),
      description: str(contact.description, base.contact.description),
      email: str(contact.email, base.contact.email),
      ctaText: str(contact.ctaText, base.contact.ctaText),
      secondaryCtaText: str(contact.secondaryCtaText, base.contact.secondaryCtaText),
      secondaryCtaHref: str(contact.secondaryCtaHref, base.contact.secondaryCtaHref),
      socials: socialLinks(contact.socials),
      formEnabled: bool(contact.formEnabled, base.contact.formEnabled),
      formTitle: str(contact.formTitle, base.contact.formTitle),
      formNote: str(contact.formNote, base.contact.formNote),
      enquiryTypes: strArray(contact.enquiryTypes, base.contact.enquiryTypes),
      budgets: strArray(contact.budgets, base.contact.budgets),
    },
    settings: {
      brand: str(settings.brand, base.settings.brand),
      siteTitle: str(settings.siteTitle, base.settings.siteTitle),
      metaDescription: str(settings.metaDescription, base.settings.metaDescription),
      ogImage: str(settings.ogImage, base.settings.ogImage),
      navLinks: navLinks(settings.navLinks, base.settings.navLinks),
    },
  };
}

/** `true` when two documents describe the same website. */
export function isSameContent(a: SiteContent, b: SiteContent): boolean {
  return JSON.stringify(stripStamp(a)) === JSON.stringify(stripStamp(b));
}

function stripStamp(content: SiteContent) {
  const { updatedAt: _updatedAt, ...rest } = content;
  return rest;
}

/* ----------------------------------------------------------------- images -- */

export type ImageLibrary = ImageAsset[];

/**
 * Turns a library entry into the `LocalImage` shape the public components
 * render, or `null` when the entry is unusable.
 */
export function toLocalImage(asset: ImageAsset | undefined): LocalImage | null {
  if (!asset || !asset.src) return null;
  return {
    src: asset.src,
    src2x: asset.src2x || asset.src,
    width: asset.width || 1,
    height: asset.height || 1,
    width2x: asset.width2x || asset.width || 1,
  };
}

/**
 * Resolves an image id against the library. Unknown ids fall back to the
 * matching committed file, then to the hero portrait, so a bad reference shows
 * the portfolio rather than a broken image.
 */
export function resolveImage(library: ImageLibrary, id: string): LocalImage {
  const found = library.find((asset) => asset.id === id);
  const direct = toLocalImage(found);
  if (direct) return direct;

  const local = localImageById.get(id);
  if (local) {
    return { src: local.src, src2x: local.src2x, width: local.width, height: local.height, width2x: local.width2x };
  }

  // An empty id is a slot the owner deliberately left blank — not a mistake.
  if (id) {
    console.warn(`[content] Unknown image reference "${id}" — falling back to the hero portrait.`);
  }
  const fallback = localImageById.get(defaultContent.hero.portrait);
  return fallback
    ? { src: fallback.src, src2x: fallback.src2x, width: fallback.width, height: fallback.height, width2x: fallback.width2x }
    : { src: "", src2x: "", width: 1, height: 1, width2x: 1 };
}

/** Human-readable place for an image id, used by the image library. */
export function describeUsage(content: SiteContent, id: string): string[] {
  const uses: string[] = [];
  const c = content;
  if (c.hero.portrait === id) uses.push("Hero portrait");
  if (c.about.profileImage === id) uses.push("About profile image");
  if (c.settings.ogImage === id) uses.push("Social share image");
  Object.entries(c.about.decor).forEach(([key, value]) => {
    if (value === id) uses.push(`About decor (${key})`);
  });
  if (c.marquee.rowOne.includes(id)) uses.push("Preview strip — row 1");
  if (c.marquee.rowTwo.includes(id)) uses.push("Preview strip — row 2");
  c.services.items.forEach((item) => {
    if (item.icon === id) uses.push(`Service icon — ${item.title}`);
  });
  c.projects.items.forEach((project) => {
    project.images.forEach((image, index) => {
      if (image.image === id) uses.push(`${project.name} — image ${index + 1}`);
    });
  });
  return uses;
}

/** Image ids that nothing points at, so the library can flag them. */
export function unusedImageIds(content: SiteContent, library: ImageLibrary): Set<string> {
  const used = new Set<string>([content.hero.portrait, content.settings.ogImage]);
  if (content.about.profileImage) used.add(content.about.profileImage);
  Object.values(content.about.decor).forEach((id) => used.add(id));
  content.marquee.rowOne.forEach((id) => used.add(id));
  content.marquee.rowTwo.forEach((id) => used.add(id));
  content.services.items.forEach((item) => used.add(item.icon));
  content.projects.items.forEach((project) =>
    project.images.forEach((image) => used.add(image.image)),
  );
  return new Set(library.map((asset) => asset.id).filter((id) => !used.has(id)));
}

/* -------------------------------------------------------------- enquiries -- */

export function resolveEnquiry(row: unknown): Enquiry | null {
  if (!isObject(row)) return null;
  const name = str(row.name, "");
  const email = str(row.email, "");
  if (!name && !email) return null;
  return {
    id: str(row.id, ""),
    name,
    email,
    type: str(row.type, ""),
    budget: str(row.budget, ""),
    message: str(row.message, ""),
    created_at: str(row.created_at, new Date().toISOString()),
    read: bool(row.read, false),
    archived: bool(row.archived, false),
  };
}

export function unreadCount(rows: Enquiry[]): number {
  return rows.filter((row) => !row.read && !row.archived).length;
}
