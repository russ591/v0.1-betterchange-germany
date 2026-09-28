import { getCollection, type CollectionEntry } from "astro:content";

type Session = CollectionEntry<"training-schedules">;

// The next bookable date of the same course after a given session: the
// earliest dated, available session with a later start. Sold-out rows,
// the course page and the registration page all use it to point people
// at the next date instead of leaving them with only a waitlist. Returns
// undefined when there is no later date, in which case callers show
// nothing extra and the waitlist stands alone.
export async function nextAvailableSession(session: Session): Promise<Session | undefined> {
  const start = session.data.date;
  if (!start) return undefined;
  const all = await getCollection("training-schedules");
  return all
    .filter(
      (s) =>
        s.id !== session.id &&
        s.data.course.id === session.data.course.id &&
        s.data.status === "available" &&
        s.data.date !== undefined &&
        s.data.date > start
    )
    .sort((a, b) => a.data.date!.valueOf() - b.data.date!.valueOf())[0];
}
