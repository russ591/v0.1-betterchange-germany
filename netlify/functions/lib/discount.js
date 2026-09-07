// The code -> percentage-off map lives in src/data/discountCodes.js, shared
// with the registration page's client-side live price preview — add a new
// code there, not here, and both sides pick it up.
import { DISCOUNT_CODES } from "../../../src/data/discountCodes.js";

export function resolveDiscount(data) {
  const enteredCode = (data["discount-code"] || "").trim().toUpperCase();
  if (!enteredCode || !(enteredCode in DISCOUNT_CODES)) return null;

  const percentage = DISCOUNT_CODES[enteredCode];
  return { code: enteredCode, percentage, label: `Discount code ${enteredCode} applied (${percentage}% off)` };
}

function parseAmount(value) {
  const n = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// Mirrors the site's existing price-display format (no decimal places),
// so a discounted total in an email/summary looks consistent with prices
// shown elsewhere on the site.
function formatEuro(amount) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    amount
  );
}

// Structured price/discount/total breakdown for the customer-facing
// confirmation email — mirrors the registration page's own live preview
// (Price / Discount / Total rows), and deliberately doesn't carry the
// discount code itself; that's for the owner's copy only.
export function computeDiscountBreakdown(totalStr, percentage) {
  const original = parseAmount(totalStr);
  const discountAmount = original * (percentage / 100);
  const total = original - discountAmount;
  return {
    price: formatEuro(original),
    discount: formatEuro(discountAmount),
    total: formatEuro(total),
  };
}
