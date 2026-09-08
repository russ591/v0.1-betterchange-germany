// Public endpoint the registration page's "Apply" button calls. Deliberately
// only ever answers about the one code it was asked about — it never lists
// the full set, so a visitor can't enumerate every discount code Russell has
// handed out by poking this endpoint.
import { getDiscountForCode } from "./lib/discount-store.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let code;
  try {
    ({ code } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const discount = await getDiscountForCode(code);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      discount ? { valid: true, discountType: discount.discountType, value: discount.discountValue } : { valid: false }
    ),
  };
};
