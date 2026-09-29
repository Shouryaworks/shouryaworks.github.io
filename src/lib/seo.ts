import type { LocalImage } from "../assets";
import type { SettingsContent } from "../content/types";

/**
 * Keeps the document head in step with the editable site settings.
 *
 * `index.html` ships the shipped defaults so search engines and link previews
 * always see something sensible on first paint; this then overlays whatever the
 * admin panel has published, without ever removing a tag that already exists.
 */

const setMeta = (selector: string, attribute: "name" | "property", key: string, value: string) => {
  if (!value) return;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
};

export function applySeo(settings: SettingsContent, ogImage?: LocalImage | null) {
  if (typeof document === "undefined") return;

  if (settings.siteTitle) document.title = settings.siteTitle;
  setMeta('meta[name="description"]', "name", "description", settings.metaDescription);
  setMeta('meta[property="og:title"]', "property", "og:title", settings.siteTitle);
  setMeta('meta[property="og:description"]', "property", "og:description", settings.metaDescription);
  setMeta('meta[property="og:type"]', "property", "og:type", "website");
  setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", settings.siteTitle);
  setMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    settings.metaDescription,
  );
  if (ogImage?.src) {
    setMeta('meta[property="og:image"]', "property", "og:image", ogImage.src);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage.src);
  }

  if (typeof window !== "undefined" && window.location.origin) {
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, "") || "/";
  }
}

/**
 * `index.html` preloads the shipped hero portrait for the largest contentful
 * paint. If the portrait has since been replaced, that speculative request is
 * wasted bandwidth, so it is dropped once the live portrait is known.
 */
export function releaseStaleHeroPreload(currentSrc?: string) {
  if (typeof document === "undefined") return;
  document.head
    .querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')
    .forEach((link) => {
      const href = link.getAttribute("href") ?? "";
      if (href && href !== currentSrc) link.remove();
    });
}
