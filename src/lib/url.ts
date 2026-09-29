/**
 * Builds URLs that respect the deployment base path (GitHub Pages project sites
 * such as `/portfolio/` as well as `shouryaworks.github.io` at the root).
 */
export function siteUrl(
  path = "/",
  params: Record<string, string> = {},
): string {
  if (typeof window === "undefined") return path;
  const base = import.meta.env.BASE_URL || "/";
  const root = new URL(base.endsWith("/") ? base : `${base}/`, window.location.origin);
  const url = new URL(path.replace(/^\/+/, ""), root);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}
