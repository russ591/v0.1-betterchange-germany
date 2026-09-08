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

// Each code is stored as:
//   { discountType: "percentage" | "fixed", discountValue: number,
//     createdAt, expiresAt, notes, usageLimit, usageCount, status }
//
// discountValue means 0-100 for "percentage" or a euro amount for "fixed".
// expiresAt is a plain "YYYY-MM-DD" (an HTML date input's native value, no
// time/timezone attached) meaning "valid through this calendar date,
// inclusive" — null means it never expires. usageLimit is null (unlimited),
// 0 (disabled — usageCount, which starts at 0, can never be "less than" 0),
// or a positive integer cap; usageCount only ever increases, via
// incrementUsage(). status is "active" or "inactive" — an admin-only kill
// switch independent of expiry/usage. Older entries are normalized here (in
// memory only) as each of these fields was added: a bare number is a
// pre-expiry/notes percentage-only entry; an object missing discountType/
// discountValue but carrying the old `percentage` field predates the fixed-
// amount option. A null createdAt sorts as "oldest" and just isn't shown a
// creation date; the dashboard uses listCodes(), which returns every code
// regardless of expiry/usage/status so Russell can still see, extend, or
// re-enable one — only the customer-facing path (getDiscountForCode) enforces
// them.
function normalizeEntry(value) {
  if (value && typeof value === "object") {
    const discountType = value.discountType === "fixed" ? "fixed" : "percentage";
    const discountValue = value.discountValue ?? value.percentage ?? 0;
    return {
      discountType,
      discountValue,
      createdAt: value.createdAt ?? null,
      expiresAt: value.expiresAt ?? null,
      notes: value.notes ?? "",
      usageLimit: value.usageLimit ?? null,
      usageCount: value.usageCount ?? 0,
      status: value.status === "inactive" ? "inactive" : "active",
    };
  }
  return {
    discountType: "percentage",
    discountValue: value,
    createdAt: null,
    expiresAt: null,
    notes: "",
    usageLimit: null,
    usageCount: 0,
    status: "active",
  };
}

// Today as "YYYY-MM-DD", matching expiresAt's format — lexicographic
// comparison of that format sorts the same as calendar order.
function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isExpired(entry) {
  return Boolean(entry.expiresAt) && todayDateString() > entry.expiresAt;
}

function isUsageExhausted(entry) {
  return entry.usageLimit !== null && entry.usageCount >= entry.usageLimit;
}

function isUsable(entry) {
  return entry.status === "active" && !isExpired(entry) && !isUsageExhausted(entry);
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
  const base = { createdAt: now, expiresAt: null, notes: "", usageLimit: null, usageCount: 0, status: "active" };
  const seeded = {
    RUSS101: { ...base, discountType: "percentage", discountValue: 100 },
    RUSS51: { ...base, discountType: "percentage", discountValue: 50 },
  };
  await store().setJSON(CODES_KEY, seeded);
  return seeded;
}

export async function listCodes() {
  return readCodes();
}

// Returns { discountType, discountValue } for a code that's actually usable
// right now (exists, active, not expired, under its usage limit), or null —
// used by both the customer-facing live-preview check and the invoicing
// pipeline's resolution at submission time. Deliberately doesn't return the
// admin-only bookkeeping fields (createdAt/notes/usageCount/status).
export async function getDiscountForCode(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;
  const codes = await readCodes();
  const entry = codes[normalized];
  if (!entry || !isUsable(entry)) return null;
  return { discountType: entry.discountType, discountValue: entry.discountValue };
}

// Records that a code was actually applied to a completed registration.
// Called exactly once per submission (from submission-created.js, after a
// successful resolution) — never from the live-preview check, which would
// otherwise burn through a limited code's uses just by being typed in.
export async function incrementUsage(code) {
  const normalized = (code || "").trim().toUpperCase();
  const codes = await readCodes();
  if (!codes[normalized]) return codes;
  codes[normalized] = { ...codes[normalized], usageCount: codes[normalized].usageCount + 1 };
  await store().setJSON(CODES_KEY, codes);
  return codes;
}

export async function setCode(code, { discountType, discountValue, expiresAt = null, notes = "", usageLimit = null, status = "active" } = {}) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) throw new Error("Code is required");

  const type = discountType === "fixed" ? "fixed" : "percentage";
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error(type === "percentage" ? "Percentage must be a number between 1 and 100" : "Amount must be a positive number");
  }
  if (type === "percentage" && discountValue > 100) {
    throw new Error("Percentage must be a number between 1 and 100");
  }
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    throw new Error("Expiry date must be in YYYY-MM-DD format");
  }
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0)) {
    throw new Error("Usage limit must be a non-negative whole number, or left blank for unlimited");
  }
  if (status !== "active" && status !== "inactive") {
    throw new Error('Status must be "active" or "inactive"');
  }

  const codes = await readCodes();
  const existing = codes[normalized];
  // Editing an existing code (same key) keeps its original creation date
  // and accumulated usage count; only a genuinely new key (including a
  // legacy entry with no date yet, or a Duplicate/rename landing on a
  // fresh name) gets stamped "now" and starts its usage count at 0.
  const createdAt = existing?.createdAt || new Date().toISOString();
  const usageCount = existing?.usageCount ?? 0;
  codes[normalized] = {
    discountType: type,
    discountValue,
    createdAt,
    expiresAt: expiresAt || null,
    notes: notes || "",
    usageLimit,
    usageCount,
    status,
  };
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
