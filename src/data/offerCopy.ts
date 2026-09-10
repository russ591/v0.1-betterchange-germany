// Session `offer` text (training-schedules content) is free-text English --
// it isn't a locale-split collection, and /training/register/[session].astro
// pattern-matches the raw English string for behaviour (hasBulkOffer), so
// the stored data must stay English. In practice only a small set of
// recurring promotional phrases get used, so this translates display output
// for the two the German draft (betterchange-de-translation-draft-course-
// template.md) covers, leaving anything else as-is in English rather than
// guessing at a translation.
import type { Locale } from "@/lib/i18n";

const BULK_OFFER_EN = "🎁 Offer: 3 seats for the price of 2";
const BULK_OFFER_DE = "🎁 Angebot: 3 Plätze zum Preis von 2";

// "🎁 Early Bird Price. \nPrice jumps to €X after <date>." -- price and date
// vary per session, so this is a pattern match + reassembly (matching the
// draft's "[Datum]"/"€X" template) rather than an exact-string lookup. The
// date substring is carried through verbatim (e.g. "24th Oct"), not
// reformatted into German date style -- not covered by the draft.
const EARLY_BIRD_RE = /^🎁 Early Bird Price\.\s*\n\s*Price jumps to (€[\d.,]+) after (.+?)\.?$/;

export function translateOffer(offer: string, locale: Locale): string {
  if (locale !== "de") return offer;
  if (offer === BULK_OFFER_EN) return BULK_OFFER_DE;
  const match = offer.match(EARLY_BIRD_RE);
  if (match) {
    const [, price, date] = match;
    return `🎁 Frühbucherpreis. Preis steigt nach dem ${date} auf ${price}.`;
  }
  return offer;
}
