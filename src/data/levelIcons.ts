// Icons and pill colours keyed by course level. A single, small, fixed set
// reused across every course in every category -- scales to any topic
// without needing a bespoke icon authored per course.
export const levelIcons: Record<string, string> = {
  Foundation:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.6" class="h-7 w-7"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="2.4" fill="#0a0a0a" stroke="none"/></svg>',
  Practitioner:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.6" class="h-7 w-7"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  Advanced:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.6" class="h-7 w-7"><path d="M4 19 10 9l4 5 6-9"/><circle cx="4" cy="19" r="1.6" fill="#0a0a0a" stroke="none"/><circle cx="20" cy="5" r="1.6" fill="#0a0a0a" stroke="none"/></svg>',
  Expert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.6" class="h-7 w-7"><circle cx="12" cy="8" r="5"/><path d="M9 12.2 7 21l5-3 5 3-2-8.8"/></svg>',
};

export const levelPillClasses: Record<string, string> = {
  Foundation: "bg-neutral-100 text-neutral-700",
  Practitioner: "bg-blue-100 text-blue-800",
  Advanced: "bg-amber-200 text-amber-900",
  Expert: "bg-ink text-surface",
};
