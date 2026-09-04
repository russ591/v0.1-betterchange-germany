// Netlify's "submission-created" magic filename: this runs automatically
// after every Netlify Forms submission on the site. We use it to send a
// confirmation email to the person who booked a training course.
//
// Requires two environment variables to be set in the Netlify dashboard
// (Site configuration -> Environment variables) before this can actually
// send anything:
//   RESEND_API_KEY   — API key from a Resend account (resend.com)
//   REGISTRATION_FROM_EMAIL — a "from" address on a domain verified in Resend,
//                             e.g. "Better Change Germany <russ@betterchange-consulting.de>"
//
// Until those are set, submissions still work exactly as before (captured by
// Netlify Forms, notification email to the site owner) — this function just
// logs and exits quietly rather than sending a booker confirmation.
import { buildRegistrationEmailHtml, buildRegistrationEmailText, buildRegistrationEmailSubject } from "./lib/registration-email.js";

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body);

  if (payload.form_name !== "registration") {
    return { statusCode: 200, body: "ignored: not a registration submission" };
  }

  const data = payload.data;

  if (!data.email) {
    return { statusCode: 200, body: "ignored: no booker email present" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.REGISTRATION_FROM_EMAIL;

  if (!apiKey || !fromAddress) {
    console.log(
      "submission-created: RESEND_API_KEY or REGISTRATION_FROM_EMAIL not set — skipping booker confirmation email."
    );
    return { statusCode: 200, body: "skipped: email service not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: data.email,
      reply_to: "russ@betterchange-consulting.de",
      subject: buildRegistrationEmailSubject(data),
      html: buildRegistrationEmailHtml(data),
      text: buildRegistrationEmailText(data),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("submission-created: Resend API error", response.status, errorBody);
    return { statusCode: 200, body: "email send failed, see function logs" };
  }

  return { statusCode: 200, body: "confirmation email sent" };
};
