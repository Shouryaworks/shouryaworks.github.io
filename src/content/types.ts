/**
 * Shape of every piece of editable website content.
 *
 * One `SiteContent` object describes the whole public site, so the admin panel
 * and the public pages never disagree about what the portfolio says. The
 * default value of this object lives in `defaults.ts` and is a verbatim copy of
 * the copy that was previously hard-coded inside the section components.
 */

export type NavLink = {
  id: string;
  label: string;
  href: string;
};

export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

/** A row in the admin image library. */
export type ImageAsset = {
  id: string;
  /** 1x URL — a path under /assets for local files, a storage URL for uploads */
  src: string;
  /** 2x URL, when the asset has one */
  src2x?: string;
  width: number;
  height: number;
  /** intrinsic width advertised by the 2x file */
  width2x?: number;
  alt: string;
  /** file size in bytes, filled in when it is known */
  bytes?: number;
  format?: string;
  /** `local` = committed under public/assets, `upload` = added from the admin */
  origin: "local" | "upload";
  group: string;
  /** storage object path, only for uploads (used to replace/delete) */
  path?: string;
  /** content hash of the original upload, used to refuse duplicate copies */
  hash?: string;
  addedAt?: string;
};

export type HeroContent = {
  headline: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  /** image id of the hero portrait */
  portrait: string;
  portraitAlt: string;
  /** small label above the headline; leave empty to hide it */
  badge: string;
};

export type AboutContent = {
  title: string;
  /** the long bio paragraph, revealed character by character on scroll */
  body: string;
  extraTitle: string;
  /** optional second block, rendered only when it has text */
  extraText: string;
  ctaText: string;
  ctaHref: string;
  location: string;
  /** image id used for the profile picture; falls back to the hero portrait */
  profileImage: string;
  /** decorative 3D objects, one image id each */
  decor: {
    moon: string;
    lego: string;
    p59: string;
    group: string;
  };
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  /** lucide icon name, rendered in the admin list only */
  icon: string;
  visible: boolean;
};

export type ServicesContent = {
  title: string;
  description: string;
  items: ServiceItem[];
};

export type PricingTier = {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  highlighted: boolean;
  visible: boolean;
};

export type PricingContent = {
  title: string;
  subtitle: string;
  note: string;
  tiers: PricingTier[];
};

export type ProjectImageSlot = "a" | "b" | "c" | "extra";

export type ProjectImage = {
  id: string;
  /** image id from the library */
  image: string;
  alt: string;
  /** a = top-left tile, b = bottom-left tile, c = tall right tile */
  slot: ProjectImageSlot;
};

export type ProjectInfoRow = {
  id: string;
  label: string;
  value: string;
};

export type ProjectItem = {
  id: string;
  /** big number shown on the card, e.g. "01" */
  number: string;
  name: string;
  category: string;
  description: string;
  /** flexible key/value details: client, year, role, scope … */
  info: ProjectInfoRow[];
  technologies: string[];
  url: string;
  ctaText: string;
  images: ProjectImage[];
  visible: boolean;
};

export type ProjectsContent = {
  title: string;
  subtitle: string;
  items: ProjectItem[];
};

export type MarqueeContent = {
  title: string;
  /** image ids, in order */
  rowOne: string[];
  rowTwo: string[];
};

export type ContactContent = {
  eyebrow: string;
  title: string;
  description: string;
  email: string;
  ctaText: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  socials: SocialLink[];
  formEnabled: boolean;
  formTitle: string;
  formNote: string;
  /** options offered by the enquiry form */
  enquiryTypes: string[];
  budgets: string[];
};

export type SettingsContent = {
  brand: string;
  siteTitle: string;
  metaDescription: string;
  /** image id used for Open Graph / share previews */
  ogImage: string;
  navLinks: NavLink[];
};

export type SiteContent = {
  version: number;
  updatedAt: string;
  /** registry of images uploaded from the admin panel (committed files live in `assets.ts`) */
  assets: ImageAsset[];
  settings: SettingsContent;
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  pricing: PricingContent;
  projects: ProjectsContent;
  marquee: MarqueeContent;
  contact: ContactContent;
};

/** A message that came from the portfolio contact form. */
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  /** project or service the visitor is interested in */
  type: string;
  budget: string;
  message: string;
  created_at: string;
  read: boolean;
  archived: boolean;
};
