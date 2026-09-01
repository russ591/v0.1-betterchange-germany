// Shared verbatim copy (spec §6) used on both the Home and Services pages,
// defined once so the two pages can't drift apart. `blurb` is a compressed
// one-line summary of the same approved `items` list, for the homepage's
// compact icon-card teaser -- not new marketing copy, just a shorter format
// of what's already in `items`.
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
