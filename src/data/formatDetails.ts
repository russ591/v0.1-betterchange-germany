// Shared, format-level copy for the "How to take this course" and "Which
// format?" sections on every training-course page. Formats work the same
// way regardless of which course they're attached to, so this is written
// once and reused everywhere a course lists that format -- only the
// course-specific copy (summary, whoIsThisFor, whatYoullLearn) lives in the
// content collection.
export type TrainingFormat = "in-person" | "live-online" | "self-paced";

export const formatIcons: Record<TrainingFormat, string> = {
  "in-person":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-3 3-5 6.5-5s6.5 2 6.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15 13.5c2.8.3 5 2 5 4.3"/></svg>',
  "live-online":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><rect x="2" y="6" width="14" height="11" rx="1.5"/><path d="M16 10.5 22 8v9l-6-2.5"/></svg>',
  "self-paced":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
};

interface FormatCopy {
  label: string;
  description: string;
  // Only makes sense when a course offers more than one format -- rendered
  // as a continuation of `description`, omitted entirely on a single-format
  // course page where there's nothing to choose between.
  chooseIf: string;
  included: string[];
}

// `description`/`chooseIf` deliberately fold in "who should choose this" --
// that used to live in a separate "which format?" comparison section, but a
// section built entirely from a per-format sentence didn't hold up as its
// own piece, so the guidance now lives directly on the format it's about.
export const formatDetails: Record<TrainingFormat, FormatCopy> = {
  "in-person": {
    label: "In-Person",
    description: "A full cohort, in one room, hands-on and trainer-led.",
    chooseIf: "Choose this if you want live feedback and the energy of a structured group session.",
    included: ["Certification credential", "All course materials", "Small-group, trainer-led"],
  },
  "live-online": {
    label: "Live Online",
    description: "The same course, delivered live over video calls and a shared virtual whiteboard.",
    chooseIf: "Choose this if you want that same live, trainer-led format without travelling.",
    included: ["Certification credential", "Full digital materials", "Live trainer support"],
  },
  "self-paced": {
    label: "Self-Paced, On Demand",
    description: "Work through the full curriculum on your own schedule, with trainer support on hand.",
    chooseIf: "Choose this if your schedule doesn't allow consecutive days away, or you'd rather take your time.",
    included: ["Certification credential", "Trainer check-ins", "Indefinite access"],
  },
};
