// Outline icons (stroke-based, matching the chevrons already used in the
// mobile drawer) shown next to every row of the mobile menu -- desktop nav
// has no icons and no Home entry (the logo already covers "go home"
// there, same as most sites); the mobile drawer gets its own explicit
// "Home" row since once it's open the logo above it is easy to overlook.
// Shared between Header.astro (the flat rows) and TrainingMegaMenuMobile.astro
// (the "Training" accordion row), so both stay visually consistent.
export const mobileNavIcons = {
  home: `<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>`,
  services: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  training: `<path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5"/>`,
  insights: `<path d="M3 3v18h18"/><path d="M18.5 8 13 13.5l-3-3L4 17"/>`,
  about: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>`,
  contact: `<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.4 2.1L8 10.3a16 16 0 0 0 6 6l1.5-1.4a2 2 0 0 1 2-.4c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>`,
} as const;
