import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/lib/i18n";

// de-DE's Intl output already renders the day with a trailing period
// ("22. Oktober 2026") -- exactly the standard German date style, no
// manual formatting needed beyond picking the locale.
const formatters: Record<Locale, Record<"long" | "short", Intl.DateTimeFormat>> = {
  en: {
    long: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    short: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  },
  de: {
    long: new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }),
    short: new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric" }),
  },
};

// A single session record only stores a start date, but an in-person
// session is a fixed block of consecutive days -- showing just the first
// day reads as a one-day event. Live-online runs as separate half-days
// spread across weeks, so a computed end date would be wrong there; it
// gets a "Starts .../Beginn: ..." label instead, paired with the course's
// own durationText (e.g. "4 x ½ days") wherever that's already shown.
export function formatSessionDate(
  session: CollectionEntry<"training-schedules">,
  course: CollectionEntry<"training-courses">,
  monthStyle: "long" | "short" = "long",
  locale: Locale = "en"
): string {
  const { date, format } = session.data;
  const formatter = formatters[locale][monthStyle];
  if (!date) return locale === "de" ? "Jederzeit verfügbar" : "Start anytime";

  if (format === "in-person" && course.data.durationDays > 1) {
    const end = new Date(date.getTime() + (course.data.durationDays - 1) * 86_400_000);
    // Intl's own formatRange() renders an en-dash ("17 – 18 November
    // 2026"); build the plain-hyphen form by hand instead.
    const sameMonthAndYear = date.getMonth() === end.getMonth() && date.getFullYear() === end.getFullYear();
    if (sameMonthAndYear) {
      // A day-only Intl format doesn't add German's trailing period on its
      // own (unlike the full "long"/"short" formats above), so add it here.
      const dayOnly = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", { day: "numeric" }).format(date);
      const dayLabel = locale === "de" ? `${dayOnly}.` : dayOnly;
      return `${dayLabel}-${formatter.format(end)}`;
    }
    return `${formatter.format(date)} - ${formatter.format(end)}`;
  }

  if (format === "live-online") {
    return locale === "de" ? `Beginn: ${formatter.format(date)}` : `Starts ${formatter.format(date)}`;
  }

  return formatter.format(date);
}

// A session stays listed through its own start day and drops off the day
// after -- comparing against the exact stored start instant (e.g. the
// 08:00 UTC every session date carries) would remove it from listings
// while the course is still running that same day, which reads as
// premature. Self-paced sessions have no date and are always available.
//
// This is a static build: the comparison only re-runs when the site is
// actually rebuilt (see .github/workflows/nightly-rebuild.yml), not
// continuously -- a session that's crossed this cutoff will keep showing
// as available on the live site until the next build picks it up.
// Deliberately takes only the session -- every call site passes these
// functions directly as an Array.prototype.filter callback, which also
// hands the callback an index and the array; a second `now` parameter
// here would silently collide with that index instead of ever being the
// Date it looks like.
function isPastListingCutoff(session: CollectionEntry<"training-schedules">): boolean {
  if (!session.data.date) return false;
  const cutoff = new Date(session.data.date);
  cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  cutoff.setUTCHours(0, 0, 0, 0);
  return new Date() >= cutoff;
}

// For a "full schedule" or a single course's own session list, where
// self-paced ("start anytime") is a genuine option alongside dated ones.
export function isUpcomingOrSelfPaced(session: CollectionEntry<"training-schedules">): boolean {
  return !isPastListingCutoff(session);
}

// For surfaces that highlight a specific upcoming calendar date (the
// homepage teaser, a category's "next dates") -- a dateless self-paced
// session has nothing to highlight there, so it's excluded rather than
// always shown.
export function isUpcomingDatedSession(session: CollectionEntry<"training-schedules">): boolean {
  return Boolean(session.data.date) && !isPastListingCutoff(session);
}
