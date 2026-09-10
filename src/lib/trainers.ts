import { getEntry, type CollectionEntry } from "astro:content";

export type TrainerEntry =
  | { kind: "profile"; profile: CollectionEntry<"coach-profiles"> }
  | { kind: "name"; name: string };

// Every trainer referenced by at least one of the given sessions, deduped
// by profile id -- not every trainer who's *ever* taught the course, since
// a schedule entry is the only place this data lives. `trainerName` (a
// trainer with no migrated profile at all) is a rare fallback that isn't
// used by any session today, but is still surfaced as a plain, unlinked
// name rather than silently dropped if one ever shows up.
export async function getTrainersForSessions(
  sessions: CollectionEntry<"training-schedules">[]
): Promise<TrainerEntry[]> {
  const profiles = new Map<string, TrainerEntry>();
  const names = new Map<string, TrainerEntry>();

  for (const session of sessions) {
    const refs = session.data.trainers ?? [];
    for (const ref of refs) {
      if (!profiles.has(ref.id)) {
        profiles.set(ref.id, { kind: "profile", profile: await getEntry(ref) });
      }
    }
    if (refs.length === 0 && session.data.trainerName && !names.has(session.data.trainerName)) {
      names.set(session.data.trainerName, { kind: "name", name: session.data.trainerName });
    }
  }

  return [...profiles.values(), ...names.values()];
}
