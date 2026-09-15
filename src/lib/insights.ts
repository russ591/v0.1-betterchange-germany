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
