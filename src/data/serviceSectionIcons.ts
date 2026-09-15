// Small icons for the services detail pages' concept-grid / offer-card /
// at-a-glance sections (src/components/Service*.astro). Same hand-drawn,
// stroke-based convention as categoryIcons.ts/levelIcons.ts -- this site
// has no icon library dependency (Tabler/Lucide/Heroicons etc. aren't
// installed), so every icon here is a custom-authored SVG matching that
// existing style (viewBox 0 0 24 24, stroke "#0a0a0a", no fill), not a
// mapping onto a third-party set.
//
// Deliberately no `class` (size) attribute on any <svg> here -- every
// consumer sizes its own icons via a wrapper's `[&_svg]:h-* [&_svg]:w-*`
// selector, and a same-specificity class baked into the icon string here
// would otherwise be an order-dependent tie against that wrapper class.
//
// Four of these (kanban, flight-levels, scrum, coaching) are the exact
// same icons already used for the training categories on /training,
// reused here (via categoryIcons, with their own class stripped for the
// same reason) for Training's offer cards rather than drawing near-duplicates.
import { categoryIcons } from "./categoryIcons";

export const stripSizeClass = (svg: string) => svg.replace(/\s*class="[^"]*"/, "");

export const serviceSectionIcons: Record<string, string> = {
  // Coaching: four stances + team coaching / scrum master mentoring / long-term
  "message-circle":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a8 8 0 1 1 3 6.2L4 20l1.1-4A8 8 0 0 1 4 11Z"/><circle cx="9" cy="11" r="0.6" fill="#0a0a0a" stroke="none"/><circle cx="12" cy="11" r="0.6" fill="#0a0a0a" stroke="none"/><circle cx="15" cy="11" r="0.6" fill="#0a0a0a" stroke="none"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-1.5-1-4-1.5-8-1v13c4-.5 6.5 0 8 1 1.5-1 4-1.5 8-1V5c-4-.5-6.5 0-8 1Z"/><path d="M12 6v13"/></svg>',
  route:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3h-6"/></svg>',
  "clipboard-check":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 13l2 2 4-4"/></svg>',
  users:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.3 20c.3-2.2 1.8-3.8 4-4.3"/></svg>',
  compass:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2Z"/></svg>',
  "user-check":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 12l2 2 3.5-3.5"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',

  // Training: TBR principles
  image:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L4 19"/></svg>',
  footprints:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="8" cy="7" rx="2.2" ry="3"/><ellipse cx="16" cy="15" rx="2.2" ry="3"/><circle cx="8" cy="12.3" r="1" fill="#0a0a0a" stroke="none"/><circle cx="16" cy="20.3" r="1" fill="#0a0a0a" stroke="none"/></svg>',
  pencil:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z"/><path d="M14 7l3 3"/></svg>',
  shuffle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h3.5c2 0 3 1 4.5 3M4 18h3.5c2 0 3-1 4.5-3"/><path d="M17 4l3 2-3 2M17 16l3 2-3 2"/><path d="M14 6h3M14 18h3"/></svg>',

  // Consulting & Transformation
  split:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6"/><path d="M12 9l-6 6M12 9l6 6"/><path d="M6 15v3M18 15v3"/></svg>',
  target:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="#0a0a0a" stroke="none"/></svg>',
  "users-group":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="9" r="2.3"/><circle cx="17" cy="9" r="2.3"/><circle cx="12" cy="7" r="2.6"/><path d="M2 19c0-2.6 2.2-4.6 5-4.6M22 19c0-2.6-2.2-4.6-5-4.6M7 19.2c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2"/></svg>',

  // Facilitation
  refresh:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"/><path d="M20 20v-4.5h-4.5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V17h5v-1.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3Z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',

  // Reused directly from the training category icons (see module comment).
  kanban: stripSizeClass(categoryIcons.kanban),
  "flight-levels": stripSizeClass(categoryIcons["flight-levels"]),
  scrum: stripSizeClass(categoryIcons.scrum),
  coaching: stripSizeClass(categoryIcons.coaching),
};
