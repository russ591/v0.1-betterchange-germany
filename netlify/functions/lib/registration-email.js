// Shared HTML/text builder for the "you're registered" confirmation email.
// Used by netlify/functions/submission-created.js (real send) and by
// scripts/preview-registration-email.mjs (local preview / screenshot, no
// email service required).

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

export function buildAttendeeList(data) {
  const seats = parseInt(data.seats, 10) || 1;
  const attendees = [];

  for (let i = 1; i <= seats; i++) {
    const name = data[`attendee-name-${i}`];
    const email = data[`attendee-email-${i}`];
    if (name || email) attendees.push({ name, email });
  }

  return attendees;
}

// Booker-facing copy in both site languages. German uses "Sie" (approved
// wording in docs/registration-email-de.md); the internal owner/waitlist emails
// further down stay English and don't use this table. Course names stay
// English in both.
const BOOKER_COPY = {
  en: {
    subject: (course) => `You're registered — ${course || "your training course"}`,
    heading: (firstName) => `You're registered, ${firstName || "there"}.`,
    introBefore: "Thanks for booking ",
    introAfter: ". Here's a summary of your registration.",
    courseFallback: "your course",
    summaryTitle: "Registration summary",
    course: "Course",
    session: "Session",
    bookedBy: "Booked by",
    company: "Company",
    address: "Address",
    seats: "Seats",
    price: "Price excl. VAT (MwSt.)",
    discount: "Discount",
    total: "Total excl. VAT (MwSt.)",
    calendar: "Add to Google Calendar",
    attendees: "Attendees",
    next: "What happens next?",
    invoiceAttached: "Your invoice is attached to this email as a PDF.",
    invoiceFollows: "Your invoice will follow separately by email.",
    logistics: "We'll follow up with logistics (joining instructions or venue details) closer to the course date.",
    accessLink: "Your access link will be sent by email as soon as your payment has been received.",
    questions: "Questions in the meantime? Just reply to this email.",
    signoff: "Talk soon,",
    role: "Certified Trainer and Coach",
  },
  de: {
    subject: (course) => `Anmeldung bestätigt: ${course || "Ihr Kurs"}`,
    heading: (firstName) => (firstName ? `Ihre Anmeldung ist bestätigt, ${firstName}.` : "Ihre Anmeldung ist bestätigt."),
    introBefore: "Vielen Dank für Ihre Buchung von ",
    introAfter: ". Hier finden Sie eine Übersicht Ihrer Anmeldung.",
    courseFallback: "Ihrem Kurs",
    summaryTitle: "Übersicht der Anmeldung",
    course: "Kurs",
    session: "Termin",
    bookedBy: "Gebucht von",
    company: "Unternehmen",
    address: "Adresse",
    seats: "Plätze",
    price: "Preis zzgl. MwSt.",
    discount: "Rabatt",
    total: "Gesamt zzgl. MwSt.",
    calendar: "In Google Kalender eintragen",
    attendees: "Teilnehmende",
    next: "Wie geht es weiter?",
    invoiceAttached: "Ihre Rechnung finden Sie als PDF im Anhang dieser E-Mail.",
    invoiceFollows: "Ihre Rechnung erhalten Sie separat per E-Mail.",
    logistics: "Rechtzeitig vor dem Kurstermin senden wir Ihnen alle organisatorischen Details (Einwahldaten bzw. Informationen zum Veranstaltungsort).",
    accessLink: "Ihren Zugangslink erhalten Sie per E-Mail, sobald Ihre Zahlung eingegangen ist.",
    questions: "Haben Sie in der Zwischenzeit Fragen? Antworten Sie einfach auf diese E-Mail.",
    signoff: "Herzliche Grüße",
    role: "Zertifizierter Trainer und Coach",
  },
};

function bookerCopy(locale) {
  return BOOKER_COPY[locale === "de" ? "de" : "en"];
}

// A self-paced booking has no session date (the registration page leaves
// "session-date-iso" empty, which is also why calendarLink.js returns null
// for it). There is no course date to send logistics ahead of: the access
// link goes out once payment has arrived, so the "what happens next" list
// says that instead.
function nextStepLogistics(data, c) {
  return data["session-date-iso"] ? c.logistics : c.accessLink;
}

