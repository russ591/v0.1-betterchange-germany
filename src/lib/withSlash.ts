// The one place that decides what an internal page link looks like.
//
// Every page on this site is built as <path>/index.html, so its real URL ends
// in "/". A link without the slash makes Netlify answer with a 301 first, and a
// canonical or hreflang without it points search engines at a URL that is not
// the final one. Anything that builds an internal page path (a `${prefix}/...`
// template, a `translations` entry, a breadcrumb, a registration link, a link
// inside an article body) goes through withSlash(); `npm run build` fails via
// scripts/check-internal-links.mjs when one slips through.
//
// Kept free of Astro and content imports so scripts/check-with-slash.mjs can
// run it under plain Node.

/** Files get no slash: /logo.png, /og-image.png, /sitemap-index.xml, /robots.txt, ... */
const FILE_EXTENSION = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|pdf|xml|txt|json|css|js|mjs|map|woff2?|ttf|otf|mp4|webm|webmanifest|html|csv|zip)$/i;

/** This site's own absolute URLs are page links too (JSON-LD, article bodies). */
const OWN_ORIGIN = /^https?:\/\/(?:www\.)?betterchange-consulting\.de(?=[/?#]|$)/i;

/** Anything with a scheme (https:, mailto:, tel:) or "//host" is somebody else's. */
const FOREIGN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Add the trailing slash to an internal page path, leaving everything else alone.
 *
 *   withSlash("/training")                   -> "/training/"
 *   withSlash("/training#schedule")          -> "/training/#schedule"
 *   withSlash("/training?topic=scrum#x")     -> "/training/?topic=scrum#x"
 *   withSlash("")                            -> "/"      (so `prefix || "/"` becomes withSlash(prefix))
 *   withSlash("/de")                         -> "/de/"
 *   withSlash("/logo.png")                   -> "/logo.png"  (files never get a slash)
 *   withSlash("#schedule")                   -> "#schedule"
 *   withSlash("https://example.com/x")       -> unchanged    (not this site)
 *   withSlash("https://betterchange-consulting.de/about") -> ".../about/"
 *
 * Slugs are never rewritten: colons, brackets, commas and dots in a path stay as they are
 * ("/insights/agile-mishap-4:-incompetent-coaches-and-trainers" gains only the final "/").
 */
export function withSlash(href: string): string {
  if (href === "") return "/";
  if (href.startsWith("#") || href.startsWith("?")) return href;

  const own = OWN_ORIGIN.exec(href);
  if (!own && FOREIGN.test(href)) return href;

  const origin = own ? own[0] : "";
  const rest = href.slice(origin.length);
  const cut = rest.search(/[?#]/);
  const path = cut === -1 ? rest : rest.slice(0, cut);
  const tail = cut === -1 ? "" : rest.slice(cut);

  if (path.endsWith("/") || FILE_EXTENSION.test(path)) return origin + path + tail;
  return `${origin}${path}/${tail}`;
}
