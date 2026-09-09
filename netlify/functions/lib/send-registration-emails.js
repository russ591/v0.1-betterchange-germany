// Sends the two registration emails — a confirmation to the person who
// booked, and an internal notification to us — via Gmail SMTP (Google
// Workspace, using an App Password). Deliberately independent of invoice
// generation (see ./lexware-client.js): a missing GMAIL_USER /
// GMAIL_APP_PASSWORD only ever skips these emails, never the Lexware
// invoice, and the caller decides what (if anything) to attach via
// `invoiceResult` rather than this module reaching into Lexware itself.
//
// Requires two environment variables in the Netlify dashboard
// (Site configuration -> Environment variables) before this can actually
// send anything:
//   GMAIL_USER         — the sending mailbox, russ@betterchange-consulting.de
//   GMAIL_APP_PASSWORD — an App Password generated for that mailbox
//                        (Google Account -> Security -> App passwords;
//                        requires 2-Step Verification to be turned on)
//
// Until both are set, this just logs and returns "skipped" results rather
// than sending anything — the registration itself is already safely
// captured by Netlify Forms regardless.
import nodemailer from "nodemailer";
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  buildRegistrationEmailSubject,
  buildOwnerNotificationHtml,
  buildOwnerNotificationText,
  buildOwnerNotificationSubject,
} from "./registration-email.js";
import { buildGoogleCalendarUrl } from "./calendarLink.js";

const FROM_ADDRESS = "Better Change Germany <russ@betterchange-consulting.de>";
const OWNER_ADDRESS = "russ@betterchange-consulting.de";

// `invoiceResult` is whatever generateInvoicePdf() returned (or null) —
// passed straight through as an attachment when present, never re-derived.
export async function sendRegistrationEmails(data, { discountBreakdown, invoiceResult } = {}) {
  const results = { confirmation: "not attempted", ownerNotification: "not attempted" };

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log(
      "submission-created: GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping registration emails."
    );
    results.confirmation = "skipped: email service not configured";
    results.ownerNotification = "skipped: email service not configured";
    return results;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const attachments = invoiceResult
    ? [
        {
          filename: `Invoice - ${invoiceResult.voucherNumber || invoiceResult.invoiceId}.pdf`,
          content: invoiceResult.pdfBuffer,
          contentType: "application/pdf",
        },
      ]
    : [];
  const emailOpts = { invoiceAttached: Boolean(invoiceResult), discountBreakdown };
  const bookerEmailOpts = { ...emailOpts, calendarUrl: buildGoogleCalendarUrl(data) };

  if (data.email) {
    try {
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: data.email,
        replyTo: OWNER_ADDRESS,
        subject: buildRegistrationEmailSubject(data),
        html: buildRegistrationEmailHtml(data, bookerEmailOpts),
        text: buildRegistrationEmailText(data, bookerEmailOpts),
        attachments,
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
      html: buildOwnerNotificationHtml(data, emailOpts),
      text: buildOwnerNotificationText(data, emailOpts),
      attachments,
    });
    results.ownerNotification = "sent";
  } catch (error) {
    console.error("submission-created: owner notification send error", error);
    results.ownerNotification = "failed";
  }

  return results;
}