// Amounts arrive in en-GB form ("€2,190": the hidden total field and
// discount.js's formatEuro both use it). The German email shows the
// site's German convention ("€2.190", see germanizePrice() in
// src/lib/prices.ts) by swapping the separator, same as the site does.
function formatAmount(value, locale) {
  const text = String(value ?? "");
  return locale === "de" ? text.replace(/,/g, ".") : text;
}

export function buildRegistrationEmailSubject(data, locale = "en") {
  return bookerCopy(locale).subject(data.course);
}

export function buildRegistrationEmailHtml(data, { invoiceAttached = false, discountBreakdown = null, calendarUrl = null, locale = "en" } = {}) {
  const c = bookerCopy(locale);
  const attendees = buildAttendeeList(data);
  const firstName = (data.name || "").split(" ")[0];
  const money = (v) => escapeHtml(formatAmount(v, locale));

  const attendeeRows = attendees
    .map(
      (a) =>
        `<tr><td style="padding:4px 0;color:#525252;">${escapeHtml(a.name || "—")}</td><td style="padding:4px 0;color:#525252;">${escapeHtml(a.email || "—")}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f9f8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0a0a0a;padding:28px 32px;">
                <span style="color:#9aff5b;font-weight:700;font-size:15px;letter-spacing:-0.01em;">Better Change Germany</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#0a0a0a;">${c.heading(escapeHtml(firstName))}</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#525252;">
                  ${c.introBefore}<strong style="color:#0a0a0a;">${escapeHtml(data.course || c.courseFallback)}</strong>${c.introAfter}
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;border-radius:12px;padding:20px;margin:0 0 24px;">
                  <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">${c.summaryTitle}</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;width:40%;">${c.course}</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(data.course || "—")}</td></tr>
                  ${data["session-date"] ? `<tr><td style="padding:4px 0;color:#737373;">${c.session}</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data["session-date"])}${data.location ? `. ${escapeHtml(data.location)}` : ""}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">${c.bookedBy}</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.name || "—")} (${escapeHtml(data.email || "—")})</td></tr>
                  ${data.company ? `<tr><td style="padding:4px 0;color:#737373;">${c.company}</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.company)}</td></tr>` : ""}
                  ${data.address ? `<tr><td style="padding:4px 0;color:#737373;vertical-align:top;">${c.address}</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.address)}, ${escapeHtml(data.postcode || "")} ${escapeHtml(data.city || "")}, ${escapeHtml(data.country || "")}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">${c.seats}</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.seats || "1")}</td></tr>
                  ${
                    discountBreakdown
                      ? `<tr><td style="padding:4px 0;color:#737373;">${c.price}</td><td style="padding:4px 0;color:#0a0a0a;">${money(discountBreakdown.price)}</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;">${c.discount}</td><td style="padding:4px 0;color:#0a0a0a;">-${money(discountBreakdown.discount)}</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;">${c.total}</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${money(discountBreakdown.total)}</td></tr>`
                      : data.total
                        ? `<tr><td style="padding:4px 0;color:#737373;">${c.total}</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${money(data.total)}</td></tr>`
                        : ""
                  }
                </table>

                ${
                  calendarUrl
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr><td align="center">
                    <a href="${escapeHtml(calendarUrl)}" style="display:inline-block;border:1.5px solid #0a0a0a;border-radius:999px;padding:10px 22px;font-size:14px;font-weight:600;color:#0a0a0a;text-decoration:none;">${c.calendar}</a>
                  </td></tr>
                </table>`
                    : ""
                }

                ${
                  attendees.length
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr><td colspan="2" style="padding:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">${c.attendees}</td></tr>
                  ${attendeeRows}
                </table>`
                    : ""
                }

                <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">${c.next}</p>
                <ul style="margin:0 0 28px;padding-left:20px;color:#525252;font-size:15px;line-height:1.7;">
                  <li>${invoiceAttached ? c.invoiceAttached : c.invoiceFollows}</li>
                  <li>${nextStepLogistics(data, c)}</li>
                  <li>${c.questions}</li>
                </ul>

                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#525252;">
                  ${c.signoff}
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e4;padding-top:20px;">
                  <tr>
                    <td style="vertical-align:top;font-size:14px;line-height:1.6;color:#525252;">
                      <p style="margin:0;font-weight:700;color:#0a0a0a;">Russell Hill</p>
                      <p style="margin:0;">${c.role}</p>
                      <p style="margin:0 0 8px;color:#a3a3a3;">(FL Guide, AKT, CAL, CEC, CTC)</p>
                      <p style="margin:0;"><a href="mailto:russ@betterchange-consulting.de" style="color:#0a0a0a;text-decoration:none;">russ@betterchange-consulting.de</a></p>
                      <p style="margin:0 0 10px;">+49 151 1564 9226</p>
                      <p style="margin:0;font-weight:700;color:#0a0a0a;">Better Change Germany</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildOwnerNotificationSubject(data) {
  return `New registration: ${data.course || "a training course"} — ${data.name || "unknown"}`;
}

