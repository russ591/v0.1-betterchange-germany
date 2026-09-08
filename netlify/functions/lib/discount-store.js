// Discount codes used to live as a hardcoded map in src/data/discountCodes.js
// (edited via a code change + deploy). This replaces that with a single JSON
// blob in Netlify Blobs, so the /admin page can add/edit/remove codes without
// touching code.
//
// Netlify Functions are documented to get Blobs access automatically at
// runtime (no siteID/token needed) via an env var Netlify's own runtime
// injects. On this project that ambient context isn't present — confirmed
// in production by @netlify/blobs itself throwing MissingBlobsEnvironmentError
// — so this falls back to explicit credentials (NETLIFY_SITE_ID +
// NETLIFY_BLOBS_TOKEN, a personal access token) when they're set, and only
// relies on the automatic path if they aren't.
import { getStore } from "@netlify/blobs";

const STORE_NAME = "discount-codes";
const CODES_KEY = "codes";

function store() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

// Each code is stored as { percentage, createdAt, expiresAt, notes}.
// expiresAt is a plain "YYYY-MM-DD" (an HTML date input's native value,
// no time/timezone attached) meaning "valid through this calendar date,
// inclusive" — null means it never expires. Older entries written before
// these fields existed are a bare number — normalized here (in memory
// only) to { percentage: <that number>, createdAt: null, expiresAt: null,
// notes: "" } so every caller can rely on the object shape; a null
// createdAt sorts as "oldest" and just isn't shown a creation date.
function normalizeEntry(value) {
  if (value && typeof value === "object") {
    return {
      percentage: value.percentage,
      createdAt: value.createdAt ?? null,
      expiresAt: value.expiresAt ?? null,
      notes: value.notes ?? "",
    };
  }
  return { percentage: value, createdAt: null, expiresAt: null, notes: "" };
}

// Today as "YYYY-MM-DD", matching expiresAt's format — lexicographic
// comparison of that format sorts the same as calendar order.
function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isExpired(entry) {
  return Boolean(entry.expiresAt) && todayDateString() > entry.expiresAt;
}

async function readCodes() {
  const existing = await store().get(CODES_KEY, { type: "json" });
  if (existing) {
    return Object.fromEntries(Object.entries(existing).map(([code, value]) => [code, normalizeEntry(value)]));
  }

  // Only used the one time the store is empty (first read after this
  // migration), so the codes already handed out during earlier testing
  // keep working without Russell having to re-enter them in the admin UI.
  const now = new Date().toISOString();
  const seeded = {
    RUSS101: { percentage: 100, createdAt: now, expiresAt: null, notes: "" },
    RUSS51: { percentage: 50, createdAt: now, expiresAt: null, notes: "" },
  };
  await store().setJSON(CODES_KEY, seeded);
  return seeded;
}

export async function listCodes() {
  return readCodes();
}

// Returns the discount percentage for a code, or null if it doesn't exist
// or has expired — used by the customer-facing check and the invoicing
// pipeline, both of which should treat an expired code as if it were
// never created. The admin dashboard uses listCodes() instead, which
// returns every code regardless of expiry so Russell can still see,
// extend, or delete an expired one.
export async function getCodePercentage(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;
  const codes = await readCodes();
  const entry = codes[normalized];
  if (!entry || isExpired(entry)) return null;
  return entry.percentage;
}

export async function setCode(code, { percentage, expiresAt = null, notes = "" } = {}) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) throw new Error("Code is required");
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw new Error("Percentage must be a number between 1 and 100");
  }
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    throw new Error("Expiry date must be in YYYY-MM-DD format");
  }
  const codes = await readCodes();
  // Editing an existing code (same key) keeps its original creation date;
  // only a genuinely new key (including a legacy entry with no date yet,
  // or a Duplicate/rename landing on a fresh name) gets stamped "now".
  const createdAt = codes[normalized]?.createdAt || new Date().toISOString();
  codes[normalized] = { percentage, createdAt, expiresAt: expiresAt || null, notes: notes || "" };
  await store().setJSON(CODES_KEY, codes);
  return codes;
}

export async function deleteCode(code) {
  const normalized = (code || "").trim().toUpperCase();
  const codes = await readCodes();
  delete codes[normalized];
  await store().setJSON(CODES_KEY, codes);
  return codes;
}
