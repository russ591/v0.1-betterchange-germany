// Astro's static build automatically percent-encodes `?` and `#` in a
// route's own output path (they're reserved URL delimiters — a literal `?`
// or `#` in a path segment is structurally impossible: browsers treat
// everything after them as a query string or fragment and never send it to
// the server). Every other character in a migrated slug (parentheses,
// colons, apostrophes, em-dashes, accented letters) is left completely
// literal on disk.
//
// That auto-encoding only happens inside Astro's router. Anywhere we build
// an href ourselves by interpolating a slug into a string, we have to match
// it by hand — otherwise the link renders with a literal `?`/`#` and the
// browser truncates the path before ever requesting the real page.
export function toPathSegment(slug: string): string {
  return slug.replace(/#/g, "%23").replace(/\?/g, "%3F");
}
