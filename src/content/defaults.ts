import { marqueeRowOne, marqueeRowTwo } from "../assets";
import type {
  AboutContent,
  ContactContent,
  HeroContent,
  MarqueeContent,
  PricingContent,
  ProjectsContent,
  ServicesContent,
  SettingsContent,
  SiteContent,
} from "./types";

/**
 * The shipped content of the portfolio, copied verbatim from the copy that used
 * to live inside the section components. Nothing here is invented: the pricing
 * tiers are empty because the portfolio has never published prices, and they
 * only render once one is added from the admin panel.
 */

const MARQUEE_ID = (slug: string) => `local:marquee/${slug}`;
const PROJECT_ID = (slug: string) => `local:projects/${slug}`;

const hero: HeroContent = {
  // The typographic apostrophe is stored in the data so the rendered glyph is
  // identical to the hand-written `&rsquo;` this replaces.
  headline: "Hi, i’m Shourya",
  subtitle:
    "an independent designer and developer creating websites with clarity and character",
  description:
    "Shourya is an independent designer and developer based in Dinajpur, Bangladesh, creating websites with clarity and character.",
  ctaText: "Contact Me",
  ctaHref: "/contact",
  portrait: "local:portrait/shourya",
  portraitAlt: "Portrait of Shourya",
  badge: "",
};

const about: AboutContent = {
  title: "About me",
  body: "I’m an independent designer and developer based in Dinajpur, Bangladesh. I help independent people and small businesses build a strong presence online through clear structure, considered design, responsive development, and intentional visual direction. I care about how a website feels as much as how it looks, bringing typography, spacing, interaction and writing together without getting in the way. I use modern tools, including AI where it genuinely helps, to explore ideas and move faster while keeping the direction and final details intentional.",
  extraTitle: "",
  extraText: "",
  ctaText: "Contact Me",
  ctaHref: "/contact",
  location: "Dinajpur, Bangladesh",
  profileImage: "",
  decor: {
    moon: "local:decor/moon",
    lego: "local:decor/lego",
    p59: "local:decor/p59",
    group: "local:decor/group",
  },
};

const services: ServicesContent = {
  title: "Services",
  description: "",
  items: [
    {
      id: "service-website-design",
      title: "Website Design",
      description:
        "Simple, memorable layouts that make the right things clear, with careful attention to typography, spacing, structure, and visual hierarchy.",
      icon: "layout",
      visible: true,
    },
    {
      id: "service-front-end",
      title: "Front End Development",
      description:
        "Responsive, accessible websites built with clean HTML, CSS and JavaScript, designed to work smoothly across different screen sizes.",
      icon: "code",
      visible: true,
    },
    {
      id: "service-direction",
      title: "Design Direction",
      description:
        "A focused visual identity for people and businesses who want their website to feel intentional, distinctive, and true to them.",
      icon: "compass",
      visible: true,
    },
    {
      id: "service-interactive",
      title: "Interactive Experiences",
      description:
        "Thoughtful interactions, motion, and visual details that make digital experiences feel polished, engaging, and memorable.",
      icon: "sparkles",
      visible: true,
    },
    {
      id: "service-creative",
      title: "Creative Development",
      description:
        "Using modern tools, including AI where it genuinely helps, to explore ideas and move faster while keeping the direction and final details intentional.",
      icon: "wand",
      visible: true,
    },
  ],
};

const pricing: PricingContent = {
  title: "Pricing options",
  subtitle: "Choose the level that fits your project.",
  note: "Start with a clear package below, or choose a custom order if you have something specific in mind.",
  tiers: [
    {
      id: "tier-landing",
      title: "Landing",
      price: "৳1,500+",
      period: "",
      description:
        "A focused one-page website built to present your work, brand, or idea with clarity and character.",
      features: [],
      ctaText: "Start with Landing",
      ctaHref: "/contact",
      highlighted: false,
      visible: true,
    },
    {
      id: "tier-portfolio",
      title: "Portfolio",
      price: "৳3,000+",
      period: "",
      description:
        "A polished multi-page website designed to showcase your work, services, and personal brand with a distinctive visual identity.",
      features: [],
      ctaText: "Choose Portfolio",
      ctaHref: "/contact",
      highlighted: false,
      visible: true,
    },
    {
      id: "tier-showcase",
      title: "Showcase",
      price: "৳5,000+",
      period: "",
      description:
        "A more immersive web experience for projects that need richer interactions, motion, and a stronger visual presence.",
      features: [],
      ctaText: "Build a Showcase",
      ctaHref: "/contact",
      highlighted: false,
      visible: true,
    },
    {
      id: "tier-custom",
      title: "Custom Order",
      price: "Custom Price",
      period: "",
      description:
        "Have something specific in mind? Build a website around your exact requirements instead of fitting your idea into a fixed package.",
      features: [],
      ctaText: "Request a Custom Order",
      ctaHref: "/contact",
      highlighted: false,
      visible: true,
    },
  ],
};

