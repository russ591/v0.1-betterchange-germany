import { ui, type UIKey } from "@/i18n/ui";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

// `Astro.currentLocale` is undefined for anything Astro couldn't match to a
// configured locale (it shouldn't happen for pages under this site's own
// routing, but components render in other contexts too) -- fall back to
// the default language rather than throwing.
export function resolveLocale(currentLocale: string | undefined): Locale {
  return currentLocale === "de" ? "de" : DEFAULT_LOCALE;
}

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key];
  };
}

// A content-collection field like a course's metaTitle/metaDescription is
// never actually absent on the German side -- Phase A scaffolding gave
// every such field a "[DE] " placeholder rather than leaving it undefined,
// so a plain `value ?? fallback` never falls back once a translation pass
// hasn't reached that specific field yet (the placeholder is still a
// non-empty, non-null string). This treats a still-"[DE] "-prefixed value
// the same as an absent one, and starts using the real value automatically
// once a future pass replaces the placeholder -- no code change needed then.
export function metaOrFallback(value: string | undefined, fallback: string): string {
  if (!value || value.startsWith("[DE] ")) return fallback;
  return value;
}
