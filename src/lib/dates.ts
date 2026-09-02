import type { CollectionEntry } from "astro:content";

const formatters = {
  long: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  short: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }),
};

// A single session record only stores a start date, but an in-person
// session is a fixed block of consecutive days -- showing just the first
// day reads as a one-day event. Live-online runs as separate half-days
// spread across weeks, so a computed end date would be wrong there; it
// gets a "Starts ..." label instead, paired with the course's own
// durationText (e.g. "4 x ½ days") wherever that's already shown.
export function formatSessionDate(
  session: CollectionEntry<"training-schedules">,
  course: CollectionEntry<"training-courses">,
  monthStyle: "long" | "short" = "long"
): string {
  const { date, format } = session.data;
  const formatter = formatters[monthStyle];
  if (!date) return "Start anytime";

  if (format === "in-person" && course.data.durationDays > 1) {
    const end = new Date(date.getTime() + (course.data.durationDays - 1) * 86_400_000);
    return formatter.formatRange(date, end);
  }

  if (format === "live-online") {
    return `Starts ${formatter.format(date)}`;
  }

  return formatter.format(date);
}
