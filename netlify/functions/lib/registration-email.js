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

export function buildRegistrationEmailSubject(data) {
  return `You're registered — ${data.course || "your training course"}`;
}

export function buildRegistrationEmailHtml(data, { invoiceAttached = false, discountBreakdown = null, calendarUrl = null } = {}) {
  const attendees = buildAttendeeList(data);
  const firstName = (data.name || "").split(" ")[0] || "there";

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
                <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#0a0a0a;">You're registered, ${escapeHtml(firstName)}.</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#525252;">
                  Thanks for booking <strong style="color:#0a0a0a;">${escapeHtml(data.course || "your course")}</strong>. Here's a summary of your registration.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f4;border-radius:12px;padding:20px;margin:0 0 24px;">
                  <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">Registration summary</td></tr>
                  <tr><td style="padding:4px 0;color:#737373;width:40%;">Course</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(data.course || "—")}</td></tr>
                  ${data["session-date"] ? `<tr><td style="padding:4px 0;color:#737373;">Session</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data["session-date"])}${data.location ? `. ${escapeHtml(data.location)}` : ""}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">Booked by</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.name || "—")} (${escapeHtml(data.email || "—")})</td></tr>
                  ${data.company ? `<tr><td style="padding:4px 0;color:#737373;">Company</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.company)}</td></tr>` : ""}
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
                </table>

                ${
                  calendarUrl
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr><td align="center">
                    <a href="${escapeHtml(calendarUrl)}" style="display:inline-block;border:1.5px solid #0a0a0a;border-radius:999px;padding:10px 22px;font-size:14px;font-weight:600;color:#0a0a0a;text-decoration:none;">Add to Google Calendar</a>
                  </td></tr>
                </table>`
                    : ""
                }

                ${
                  attendees.length
                    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr><td colspan="2" style="padding:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">Attendees</td></tr>
                  ${attendeeRows}
                </table>`
                    : ""
                }

                <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#737373;">What happens next?</p>
                <ul style="margin:0 0 28px;padding-left:20px;color:#525252;font-size:15px;line-height:1.7;">
                  <li>${invoiceAttached ? "Your invoice is attached to this email as a PDF." : "Your invoice will follow separately by email."}</li>
                  <li>We'll follow up with logistics (joining instructions or venue details) closer to the course date.</li>
                  <li>Questions in the meantime? Just reply to this email.</li>
                </ul>

                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#525252;">
                  Talk soon,
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e4;padding-top:20px;">
                  <tr>
                    <td style="vertical-align:top;font-size:14px;line-height:1.6;color:#525252;">
                      <p style="margin:0;font-weight:700;color:#0a0a0a;">Russell Hill</p>
                      <p style="margin:0;">Certified Trainer and Coach</p>
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

export function buildRegistrationEmailText(data, { invoiceAttached = false, discountBreakdown = null, calendarUrl = null } = {}) {
  const attendees = buildAttendeeList(data);
  const firstName = (data.name || "").split(" ")[0] || "there";
  const lines = [
    `You're registered, ${firstName}.`,
    "",
    `Thanks for booking ${data.course || "your course"}. Here's a summary of your registration.`,
    "",
    "Registration summary",
    `Course: ${data.course || "—"}`,
    data["session-date"] ? `Session: ${data["session-date"]}${data.location ? `. ${data.location}` : ""}` : null,
    `Booked by: ${data.name || "—"} (${data.email || "—"})`,
    data.company ? `Company: ${data.company}` : null,
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
    "",
    calendarUrl ? `Add to Google Calendar: ${calendarUrl}` : null,
    calendarUrl ? "" : null,
    attendees.length ? "Attendees:" : null,
    ...attendees.map((a) => `- ${a.name || "—"} (${a.email || "—"})`),
    attendees.length ? "" : null,
    "What happens next?",
    invoiceAttached ? "- Your invoice is attached to this email as a PDF." : "- Your invoice will follow separately by email.",
    "- We'll follow up with logistics (joining instructions or venue details) closer to the course date.",
    "- Questions in the meantime? Just reply to this email.",
    "",
    "Talk soon,",
    "",
    "Russell Hill",
    "Certified Trainer and Coach",
    "(FL Guide, AKT, CAL, CEC, CTC)",
    "russ@betterchange-consulting.de",
    "+49 151 1564 9226",
  ].filter((l) => l !== null);

  return lines.join("\n");
}
