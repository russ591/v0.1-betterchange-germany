// Codes live in Netlify Blobs (see discount-store.js), managed from the
// /admin dashboard — this just resolves whatever code the registrant typed
// against that store at submission time.
import { getDiscountForCode } from "./discount-store.js";

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

// Resolves a code against this specific order's total, converting either
// discount type into a concrete euro amount up front. A fixed-euro code is
// clamped to the order total (can't go below free), and is also converted
// to an equivalent percentage-of-this-order — Lexware's invoice line item
// only has a native percentage discount field, so that's what actually gets
// applied there; computeDiscountBreakdown below uses the euro amount
// directly and never needs to know which discount type produced it.
export async function resolveDiscount(data) {
  const enteredCode = (data["discount-code"] || "").trim().toUpperCase();
  if (!enteredCode) return null;

  const discount = await getDiscountForCode(enteredCode);
  if (!discount) return null;

  const orderTotal = parseAmount(data.total);
  const amount =
    discount.discountType === "fixed"
      ? Math.min(discount.discountValue, orderTotal)
      : orderTotal * (discount.discountValue / 100);
  const percentageForLexware = orderTotal > 0 ? Math.min(100, (amount / orderTotal) * 100) : 0;

  const label =
    discount.discountType === "fixed"
      ? `Discount code ${enteredCode} applied (${formatEuro(discount.discountValue)} off)`
      : `Discount code ${enteredCode} applied (${discount.discountValue}% off)`;

  return { code: enteredCode, amount, percentageForLexware, label };
}

// Structured price/discount/total breakdown for the customer-facing
// confirmation email — mirrors the registration page's own live preview
// (Price / Discount / Total rows), and deliberately doesn't carry the
// discount code itself; that's for the owner's copy only.
export function computeDiscountBreakdown(totalStr, discountAmount) {
  const original = parseAmount(totalStr);
  const total = original - discountAmount;
  return {
    price: formatEuro(original),
    discount: formatEuro(discountAmount),
    total: formatEuro(total),
  };
}
