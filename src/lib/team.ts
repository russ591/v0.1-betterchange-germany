import type { CollectionEntry } from "astro:content";

// The 3 fellows actually based in Germany (even if only partly) always
// lead the homepage's team teaser, in this exact order -- Russ's explicit
// instruction, same reasoning as the trainer display order convention.
const FIXED_IDS = ["russell-hill", "konrad-pogorzala", "javier-perez-fernandez"];

// This is a static build: the rotation only re-evaluates `Date.now()` at
// build time, not per visitor -- so "once a day" here means once per
// nightly rebuild (see netlify/functions/nightly-rebuild.js), not
// literally every page refresh. Same tradeoff already accepted for the
// Insights hub's headline-article rotation, and the reason a client-side
// (JS-driven, genuinely per-refresh) approach was deliberately not used
// here instead.
function rotateWindow<T>(pool: T[], size: number, dayNumber: number): T[] {
  return Array.from({ length: size }, (_, i) => pool[(dayNumber + i) % pool.length]);
}

// Selects the fixed 3 plus a daily-rotating set of 5 more (2 women, 3 men)
// from everyone else with a full profile. Splitting the rotating pool by
// isFemale and rotating each half separately -- rather than rotating one
// combined list and hoping a 5-wide window happens to contain enough
// women -- is what actually guarantees "at least 2 women" every single
// day, not just on average.
export function getHomepageTeam(
  allProfiles: CollectionEntry<"coach-profiles">[]
): CollectionEntry<"coach-profiles">[] {
  const fixed = FIXED_IDS.map((id) => allProfiles.find((p) => p.id === id)!);

  const rotatingPool = allProfiles.filter((p) => p.data.hasFullProfile && !FIXED_IDS.includes(p.id));
  const women = rotatingPool.filter((p) => p.data.isFemale);
  const men = rotatingPool.filter((p) => !p.data.isFemale);

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const rotatingWomen = women.length >= 2 ? rotateWindow(women, 2, dayNumber) : women;
  const rotatingMen = men.length >= 3 ? rotateWindow(men, 3, dayNumber) : men;

  return [...fixed, ...rotatingWomen, ...rotatingMen];
}
