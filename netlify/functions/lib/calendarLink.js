// Builds a "add to Google Calendar" link for the confirmation email —
// a plain URL with the event pre-filled, so it works with one click and
// needs no attachment or backend call. Google Calendar covers the most
// common case cheaply; other providers (Outlook, Apple Mail via an
// attached .ics file) can be added later if needed.
function toGoogleCalendarDate(isoString) {
  return isoString.slice(0, 10).replace(/-/g, "");
}

// Returns null for self-paced sessions (no session-date-iso at all) or
// any other missing/invalid date — the email simply omits the button.
export function buildGoogleCalendarUrl(data) {
  const startIso = data["session-date-iso"];
  const endIso = data["session-end-date-iso"];
  if (!startIso || !endIso) return null;
  if (Number.isNaN(new Date(startIso).getTime()) || Number.isNaN(new Date(endIso).getTime())) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: data.course || "Training course",
    dates: `${toGoogleCalendarDate(startIso)}/${toGoogleCalendarDate(endIso)}`,
    details: `Your registration for ${data.course || "this course"} with Better Change Germany.`,
    location: data.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
