// Shared HTML/text builder for the "you're registered" confirmation email.
// Used by netlify/functions/submission-created.js (real send) and by
// scripts/preview-registration-email.mjs (local preview / screenshot, no
// email service required).

// Embedded inline so the signature logo doesn't depend on an external
// domain being live (data URIs travel with the email itself).
const EMAIL_LOGO_DATA_URI = "data:image/png;base64,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";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

export function buildAttendeeList(data) {
  const seats = parseInt(data.seats, 10) || 1;
  const attendees = [];

  if (seats === 1) {
    if (data["different-attendee"] && data["attendee-name-1"]) {
      attendees.push({ name: data["attendee-name-1"], email: data["attendee-email-1"] });
    } else {
      attendees.push({ name: data.name, email: data.email });
    }
  } else {
    for (let i = 1; i <= seats; i++) {
      const name = data[`attendee-name-${i}`];
      const email = data[`attendee-email-${i}`];
      if (name || email) attendees.push({ name, email });
    }
  }

  return attendees;
}

export function buildRegistrationEmailSubject(data) {
  return `You're registered — ${data.course || "your training course"}`;
}

export function buildRegistrationEmailHtml(data) {
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
                  <tr><td style="padding:4px 0;color:#737373;">Booked by</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.name || "—")} (${escapeHtml(data.email || "—")})</td></tr>
                  ${data.company ? `<tr><td style="padding:4px 0;color:#737373;">Company</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.company)}</td></tr>` : ""}
                  ${data.address ? `<tr><td style="padding:4px 0;color:#737373;vertical-align:top;">Address</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.address)}, ${escapeHtml(data.postcode || "")} ${escapeHtml(data.state || "")}, ${escapeHtml(data.country || "")}</td></tr>` : ""}
                  <tr><td style="padding:4px 0;color:#737373;">Seats</td><td style="padding:4px 0;color:#0a0a0a;">${escapeHtml(data.seats || "1")}</td></tr>
                  ${data.total ? `<tr><td style="padding:4px 0;color:#737373;">Total excl. VAT (MwSt.)</td><td style="padding:4px 0;color:#0a0a0a;font-weight:600;">${escapeHtml(data.total)}</td></tr>` : ""}
                </table>

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
                  <li>We'll follow up with logistics — joining instructions or venue details — closer to the course date.</li>
                  <li>Your invoice will follow separately by email, within 2 business days.</li>
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
                      <img src="${EMAIL_LOGO_DATA_URI}" width="150" height="22" alt="Better Change" style="display:block;" />
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

export function buildRegistrationEmailText(data) {
  const attendees = buildAttendeeList(data);
  const firstName = (data.name || "").split(" ")[0] || "there";
  const lines = [
    `You're registered, ${firstName}.`,
    "",
    `Thanks for booking ${data.course || "your course"}. Here's a summary of your registration.`,
    "",
    "Registration summary",
    `Course: ${data.course || "—"}`,
    `Booked by: ${data.name || "—"} (${data.email || "—"})`,
    data.company ? `Company: ${data.company}` : null,
    data.address ? `Address: ${data.address}, ${data.postcode || ""} ${data.state || ""}, ${data.country || ""}` : null,
    `Seats: ${data.seats || "1"}`,
    data.total ? `Total excl. VAT (MwSt.): ${data.total}` : null,
    "",
    attendees.length ? "Attendees:" : null,
    ...attendees.map((a) => `- ${a.name || "—"} (${a.email || "—"})`),
    attendees.length ? "" : null,
    "What happens next?",
    "- We'll follow up with logistics — joining instructions or venue details — closer to the course date.",
    "- Your invoice will follow separately by email, within 2 business days.",
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
