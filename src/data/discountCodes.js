// Discount codes available on the registration form. Shared by the
// registration page's live price preview (client-side) and the
// server-side invoice/email logic (netlify/functions/lib/discount.js) —
// edit only here to add or remove a code and both sides pick it up.
// Each code maps to the percentage taken off the course price. Matching
// is case-insensitive against whatever the registrant types.
//
// Plain .js (not .ts, unlike its neighbours in this folder) so it can be
// imported as-is from the Netlify Function side without depending on that
// bundler's TypeScript handling.
export const DISCOUNT_CODES = {
  RUSS101: 100,
  RUSS51: 50,
};
