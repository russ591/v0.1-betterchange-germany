// Discount codes available on the registration form. Add new codes here as
// they're needed — each maps to the percentage taken off the invoice total.
// Matching is case-insensitive against whatever the registrant typed into
// the "discount code" field.
const DISCOUNT_CODES = {
  RUSS101: 100,
};

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

export function applyDiscountToTotal(totalStr, percentage) {
  const original = parseAmount(totalStr);
  const discounted = original * (1 - percentage / 100);
  return formatEuro(discounted);
}
