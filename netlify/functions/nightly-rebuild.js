// This is a static Astro site (see CLAUDE.md): "upcoming course" filters
// (src/lib/dates.ts) only re-evaluate `new Date()` at build time, not on
// every visit. Without a rebuild, a session that's crossed its listing
// cutoff keeps showing as available on the live site indefinitely, no
// matter how correct the filter logic is -- this scheduled function
// triggers a fresh build once a day so that cutoff actually takes effect.
//
// The schedule itself is declared in netlify.toml
// ([functions."nightly-rebuild"].schedule), not here.
//
// Requires a NETLIFY_BUILD_HOOK_URL environment variable, set in this
// site's own settings (Site configuration -> Environment variables) to a
// Build Hook URL created under Site configuration -> Build & deploy ->
// Build hooks. Nothing here can create that hook itself -- it has to be
// set up once, manually, in the Netlify dashboard.
export const handler = async () => {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hookUrl) {
    console.error("NETLIFY_BUILD_HOOK_URL is not set -- see this function's own comments for setup.");
    return { statusCode: 500, body: "NETLIFY_BUILD_HOOK_URL is not set" };
  }

  const response = await fetch(hookUrl, { method: "POST" });
  if (!response.ok) {
    console.error(`Build hook request failed: ${response.status} ${response.statusText}`);
    return { statusCode: 502, body: "Build hook request failed" };
  }

  return { statusCode: 200, body: "Rebuild triggered" };
};
