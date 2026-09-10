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
