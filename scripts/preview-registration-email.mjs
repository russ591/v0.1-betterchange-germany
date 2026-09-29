// Local-only preview: renders the booker confirmation email in both
// languages and both variants (with/without a discount) to standalone
// HTML and plain-text files, plus the owner notification, so they can be
// read or screenshotted without an email service. Not part of the build.
//
// Usage: node scripts/preview-registration-email.mjs <output-dir>
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  buildRegistrationEmailSubject,
  buildOwnerNotificationHtml,
  buildOwnerNotificationText,
} from "../netlify/functions/lib/registration-email.js";
import { buildGoogleCalendarUrl } from "../netlify/functions/lib/calendarLink.js";

const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: node scripts/preview-registration-email.mjs <output-dir>");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

// Mirrors what the registration form submits. The hidden "total" field
// is always en-GB formatted; "session-date" is already in the page's
// language.
const base = {
  course: "Flight Level 2 Design (FL2D)",
  name: "Anna Weber",
  email: "anna.weber@example-corp.de",
  company: "Example Corp GmbH",
  address: "Musterstraße 12",
  postcode: "10115",
  city: "Berlin",
  country: "Germany",
  location: "Berlin, Germany",
  seats: "2",
  total: "€4,380",
  "session-date-iso": "2026-11-24T08:00:00Z",
  "session-end-date-iso": "2026-11-26T08:00:00Z",
  "attendee-name-1": "Anna Weber",
  "attendee-email-1": "anna.weber@example-corp.de",
  "attendee-name-2": "Jonas Richter",
  "attendee-email-2": "jonas.richter@example-corp.de",
};
const sample = {
  en: { ...base, locale: "en", "session-date": "24-25 November 2026" },
  de: { ...base, locale: "de", "session-date": "24.-25. November 2026" },
};
// What computeDiscountBreakdown() returns for a 20% code on €4,380.
const discountBreakdown = { price: "€4,380", discount: "€876", total: "€3,504" };

for (const locale of ["en", "de"]) {
  const data = sample[locale];
  const calendarUrl = buildGoogleCalendarUrl(data, locale);
  const variants = {
    standard: { invoiceAttached: true, discountBreakdown: null, calendarUrl, locale },
    discount: { invoiceAttached: false, discountBreakdown, calendarUrl, locale },
  };
  for (const [name, opts] of Object.entries(variants)) {
    const stem = join(outDir, `booker-${locale}-${name}`);
    writeFileSync(`${stem}.html`, buildRegistrationEmailHtml(data, opts));
    writeFileSync(`${stem}.txt`, `Subject: ${buildRegistrationEmailSubject(data, locale)}\n\n${buildRegistrationEmailText(data, opts)}\n`);
  }
}
writeFileSync(join(outDir, "owner-notification.html"), buildOwnerNotificationHtml(sample.de, { discountBreakdown }));
writeFileSync(join(outDir, "owner-notification.txt"), buildOwnerNotificationText(sample.de, { discountBreakdown }));
console.log(`written to ${outDir}`);
