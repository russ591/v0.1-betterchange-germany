// Some older articles never got a real coach-profile author -- their
// authorName is the literal placeholder "Better Change Fellow" rather
// than a person's name. That string (and, for the same reason, a plain
// authorName that happens to match a real Fellow's name rather than
// linking to their profile) counts as Fellow-authored for the Insights
// hub's sort/hero rules, exactly like a linked profile with
// isFellow: true.
export const FELLOW_PLACEHOLDER_NAME = "Better Change Fellow";

export function isFellowAuthored(
  profileIsFellow: boolean | undefined,
  authorName: string | undefined,
  fellowNames: Set<string>
): boolean {
  if (profileIsFellow) return true;
  if (!authorName) return false;
  return authorName === FELLOW_PLACEHOLDER_NAME || fellowNames.has(authorName);
}

// For a multi-part series like "Agile Mishaps", "related reading" should
// only ever surface other chapters of the same series -- not the usual
// same-category picks, which would otherwise mix in unrelated articles
// (the 7 chapters here don't even share one primaryCategory). Only 3 cards
// fit the section, so pick the 3 nearest by seriesOrder: this guarantees
// the immediately-previous and immediately-next chapter are always
// included (the two a reader most wants), rather than e.g. always showing
// chapters 1-3 regardless of which chapter is currently open.
export function relatedSeriesEntries<
  T extends { id: string; data: { seriesId?: string; seriesOrder?: number } },
>(article: T, candidates: T[], limit = 3): T[] {
  const { seriesId, seriesOrder } = article.data;
  if (!seriesId || seriesOrder === undefined) return [];
  return candidates
    .filter((c) => c.id !== article.id && c.data.seriesId === seriesId && c.data.seriesOrder !== undefined)
    .sort((a, b) => {
      const distanceA = Math.abs(a.data.seriesOrder! - seriesOrder);
      const distanceB = Math.abs(b.data.seriesOrder! - seriesOrder);
      return distanceA - distanceB || a.data.seriesOrder! - b.data.seriesOrder!;
    })
    .slice(0, limit);
}
