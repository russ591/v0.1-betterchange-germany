import { getEntry, type CollectionEntry } from "astro:content";

// Phase A scaffold: a German variant of a training-categories/training-courses
// entry lives as a sibling file in a `de/` subdirectory, e.g.
// src/content/training-courses/csm.md (id "csm", English) alongside
// src/content/training-courses/de/csm.md (id "de/csm", German placeholder).
// The English entry's id/filename never changes, so nothing that already
// references it (other content, hardcoded hrefs, badge/icon lookups) breaks.
export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function localeOfId(id: string): Locale {
  return id.startsWith("de/") ? "de" : "en";
}

// The language-neutral slug shared by an entry and its translation, e.g.
// baseSlug("de/csm") === baseSlug("csm") === "csm" -- use this to key any
// lookup (badge/icon maps, cross-collection matching) that isn't itself
// locale-specific.
export function baseSlug(id: string): string {
  return id.startsWith("de/") ? id.slice(3) : id;
}

export function localizedId(id: string, locale: Locale): string {
  const base = baseSlug(id);
  return locale === "de" ? `de/${base}` : base;
}

// A training-schedules session only ever references the English course
// (there's one shared set of session instances, not duplicated per
// language) -- this resolves "the version of that course to display" for
// whichever locale the current page is in, falling back to English if a
// German variant is somehow missing.
export async function localizedCourse(
  courseRef: CollectionEntry<"training-schedules">["data"]["course"],
  locale: Locale
): Promise<CollectionEntry<"training-courses">> {
  const base = baseSlug(courseRef.id);
  if (locale === "de") {
    const de = await getEntry("training-courses", `de/${base}`);
    if (de) return de;
  }
  return (await getEntry("training-courses", base))!;
}