export function buildOwnerNotificationHtml(data, { discountBreakdown = null } = {}) {
  const attendees = buildAttendeeList(data);

  const attendeeRows = attendees
    .map(
      (a) =>
        `<tr><td style="padding:4px 0;color:#525252;">${escapeHtml(a.name || "—")}</td><td style="padding:4px 0;color:#525252;">${escapeHtml(a.email || "—")}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f9f8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0a0a0a;padding:28px 32px;">
                <span style="color:#9aff5b;font-weight:700;font-size:15px;letter-spacing:-0.01em;">Better Change Germany</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.2;color:#0a0a0a;">New registration received</h1>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;border-radius:12px;padding:20px;margin:0 0 24px;">
                  <tr><td style="padding:4px 0;color:#737373;width:40%;">Course</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(data.course || "—")}</td></tr>
                  ${data["session-date"] ? `<tr><td style="padding:4px 0;color:#737373;">Session</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data["session-date"])}${data.location ? `. ${escapeHtml(data.location)}` : ""}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">Booked by</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.name || "—")} (${escapeHtml(data.email || "—")})</td></tr>
                  ${data.company ? `<tr><td style="padding:4px 0;color:#737373;">Company</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.company)}</td></tr>` : ""}
                  ${data["vat-id"] ? `<tr><td style="padding:4px 0;color:#737373;">VAT ID</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data["vat-id"])}</td></tr>` : ""}
                  ${data.address ? `<tr><td style="padding:4px 0;color:#737373;vertical-align:top;">Address</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.address)}, ${escapeHtml(data.postcode || "")} ${escapeHtml(data.city || "")}, ${escapeHtml(data.country || "")}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">Seats</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.seats || "1")}</td></tr>
                  ${
                    discountBreakdown
                      ? `<tr><td style="padding:4px 0;color:#737373;">Price excl. VAT (MwSt.)</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(discountBreakdown.price)}</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;">Discount</td><td style="padding:4px 0;color:#0a0a0a;">-${escapeHtml(discountBreakdown.discount)}</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;">Total excl. VAT (MwSt.)</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(discountBreakdown.total)}</td></tr>`
                      : data.total
                        ? `<tr><td style="padding:4px 0;color:#737373;">Total excl. VAT (MwSt.)</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(data.total)}</td></tr>`
                        : ""
                  }
                  ${data["discount-code"] ? `<tr><td style="padding:4px 0;color:#737373;">Discount code</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data["discount-code"])}</td></tr>` : ""}
                  ${data.notes ? `<tr><td style="padding:4px 0;color:#737373;vertical-align:top;">Notes</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.notes)}</td></tr>` : ""}
                </table>

                ${
                  attendees.length
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                  <tr><td colspan="2" style="padding:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">Attendees</td></tr>
                  ${attendeeRows}
                </table>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildOwnerNotificationText(data, { discountBreakdown = null } = {}) {
  const attendees = buildAttendeeList(data);
  const lines = [
    "New registration received",
    "",
    `Course: ${data.course || "—"}`,
    data["session-date"] ? `Session: ${data["session-date"]}${data.location ? `. ${data.location}` : ""}` : null,
    `Booked by: ${data.name || "—"} (${data.email || "—"})`,
    data.company ? `Company: ${data.company}` : null,
    data["vat-id"] ? `VAT ID: ${data["vat-id"]}` : null,
    data.address ? `Address: ${data.address}, ${data.postcode || ""} ${data.city || ""}, ${data.country || ""}` : null,
    `Seats: ${data.seats || "1"}`,
    ...(discountBreakdown
      ? [
          `Price excl. VAT (MwSt.): ${discountBreakdown.price}`,
          `Discount: -${discountBreakdown.discount}`,
          `Total excl. VAT (MwSt.): ${discountBreakdown.total}`,
        ]
      : data.total
        ? [`Total excl. VAT (MwSt.): ${data.total}`]
        : []),
    data["discount-code"] ? `Discount code: ${data["discount-code"]}` : null,
    data.notes ? `Notes: ${data.notes}` : null,
    "",
    attendees.length ? "Attendees:" : null,
    ...attendees.map((a) => `- ${a.name || "—"} (${a.email || "—"})`),
  ].filter((l) => l !== null);

  return lines.join("\n");
}

// Waitlist submissions are deliberately minimal — one internal email, no
// booker confirmation, no invoice — Russell handles the actual reply
// himself (see waitlist-form handling in submission-created.js).
export function buildWaitlistNotificationSubject(data) {
  return `Waitlist: ${data.name || "someone"} wants ${data.course || "a sold-out course"}`;
}

export function buildWaitlistNotificationHtml(data) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f9f8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0a0a0a;padding:28px 32px;">
                <span style="color:#9aff5b;font-weight:700;font-size:15px;letter-spacing:-0.01em;">Better Change Germany</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.2;color:#0a0a0a;">New waitlist request</h1>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;border-radius:12px;padding:20px;margin:0 0 8px;">
                  <tr><td style="padding:4px 0;color:#737373;width:40%;">Course</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(data.course || "—")}</td></tr>
                  ${data["session-date"] ? `<tr><td style="padding:4px 0;color:#737373;">Session</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data["session-date"])}${data.location ? `. ${escapeHtml(data.location)}` : ""}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">Name</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.name || "—")}</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;">Email</td><td style="padding:4px 0;color:#0a0a0a;"><a href="mailto:${escapeHtml(data.email || "")}" style="color:#0a0a0a;">${escapeHtml(data.email || "—")}</a></td></tr>
                  ${data.notes ? `<tr><td style="padding:4px 0;color:#737373;vertical-align:top;">Notes</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.notes)}</td></tr>` : ""}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildWaitlistNotificationText(data) {
  return [
    "New waitlist request",
    "",
    `Course: ${data.course || "—"}`,
    data["session-date"] ? `Session: ${data["session-date"]}${data.location ? `. ${data.location}` : ""}` : null,
    `Name: ${data.name || "—"}`,
    `Email: ${data.email || "—"}`,
    data.notes ? `Notes: ${data.notes}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function buildRegistrationEmailText(data, { invoiceAttached = false, discountBreakdown = null, calendarUrl = null, locale = "en" } = {}) {
  const c = bookerCopy(locale);
  const attendees = buildAttendeeList(data);
  const firstName = (data.name || "").split(" ")[0];
  const money = (v) => formatAmount(v, locale);
  const lines = [
    c.heading(firstName),
    "",
    `${c.introBefore}${data.course || c.courseFallback}${c.introAfter}`,
    "",
    c.summaryTitle,
    `${c.course}: ${data.course || "—"}`,
    data["session-date"] ? `${c.session}: ${data["session-date"]}${data.location ? `. ${data.location}` : ""}` : null,
    `${c.bookedBy}: ${data.name || "—"} (${data.email || "—"})`,
    data.company ? `${c.company}: ${data.company}` : null,
    data.address ? `${c.address}: ${data.address}, ${data.postcode || ""} ${data.city || ""}, ${data.country || ""}` : null,
    `${c.seats}: ${data.seats || "1"}`,
    ...(discountBreakdown
      ? [
          `${c.price}: ${money(discountBreakdown.price)}`,
          `${c.discount}: -${money(discountBreakdown.discount)}`,
          `${c.total}: ${money(discountBreakdown.total)}`,
        ]
      : data.total
        ? [`${c.total}: ${money(data.total)}`]
        : []),
    "",
    calendarUrl ? `${c.calendar}: ${calendarUrl}` : null,
    calendarUrl ? "" : null,
    attendees.length ? `${c.attendees}:` : null,
    ...attendees.map((a) => `- ${a.name || "—"} (${a.email || "—"})`),
    attendees.length ? "" : null,
    c.next,
    `- ${invoiceAttached ? c.invoiceAttached : c.invoiceFollows}`,
    `- ${nextStepLogistics(data, c)}`,
    `- ${c.questions}`,
    "",
    c.signoff,
    "",
    "Russell Hill",
    c.role,
    "(FL Guide, AKT, CAL, CEC, CTC)",
    "russ@betterchange-consulting.de",
    "+49 151 1564 9226",
  ].filter((l) => l !== null);

  return lines.join("\n");
}
