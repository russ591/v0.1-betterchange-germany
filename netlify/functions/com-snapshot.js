// Receives the content snapshot that betterchange-consulting.com pushes
// (docs/com-snapshot-snippet.php) and hands it back to the daily sync
// (scripts/sync-check.mjs). Both directions need the shared secret in the
// X-Sync-Secret header; the secret lives in the COM_SYNC_SECRET environment
// variable on Netlify and is never in the repo.
//
//   POST /.netlify/functions/com-snapshot          store a snapshot; the one
//                                                  it replaces is kept as
//                                                  "previous"
//   GET  /.netlify/functions/com-snapshot          latest snapshot
//   GET  /.netlify/functions/com-snapshot?which=previous
//   GET  /.netlify/functions/com-snapshot?which=meta   just the two headers
//
// Nothing here touches registration, invoicing or email; the snapshot is
// plain JSON in its own Netlify Blobs store.
import { createHash, timingSafeEqual } from "node:crypto";
import { getSnapshotStore } from "./lib/com-snapshot-store.js";

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function presentedSecret(event) {
  const headers = event.headers || {};
  const direct = headers["x-sync-secret"] || headers["X-Sync-Secret"];
  if (direct) return String(direct);
  const auth = headers.authorization || headers.Authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  return m ? m[1] : "";
}

// Constant-time comparison on fixed-length digests, so a wrong secret costs
// the same time whatever its length.
export function secretMatches(given, expected) {
  if (!given || !expected) return false;
  const a = createHash("sha256").update(String(given)).digest();
  const b = createHash("sha256").update(String(expected)).digest();
  return timingSafeEqual(a, b);
}

function summarise(snapshot) {
  return {
    generatedAt: snapshot.generatedAt || null,
    receivedAt: snapshot.receivedAt || null,
    trigger: snapshot.trigger || null,
    posts: Array.isArray(snapshot.posts) ? snapshot.posts.length : 0,
    events: Array.isArray(snapshot.events) ? snapshot.events.length : 0,
    extraTypes: snapshot.extraTypes ? Object.keys(snapshot.extraTypes) : [],
  };
}

// Exported so it can be exercised with an in-memory store; the Netlify
// handler below wires in the real one.
export async function handleRequest(event, store, expectedSecret) {
  if (!secretMatches(presentedSecret(event), expectedSecret)) {
    return json(401, { error: "unauthorised" });
  }

  if (event.httpMethod === "POST") {
    let snapshot;
    try {
      const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || "";
      snapshot = JSON.parse(raw);
    } catch {
      return json(400, { error: "body is not valid JSON" });
    }
    if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.posts) || !Array.isArray(snapshot.events) || typeof snapshot.generatedAt !== "string") {
      return json(400, { error: "snapshot must be an object with generatedAt, posts[] and events[]" });
    }
    const receivedAt = new Date().toISOString();
    const stored = { ...snapshot, receivedAt };
    const current = await store.get("latest", { type: "json" });
    if (current) await store.setJSON("previous", current);
    await store.setJSON("latest", stored);
    return json(200, { stored: true, ...summarise(stored) });
  }

  if (event.httpMethod === "GET") {
    const which = (event.queryStringParameters || {}).which || "latest";
    if (which === "meta") {
      const [latest, previous] = await Promise.all([store.get("latest", { type: "json" }), store.get("previous", { type: "json" })]);
      return json(200, { latest: latest ? summarise(latest) : null, previous: previous ? summarise(previous) : null });
    }
    if (which !== "latest" && which !== "previous") return json(400, { error: "which must be latest, previous or meta" });
    const data = await store.get(which, { type: "json" });
    if (!data) return json(404, { error: `no ${which} snapshot stored yet` });
    return json(200, data);
  }

  return { statusCode: 405, headers: { Allow: "GET, POST" }, body: "Method not allowed" };
}

export const handler = async (event) => {
  const expected = process.env.COM_SYNC_SECRET;
  if (!expected) {
    console.error("com-snapshot: COM_SYNC_SECRET is not set; refusing every request.");
    return json(503, { error: "snapshot endpoint not configured" });
  }
  try {
    return await handleRequest(event, getSnapshotStore(), expected);
  } catch (error) {
    console.error("com-snapshot: error", error);
    return json(500, { error: "internal error" });
  }
};
