// One icon per training discipline, keyed by training-category id, shown
// on the /training hub's discipline cards.
export const categoryIcons: Record<string, string> = {
  "flight-levels":
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" class="h-[22px] w-[22px]"><path d="M3 17h18M3 12h14M3 7h10"/></svg>',
  kanban:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" class="h-[22px] w-[22px]"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="9.5" y="4" width="5" height="10" rx="1"/><rect x="16" y="4" width="5" height="13" rx="1"/></svg>',
  scrum:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" class="h-[22px] w-[22px]"><path d="M4 12a8 8 0 0 1 14-5"/><path d="M18 4v4h-4"/><path d="M20 12a8 8 0 0 1-14 5"/><path d="M6 20v-4h4"/></svg>',
  coaching:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" class="h-[22px] w-[22px]"><circle cx="8.5" cy="10" r="4"/><path d="M14 14.5c2.8.4 5 2.1 5 4.5"/><path d="M3.5 19c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg>',
  leadership:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" class="h-[22px] w-[22px]"><path d="M6 3v18"/><path d="M6 4h11l-3 4 3 4H6"/></svg>',
  scaling:
    '<svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.7" class="h-[22px] w-[22px]"><path d="M4 15v5h5M20 9V4h-5M20 4l-7 7M4 20l7-7"/></svg>',
};
