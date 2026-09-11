// Codes live in Netlify Blobs (see discount-store.js), managed from the
// /admin dashboard — this just resolves whatever code the registrant typed
// against that store at submission time.
import { getDiscountForCode } from "./discount-store.js";

function parseAmount(value) {
  const n = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// A discount-code field ending in "**" is a hidden escape hatch for running
// a real end-to-end registration in production without leaving a real
// Lexware invoice behind: it forces just this submission into TEST_MODE
// (draft, no PDF, "TEST —" prefix — see lexware-client.js's isTestMode()),
// regardless of the LEXWARE_TEST_MODE env var. The marker is stripped
// before whatever's left is treated as a normal code, so "SAVE20**" still
// applies the SAVE20 discount as usual, and a bare "**" (nothing before
// it) forces test mode with no discount at all. Shared by the live-preview
// check (check-discount-code.js), this module's own resolveDiscount below,
// and submission-created.js (which needs the flag even when there's no
// code to resolve).
const TEST_MODE_MARKER = "**";

export function parseDiscountField(rawValue) {
  const trimmed = String(rawValue ?? "").trim();
  const forceTestMode = trimmed.endsWith(TEST_MODE_MARKER);
  const code = forceTestMode ? trimmed.slice(0, -TEST_MODE_MARKER.length).trim() : trimmed;
  return { code, forceTestMode };
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
  const { code: strippedCode } = parseDiscountField(data["discount-code"]);
  const enteredCode = strippedCode.toUpperCase();
  if (!enteredCode) return null;

  const discount = await getDiscountForCode(enteredCode);
  if (!discount) return null;

  const orderTotal = parseAmount(data.total);
  const amount =
    discount.discountType === "fixed"
      ? Math.min(discount.discountValue, orderTotal)
      : orderTotal * (discount.discountValue / 100);
  // Lexware's discountPercentage field rejects more than 2 decimal places
  // ("406: numerischer Wert außerhalb des gültigen Bereichs") — a fixed-euro
  // code converted against a non-round order total (e.g. €84 off €2,190)
  // otherwise produces a long repeating decimal that a plain percentage
  // code's already-round value never hits, which is why this only ever
  // surfaced on fixed-amount codes.
  const rawPercentage = orderTotal > 0 ? Math.min(100, (amount / orderTotal) * 100) : 0;
  const percentageForLexware = Math.round(rawPercentage * 100) / 100;

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
