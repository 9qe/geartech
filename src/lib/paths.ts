/**
 * Prefixes app-root-relative public asset paths with the deployed base
 * path (GitHub Pages serves under /geartech). Absolute URLs
 * (https://...) and admin-added blobs pass through untouched.
 */
export const assetPath = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return url.startsWith("/") ? `${base}${url}` : url;
};
