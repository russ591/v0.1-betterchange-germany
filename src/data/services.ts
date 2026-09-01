// Shared verbatim copy (spec §6) used on both the Home and Services pages,
// defined once so the two pages can't drift apart. `blurb` is a compressed
// one-line summary of the same approved `items` list, for the homepage's
// compact icon-card teaser -- not new marketing copy, just a shorter format
// of what's already in `items`. `icon` is shared with the Services page so
// both use the same icon language.
export const serviceIcons: Record<string, string> = {
  Training:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><path d="M2 8l10-4 10 4-10 4-10-4Z"/><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5"/></svg>',
  Coaching:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><circle cx="8.5" cy="10" r="4"/><path d="M14 14.5c2.8.4 5 2.1 5 4.5"/><path d="M3.5 19c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg>',
  "Consulting & Transformation":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><path d="M4 12a8 8 0 0 1 14-5"/><path d="M18 4v4h-4"/><path d="M20 12a8 8 0 0 1-14 5"/><path d="M6 20v-4h4"/></svg>',
  Facilitation:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.8" class="h-5 w-5"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="15" width="7" height="5" rx="1"/><rect x="14" y="15" width="7" height="5" rx="1"/></svg>',
};

export const services = [
  {
    name: "Training",
    blurb: "Kanban, Flight Levels and Scrum courses — in-person in Berlin, live online, or self-paced.",
    items: ["Kanban KMP1 · KMP2", "Flight Levels FL2D · FL3D · FLSA", "ICP-ACC", "In-house delivery"],
  },
  {
    name: "Coaching",
    blurb: "Team coaching, leadership coaching and Scrum Master mentoring, for long-term engagements.",
    items: ["Team coaching", "Leadership coaching", "Scrum Master mentoring", "Long-term engagements"],
  },
  {
    name: "Consulting & Transformation",
    blurb: "Flight Levels design, portfolio management and strategy activation across the organisation.",
    items: ["Flight Levels design", "Portfolio management", "Strategy activation", "Enterprise transformation"],
  },
  {
    name: "Facilitation",
    blurb: "Retrospectives, design sprints and user story mapping, run by expert facilitators.",
    items: ["Retrospectives", "Design sprints", "User story mapping", "Leadership workshops"],
  },
];