const projects: ProjectsContent = {
  title: "Project",
  subtitle: "",
  items: [
    {
      id: "project-nova-dinajpur",
      number: "01",
      name: "NOVA Dinajpur",
      category: "Local business",
      description:
        "A local business site for NOVA Dinajpur — clear structure, considered typography and a responsive layout that works on every screen.",
      info: [
        { id: "nova-client", label: "Client", value: "NOVA Dinajpur" },
        { id: "nova-scope", label: "Scope", value: "Website design & front end" },
      ],
      technologies: ["HTML", "CSS", "JavaScript"],
      url: "",
      ctaText: "Live Project",
      images: [
        { id: "nova-img-1", image: PROJECT_ID("nova-1"), alt: "NOVA Dinajpur screen one", slot: "a" },
        { id: "nova-img-2", image: PROJECT_ID("nova-2"), alt: "NOVA Dinajpur screen two", slot: "b" },
        { id: "nova-img-3", image: PROJECT_ID("nova-3"), alt: "NOVA Dinajpur hero screen", slot: "c" },
      ],
      visible: true,
    },
    {
      id: "project-porsche-911",
      number: "02",
      name: "Porsche 911 Interactive Showcase",
      category: "Interactive concept",
      description:
        "An ultra-realistic garage showcase: a Porsche 911 presented in a premium garage environment with interactive 3D movement, mouse-controlled interaction, layered whole-car disassembly, and inspection of individual sections, the interior and individual parts.",
      info: [
        { id: "p911-type", label: "Type", value: "Interactive 3D concept" },
        {
          id: "p911-features",
          label: "Features",
          value: "3D movement, layered disassembly, interior & parts visibility",
        },
      ],
      technologies: ["Three.js", "WebGL", "GLSL"],
      url: "",
      ctaText: "Live Project",
      images: [
        { id: "p911-img-1", image: PROJECT_ID("p911-1"), alt: "Porsche 911 showcase screen one", slot: "a" },
        { id: "p911-img-2", image: PROJECT_ID("p911-2"), alt: "Porsche 911 showcase screen two", slot: "b" },
        { id: "p911-img-3", image: PROJECT_ID("p911-3"), alt: "Porsche 911 showcase hero screen", slot: "c" },
      ],
      visible: true,
    },
  ],
};

const marquee: MarqueeContent = {
  title: "Selected motion work",
  rowOne: marqueeRowOne.map((item) => MARQUEE_ID(item.slug)),
  rowTwo: marqueeRowTwo.map((item) => MARQUEE_ID(item.slug)),
};

const contact: ContactContent = {
  eyebrow: "Let’s build something",
  title: "Start a project",
  description:
    "Tell me what you are building, what you need, and what you want it to feel like. I will get back to you with the next step.",
  email: "voylobusiness@gmail.com",
  ctaText: "Email me",
  secondaryCtaText: "See my work",
  secondaryCtaHref: "/projects",
  socials: [],
  formEnabled: true,
  formTitle: "Send an enquiry",
  formNote: "I usually reply within a day or two.",
  enquiryTypes: [
    "Website Design",
    "Front End Development",
    "Design Direction",
    "Interactive Experiences",
    "Creative Development",
    "Something else",
  ],
  budgets: ["Under ৳50k", "৳50k – ৳1.5L", "৳1.5L – ৳3L", "Over ৳3L", "Not sure yet"],
};

const settings: SettingsContent = {
  brand: "Shourya",
  siteTitle: "Shourya | Designer & Developer",
  metaDescription:
    "Shourya | Designer & Developer. An independent designer and developer creating websites with clarity and character.",
  ogImage: "",
  navLinks: [
    { id: "nav-about", label: "About", href: "/about" },
    { id: "nav-pricing", label: "Price", href: "/pricing" },
    { id: "nav-projects", label: "Projects", href: "/projects" },
    { id: "nav-contact", label: "Contact", href: "/contact" },
  ],
};

export const defaultContent: SiteContent = {
  version: 1,
  updatedAt: "2024-01-01T00:00:00.000Z",
  assets: [],
  settings,
  hero,
  about,
  services,
  pricing,
  projects,
  marquee,
  contact,
};

/** Convenience aliases so the image library can label default references. */
export const defaultImageIds = {
  hero: hero.portrait,
  marquee: [...marquee.rowOne, ...marquee.rowTwo],
  projects: projects.items.flatMap((item) => item.images.map((image) => image.image)),
  decor: Object.values(about.decor),
};
