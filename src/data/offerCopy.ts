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
// draft's "[Datum]"/"€X" template) rather than an exact-string lookup.
const EARLY_BIRD_RE = /^🎁 Early Bird Price\.\s*\n\s*Price jumps to (€[\d.,]+) after (.+?)\.?$/;

const MONTHS_DE: Record<string, string> = {
  jan: "Januar",
  january: "Januar",
  feb: "Februar",
  february: "Februar",
  mar: "März",
  march: "März",
  apr: "April",
  april: "April",
  may: "Mai",
  jun: "Juni",
  june: "Juni",
  jul: "Juli",
  july: "Juli",
  aug: "August",
  august: "August",
  sep: "September",
  sept: "September",
  september: "September",
  oct: "Oktober",
  october: "Oktober",
  nov: "November",
  november: "November",
  dec: "Dezember",
  december: "Dezember",
};

// English dates in this data read like "24th Oct" or "24th Oct 2026" --
// strip the ordinal suffix and reassemble in German style ("24. Oktober").
// Any shape this doesn't recognise (or an unmapped month) is returned
// unchanged rather than guessed at.
function germanizeEnglishDate(input: string): string {
  const match = input.trim().match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?(?:\s+(\d{4}))?$/);
  if (!match) return input;
  const [, day, monthRaw, year] = match;
  const month = MONTHS_DE[monthRaw.toLowerCase()];
  if (!month) return input;
  return year ? `${day}. ${month} ${year}` : `${day}. ${month}`;
}

export function translateOffer(offer: string, locale: Locale): string {
  if (locale !== "de") return offer;
  if (offer === BULK_OFFER_EN) return BULK_OFFER_DE;
  const match = offer.match(EARLY_BIRD_RE);
  if (match) {
    const [, price, date] = match;
    return `🎁 Frühbucherpreis. Preis steigt nach dem ${germanizeEnglishDate(date)} auf ${price}.`;
  }
  return offer;
}
