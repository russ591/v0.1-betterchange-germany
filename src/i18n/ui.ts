// Shared, short, reused-across-pages interface copy (nav labels, table
// headers, buttons, template section labels) -- as opposed to page-unique
// prose, which lives in the training-categories/training-courses/site-pages
// content collections instead.
//
// English values here are the real copy, copied verbatim from what was
// already hardcoded in each component. German values are a deliberate,
// clearly-flagged placeholder ("[DE] " + the English string) rather than a
// translation -- see the German-language plan doc: Claude Code builds the
// scaffold in this phase, real reviewed German copy is slotted in later.
// Do not replace the placeholders with invented German text.
export const en = {
  "nav.services": "Services",
  "nav.training": "Training",
  "nav.about": "About",
  "nav.insights": "Insights",
  "nav.contact": "Contact",
  "nav.contactCta": "Contact us",
  "nav.menu": "Menu",
  "nav.langSwitcherLabel": "Language",

  "breadcrumb.home": "Home",

  "footer.tagline":
    "A European network of practitioners delivering training, coaching, and transformation — in English and German.",
  "footer.trainingHeading": "Training",
  "footer.companyHeading": "Company",
  "footer.rights": "All rights reserved.",

  "schedule.course": "Course",
  "schedule.date": "Date",
  "schedule.location": "Location",
  "schedule.format": "Format",
  "schedule.price": "Price",
  "schedule.bookNow": "Book now",
  "schedule.register": "Register",
  "schedule.joinWaitlist": "Join waitlist",
  "schedule.startNow": "Start now",
  "schedule.alwaysAvailable": "Always available",
  "schedule.getInTouch": "Get in touch",
  "schedule.noSessions": "No sessions are currently scheduled.",
  "schedule.noSessionsFilter": "No sessions match this filter right now.",
  "schedule.allDisciplines": "All disciplines",
  "schedule.fullSchedule": "Full schedule",
  "schedule.seeFullSchedule": "See full training schedule",
  "schedule.seeAllScheduled": "See all scheduled training",
  "schedule.preferInHouse": "Prefer private, in-house training?",
  "schedule.letUsKnow": "Let us know",
  "schedule.exclVat": "excl. VAT",
  "schedule.noSessionsForCourse": "No sessions are currently scheduled for this course.",
  "schedule.waysToJoin": "Ways to join",
  "schedule.pickFormat": "Pick a format below",
  "schedule.paymentNote":
    "No upfront payment needed. A VAT invoice (Rechnung) will be sent via email and you can pay by bank transfer or with card.",

  "badge.inPerson": "In-person",
  "badge.liveOnline": "Live online",
  "badge.selfPaced": "Self-paced",
  "badge.soldOut": "Sold out",

  "trainers.eyebrow": "Your trainers",
  "trainers.heading": "Meet the trainers",
  "trainers.alsoDeliveredBy": "Also delivered by:",

  "megaMenu.trainingHome": "Training Home",
  "megaMenu.sixDisciplines": "Six disciplines, one practitioner network.",
  "megaMenu.notSureWhereToStart": "Not sure where to start?",
  "megaMenu.talkToUsAboutTeam": "Talk to us about your team's situation",
  "megaMenu.helpText":
    "We'll help you pick the right discipline and format — in-person, live online, or self-paced.",

  "certifiedBy": "Certified by",

  "cta.seeAllTraining": "See all training",
  "cta.ourServices": "Our services",
  "cta.talkToUs": "Talk to us",
  "cta.getStarted": "Get started",
  "cta.viewDiscipline": "View discipline",
  "cta.meetFullTeam": "Meet the full team",
  "cta.watchOnYouTube": "Watch on YouTube",
  "cta.readAllReviews": "Read all reviews",
  "cta.viewAllInsights": "View all insights",
  "cta.learnMore": "Learn more",
  "cta.closingHeading": "Not sure where to start?",
  "cta.closingBody": "Talk to us. We'll help you find the right training or coaching approach for your situation.",
  "cta.categoryClosingHeading": "Let's talk about how we can help",
  "cta.moreCoursesInPrefix": "More courses in",

  "training.eyebrowLabel": "Training",
  "training.courseSingular": "course",
  "training.coursePlural": "courses",
  "training.trainingCoursesHeadingSuffix": "training courses",
  "training.noCoursesPublished": "No courses published for this discipline yet.",
  "training.chooseWhereToStart": "Choose where to start",
  "training.upcomingPrefix": "Upcoming",
  "training.upcomingSuffix": "training",
  "training.nextScheduledSessions": "Next scheduled sessions",
  "training.formatSingular": "format",
  "training.formatPlural": "formats",

  "course.whoFor": "Who is this course for?",
  "course.whatLearn": "What you'll learn",
  "course.howToTake": "How to take this course",
  "course.chooseFormat": "Choose the format that fits you",
  "course.howThisRuns": "How this course runs",
  "course.included": "Included",
  "course.notSureFormat": "Not sure which fits best?",
  "course.relatedCourses": "Related courses",
  "course.notSureFormatTrailing": "and we'll help you decide.",
  "course.trainerLabel": "Trainer:",

  "level": "Level",
  "duration": "Duration",
  "certification": "Certification",
  "languages": "Languages",
} as const;

export type UIKey = keyof typeof en;

function placeholder(value: string): string {
  return `[DE] ${value}`;
}

export const de: Record<UIKey, string> = Object.fromEntries(
  (Object.entries(en) as [UIKey, string][]).map(([key, value]) => [key, placeholder(value)])
) as Record<UIKey, string>;

export const ui = { en, de };
