// Netlify's "submission-created" magic filename: this runs automatically
// after every Netlify Forms submission on the site. We use it to send a
// confirmation email to the person who booked a training course, sent via
// Gmail SMTP (Google Workspace) using an App Password.
//
// Requires two environment variables to be set in the Netlify dashboard
// (Site configuration -> Environment variables) before this can actually
// send anything:
//   GMAIL_USER         — the sending mailbox, russ@betterchange-consulting.de
//   GMAIL_APP_PASSWORD — an App Password generated for that mailbox
//                        (Google Account -> Security -> App passwords;
//                        requires 2-Step Verification to be turned on)
//
// Until those are set, submissions still work exactly as before (captured by
// Netlify Forms, notification email to the site owner) — this function just
// logs and exits quietly rather than sending a booker confirmation.
import nodemailer from "nodemailer";
import { buildRegistrationEmailHtml, buildRegistrationEmailText, buildRegistrationEmailSubject } from "./lib/registration-email.js";

const FROM_ADDRESS = "Better Change Germany <russ@betterchange-consulting.de>";

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body);

  if (payload.form_name !== "registration") {
    return { statusCode: 200, body: "ignored: not a registration submission" };
  }

  const data = payload.data;

  if (!data.email) {
    return { statusCode: 200, body: "ignored: no booker email present" };
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log(
      "submission-created: GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping booker confirmation email."
    );
    return { statusCode: 200, body: "skipped: email service not configured" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: data.email,
      replyTo: "russ@betterchange-consulting.de",
      subject: buildRegistrationEmailSubject(data),
      html: buildRegistrationEmailHtml(data),
      text: buildRegistrationEmailText(data),
    });
  } catch (error) {
    console.error("submission-created: Gmail send error", error);
    return { statusCode: 200, body: "email send failed, see function logs" };
  }

  return { statusCode: 200, body: "confirmation email sent" };
};
