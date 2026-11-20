// Course structured data (schema.org Course with one CourseInstance per
// bookable session), shared by the English and German course pages. Only
// what the content data says: the session's format becomes courseMode, an
// in-person session gets a Place with its city and country plus an endDate
// (start plus the course's durationDays), and a price is only written when
// the price text parses cleanly. A range or a "from" price becomes a
// PriceSpecification; anything else is left out rather than guessed.
import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/lib/i18n";

const COURSE_MODE = { "in-person": "Onsite", "live-online": "Online", "self-paced": "Online" } as const;

const COUNTRY_CODES: Record<string, string> = {
  germany: "DE",
  denmark: "DK",
  sweden: "SE",
  italy: "IT",
  lithuania: "LT",
  croatia: "HR",
};

const CURRENCY_SYMBOLS: Record<string, string> = { "€": "EUR", "£": "GBP", "$": "USD" };

/** "Berlin, Germany" becomes a Place with a PostalAddress; "Online" never reaches here. */
export function placeFor(location: string) {
  const [city, country] = location.split(",").map((part) => part.trim());
  return {
    "@type": "Place",
    name: location,
    ...(city && {
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        ...(country && { addressCountry: COUNTRY_CODES[country.toLowerCase()] ?? country }),
      },
    }),
  };
}

function toNumber(text: string): number | undefined {
  const value = Number(text.replace(/[.,](?=\d{3}(\D|$))/g, ""));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/**
 * Offer price fields for a session price string such as "€2,190",
 * "€1,300–€1,600", "from DKK 7,000" or "19,000–21,000 SEK".
 */
export function priceFields(raw: string) {
  const currency = (raw.match(/\b(EUR|SEK|DKK|NOK|GBP|USD|CHF)\b/i)?.[1] ?? "").toUpperCase() ||
    CURRENCY_SYMBOLS[raw.match(/[€£$]/)?.[0] ?? ""];
  if (!currency) return {};
  const numbers = [...raw.matchAll(/\d[\d.,]*\d|\d/g)].map((m) => toNumber(m[0]));
  if (numbers.length === 0 || numbers.some((n) => n === undefined)) return {};
  if (numbers.length === 1) {
    return /\bfrom\b/i.test(raw)
      ? { priceSpecification: { "@type": "PriceSpecification", minPrice: numbers[0], priceCurrency: currency } }
      : { price: numbers[0], priceCurrency: currency };
  }
  const [min, max] = [Math.min(...(numbers as number[])), Math.max(...(numbers as number[]))];
  return { priceSpecification: { "@type": "PriceSpecification", minPrice: min, maxPrice: max, priceCurrency: currency } };
}

interface Options {
  course: CollectionEntry<"training-courses">;
  sessions: CollectionEntry<"training-schedules">[];
  site: URL | undefined;
  locale: Locale;
}

export function buildCourseSchema({ course, sessions, site, locale }: Options) {
  const prefix = locale === "de" ? "/de" : "";
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.data.name,
    description: course.data.summary,
    provider: { "@type": "Organization", name: "Better Change", sameAs: site?.toString() },
    ...(course.data.certification && { educationalCredentialAwarded: course.data.certification }),
    hasCourseInstance: sessions.map((session) => {
      const start = session.data.date;
      const inPerson = session.data.format === "in-person";
      return {
        "@type": "CourseInstance",
        courseMode: COURSE_MODE[session.data.format],
        ...(start && { startDate: start.toISOString().slice(0, 10) }),
        ...(start &&
          inPerson &&
          course.data.durationDays > 1 && {
            endDate: new Date(start.getTime() + (course.data.durationDays - 1) * 86_400_000).toISOString().slice(0, 10),
          }),
        ...(inPerson && { location: placeFor(session.data.location) }),
        offers: {
          "@type": "Offer",
          ...priceFields(session.data.price),
          url: session.data.isExternal
            ? session.data.externalUrl!
            : new URL(`${prefix}/training/register/${session.id}`, site).toString(),
          ...(session.data.status !== "tbc" && {
            availability: session.data.status === "sold-out" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          }),
        },
      };
    }),
  };
}
