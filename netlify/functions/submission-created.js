// Netlify's "submission-created" magic filename: this runs automatically
// after every Netlify Forms submission on the site. It orchestrates two
// side effects of a registration that are deliberately independent of
// each other — neither one gates or blocks the other, and either can be
// unconfigured or fail without affecting the other:
//   1. Generate an invoice via Lexware Office — ./lib/lexware-client.js,
//      gated only on LEXWARE_API_KEY / LEXWARE_TEST_MODE.
//   2. Email a booker confirmation + internal notification via Gmail
//      SMTP — ./lib/send-registration-emails.js, gated only on
//      GMAIL_USER / GMAIL_APP_PASSWORD.
// The registration itself is already safely captured by Netlify Forms
// regardless of what happens here.
import { generateInvoicePdf } from "./lib/lexware-client.js";
import { resolveDiscount, computeDiscountBreakdown, parseDiscountField } from "./lib/discount.js";
import { incrementUsage } from "./lib/discount-store.js";
import { sendRegistrationEmails, sendWaitlistNotification } from "./lib/send-registration-emails.js";

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body);

  if (payload.form_name === "waitlist") {
    const waitlist = await sendWaitlistNotification(payload.data);
    return { statusCode: 200, body: JSON.stringify({ waitlist }) };
  }

  if (payload.form_name !== "registration") {
    return { statusCode: 200, body: "ignored: not a registration submission" };
  }

  const data = payload.data;

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

  // A trailing "**" on the discount-code field (with or without a real code
  // before it) forces just this submission's invoice into Lexware TEST_MODE
  // — see discount.js's parseDiscountField and lexware-client.js's
  // isTestMode(). Checked independently of `discount` since a bare "**"
  // (no code) still needs to force test mode.
  const { forceTestMode } = parseDiscountField(data["discount-code"]);
  const invoiceResult = await generateInvoicePdf(data, discount, forceTestMode);
  const invoiceStatus = invoiceResult
    ? `generated (${invoiceResult.testMode ? "draft, TEST_MODE" : "finalized"}, id ${invoiceResult.invoiceId})`
    : "skipped or failed — see earlier log lines";

  const emailResults = await sendRegistrationEmails(data, { discountBreakdown, invoiceResult });

  return { statusCode: 200, body: JSON.stringify({ invoice: invoiceStatus, ...emailResults }) };
};
