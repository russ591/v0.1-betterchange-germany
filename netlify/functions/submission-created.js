// Netlify's "submission-created" magic filename: this runs automatically
// after every Netlify Forms submission on the site. We use it to:
//   1. Generate an invoice for the course price via Lexware Office
//      (find-or-create the registrant as a contact, create the invoice,
//      render it to PDF) — see ./lib/lexware-client.js for the API details
//      and the LEXWARE_TEST_MODE safeguard.
//   2. Send two emails via Gmail SMTP (Google Workspace, using an App
//      Password): a confirmation to the person who booked, and a
//      notification to us — both sent directly by this function rather
//      than relying on Netlify's separate built-in form-notification
//      setting, with the invoice PDF attached to both when available.
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
// exits quietly rather than sending anything. Invoice generation has its
// own independent env var (LEXWARE_API_KEY) and never blocks either email
// from sending — a Lexware failure just means the email goes out without
// a PDF attached (logged for follow-up).
import nodemailer from "nodemailer";
import {
  buildRegistrationEmailHtml,
  buildRegistrationEmailText,
  buildRegistrationEmailSubject,
  buildOwnerNotificationHtml,
  buildOwnerNotificationText,
  buildOwnerNotificationSubject,
} from "./lib/registration-email.js";
import { generateInvoicePdf } from "./lib/lexware-client.js";
import { resolveDiscount, computeDiscountBreakdown } from "./lib/discount.js";
import { incrementUsage } from "./lib/discount-store.js";
import { buildGoogleCalendarUrl } from "./lib/calendarLink.js";

const FROM_ADDRESS = "Better Change Germany <russ@betterchange-consulting.de>";
const OWNER_ADDRESS = "russ@betterchange-consulting.de";

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body);

  if (payload.form_name !== "registration") {
    return { statusCode: 200, body: "ignored: not a registration submission" };
  }

  const data = payload.data;

  // Keep the emailed summary consistent with the actual invoice — the
  // Lexware line item shows the discount natively. Both copies get the
  // same Price/Discount/Total breakdown (matching the registration
  // page's own preview); the owner's copy separately shows the raw
  // discount-code field value it already displayed before this existed.
  console.log(
    `submission-created: discount-code field received = ${JSON.stringify(data["discount-code"] ?? null)}`
  );
  // Resolved exactly once per submission — both the invoice's line-item
  // discount and the emailed breakdown reuse this same result, rather than
  // each independently re-resolving it (which would otherwise mean a
  // limited-use code's usage count gets incremented twice per booking).
  const discount = await resolveDiscount(data);
  const discountBreakdown = discount ? computeDiscountBreakdown(data.total, discount.amount) : null;
  if (discount) await incrementUsage(discount.code);

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

  const results = { invoice: "not attempted", confirmation: "not attempted", ownerNotification: "not attempted" };

  const invoiceResult = await generateInvoicePdf(data, discount);
  results.invoice = invoiceResult
    ? `generated (${invoiceResult.testMode ? "draft, TEST_MODE" : "finalized"}, id ${invoiceResult.invoiceId})`
    : "skipped or failed — see earlier log lines";

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

  return { statusCode: 200, body: JSON.stringify(results) };
};
