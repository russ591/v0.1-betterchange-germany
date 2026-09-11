// Session/course price strings (training-schedules, training-courses
// content) are free-text and not locale-split, always stored in English
// number format (comma thousands separator, e.g. "€1,890",
// "€1,100–€1,400", "from DKK 7,000"). This reformats them for German
// display only -- period as the thousands separator, "from " -> "ab ",
// per house style -- leaving the stored data untouched.
import type { Locale } from "@/lib/i18n";

export function germanizePrice(price: string, locale: Locale): string {
  if (locale !== "de") return price;
  return price.replace(/^from\s+/i, "ab ").replace(/(\d),(\d)/g, "$1.$2");
}
