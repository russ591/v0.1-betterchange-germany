// Netlify's "submission-created" magic filename: this runs automatically
// after every Netlify Forms submission on the site. We use it to send two
// emails via Gmail SMTP (Google Workspace, using an App Password): a
// confirmation to the person who booked, and a notification to us — both
// sent directly by this function rather than relying on Netlify's separate
// built-in form-notification setting, so there's a single place (this file
// + two env vars) that controls whether registration email goes out at all.
//
// Requires two environment variables to be set in the Netlify dashboard
// (Site configuration -> Environment variables) before this can actually
// send anything:
//   GMAIL_USER         — the sending mailbox, russ@betterchange-consulting.de
//   GMAIL_APP_PASSWORD — an App Password generated for that mailbox
//                        (Google Account -> Security -> App passwords;
//                        requires 2-Step Verification to be turned on)
//
// Until those are set, submissions still work exactly as before (captured
// by Netlify Forms, visible in the dashboard) — this function just logs and
// exits quietly rather than sending anything.
import nodemailer from "nodemailer";
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  buildRegistrationEmailSubject,
  buildOwnerNotificationHtml,
  buildOwnerNotificationText,
  buildOwnerNotificationSubject,
} from "./lib/registration-email.js";

const FROM_ADDRESS = "Better Change Germany <russ@betterchange-consulting.de>";
const OWNER_ADDRESS = "russ@betterchange-consulting.de";

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body);

  if (payload.form_name !== "registration") {
    return { statusCode: 200, body: "ignored: not a registration submission" };
  }

  const data = payload.data;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log(
      "submission-created: GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping registration emails."
    );
    return { statusCode: 200, body: "skipped: email service not configured" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const results = { confirmation: "not attempted", ownerNotification: "not attempted" };

  if (data.email) {
    try {
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: data.email,
        replyTo: OWNER_ADDRESS,
        subject: buildRegistrationEmailSubject(data),
        html: buildRegistrationEmailHtml(data),
        text: buildRegistrationEmailText(data),
      });
      results.confirmation = "sent";
    } catch (error) {
      console.error("submission-created: booker confirmation send error", error);
      results.confirmation = "failed";
    }
  } else {
    results.confirmation = "skipped: no booker email present";
  }

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: OWNER_ADDRESS,
      replyTo: data.email || undefined,
      subject: buildOwnerNotificationSubject(data),
      html: buildOwnerNotificationHtml(data),
      text: buildOwnerNotificationText(data),
    });
    results.ownerNotification = "sent";
  } catch (error) {
    console.error("submission-created: owner notification send error", error);
    results.ownerNotification = "failed";
  }

  return { statusCode: 200, body: JSON.stringify(results) };
};
