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

// Only used the one time the store is empty (first read after this
// migration), so the codes already handed out during earlier testing keep
// working without Russell having to re-enter them in the new admin UI.
const SEED_CODES = { RUSS101: 100, RUSS51: 50 };

function store() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

async function readCodes() {
  const existing = await store().get(CODES_KEY, { type: "json" });
  if (existing) return existing;
  await store().setJSON(CODES_KEY, SEED_CODES);
  return { ...SEED_CODES };
}

export async function listCodes() {
  return readCodes();
}

// Returns the discount percentage for a code, or null if it doesn't exist.
export async function getCodePercentage(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;
  const codes = await readCodes();
  return normalized in codes ? codes[normalized] : null;
}

export async function setCode(code, percentage) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) throw new Error("Code is required");
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw new Error("Percentage must be a number between 1 and 100");
  }
  const codes = await readCodes();
  codes[normalized] = percentage;
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
