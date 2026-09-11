// Session `notes` text (training-schedules content) is free-text English --
// it isn't a locale-split collection, so the stored data must stay
// English. Two recurring templates are covered by the reviewed
// translation draft (betterchange-de-translation-draft-register-pages.md):
// the substituted-course-code self-paced blurb, and FLIN's own differently-
// worded self-paced note -- anything else falls through unchanged rather
// than guessing at a translation.
import type { Locale } from "@/lib/i18n";

const SELF_PACED_RE = /^Self-paced online version of (.+)\.$/;
const FLIN_NOTE_EN = "Self-paced online course. Included free when booked alongside FL2D, FL3D or FLSA.";
const FLIN_NOTE_DE = "Selbstlernkurs (online). Kostenlos inklusive bei gleichzeitiger Buchung von FL2D, FL3D oder FLSA.";

export function translateNotes(notes: string, locale: Locale): string {
  if (locale !== "de") return notes;
  if (notes === FLIN_NOTE_EN) return FLIN_NOTE_DE;
  const match = notes.match(SELF_PACED_RE);
  if (match) return `Online-Selbstlernversion von ${match[1]}.`;
  return notes;
}
