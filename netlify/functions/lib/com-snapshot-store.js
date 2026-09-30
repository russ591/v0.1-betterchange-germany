// Netlify Blobs store for the .com content snapshot (see ../com-snapshot.js).
// Same credential fallback as discount-store.js: Netlify's ambient Blobs
// context isn't present on this site, so explicit NETLIFY_SITE_ID +
// NETLIFY_BLOBS_TOKEN are used when set.
import { getStore } from "@netlify/blobs";

const STORE_NAME = "com-snapshot";

export function getSnapshotStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}
