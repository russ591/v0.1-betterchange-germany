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
