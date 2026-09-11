// Session `notes` text (training-schedules content) is free-text English --
// it isn't a locale-split collection, so the stored data must stay
// English. The only recurring template covered by a reviewed translation
// draft (betterchange-de-translation-draft-register-pages.md) is the
// self-paced course blurb, which substitutes the course code -- this
// pattern-matches that one template and leaves anything else (including
// FLIN's differently-worded self-paced note, "Self-paced online course.
// Included free when booked alongside FL2D, FL3D or FLSA.") as-is in
// English rather than guessing at a translation.
import type { Locale } from "@/lib/i18n";

const SELF_PACED_RE = /^Self-paced online version of (.+)\.$/;

export function translateNotes(notes: string, locale: Locale): string {
  if (locale !== "de") return notes;
  const match = notes.match(SELF_PACED_RE);
  if (match) return `Online-Selbstlernversion von ${match[1]}.`;
  return notes;
}
