// Shared, short, reused-across-pages interface copy (nav labels, table
// headers, buttons, template section labels) -- as opposed to page-unique
// prose, which lives in the training-categories/training-courses/site-pages
// content collections instead.
//
// English values here are the real copy, copied verbatim from what was
// already hardcoded in each component. German values default to a
// deliberate, clearly-flagged placeholder ("[DE] " + the English string)
// rather than an invented translation; `deOverrides` below replaces that
// placeholder with reviewed, approved copy key by key as each translation
// pass lands (see the German-language plan doc). Keys not yet in
// `deOverrides` still fall back to the "[DE] " placeholder -- do not
// invent text for those.
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
    "A European network of practitioners delivering training, coaching, and transformation, in English and German.",
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
  "schedule.filterDiscipline": "Discipline",
  // "Show all 26 sessions" -- the count goes in between
  "schedule.showAllPrefix": "Show all",
  "schedule.showAllSuffix": "sessions",
  "schedule.showFewer": "Show fewer",
  "schedule.filterCountry": "Country",
  "schedule.filterTrainer": "Trainer",

  "badge.inPerson": "In-person",
  "badge.liveOnline": "Live online",
  "badge.selfPaced": "Self-paced",
  "badge.soldOut": "Sold out",

  "trainers.eyebrow": "Your trainers",
  "trainers.heading": "Meet the trainers",
  "trainers.alsoDeliveredBy": "Also delivered by:",

  "megaMenu.trainingHome": "Training Home",
  "megaMenu.servicesHome": "Services Home",
  // Appended to a category's own name (e.g. "Flight Levels") to build its
  // mobile-menu "go to this category's home page" link label -- see
  // TrainingMegaMenuMobile.astro. Matches the "Training Home"/"Services
  // Home" pattern above, just per-category instead of a fixed string.
  "megaMenu.categoryHomeSuffix": " Home",
  "megaMenu.sixDisciplines": "Six disciplines, one practitioner network.",
  "megaMenu.notSureWhereToStart": "Not sure where to start?",
  "megaMenu.talkToUsAboutTeam": "Talk to us about your team's situation",
  "megaMenu.helpText":
    "We'll help you pick the right discipline and format, in-person, live online, or self-paced.",

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
  "training.readMoreAboutApproach": "Read more about our training approach",
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
  // German phrases the discipline name at the end ("Trainingskurse im
  // Bereich Kanban") rather than the start like English does ("Kanban
  // training courses"), so these two exist purely for that German
  // construction -- English keeps using the prefix/suffix pair above and
  // never reads these two English values.
  "training.disciplineCoursesHeadingPrefix": "Training courses in",
  "training.upcomingDisciplineTrainingPrefix": "Upcoming training in",
  "training.noSessionsForDisciplinePrefix": "No",
  "training.noSessionsForDisciplineSuffix": "sessions are currently scheduled.",

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
  "course.onRequestLabel": "On request",
  "course.onRequestNote": "Not on the public schedule right now, but available for private or in-house delivery on request.",

  // For the trainer-led-vs-self-paced two-card layout (courses that offer
  // self-paced alongside at least one trainer-led format). German copy
  // added below in deOverrides.
  "course.trainerLedTitle": "Trainer-Led Workshop",
  "course.trainerLedDescription":
    "Learn in a group with a certified trainer, in person or live online. Social, interactive, and led at a set pace over the scheduled dates.",
  "course.selfPacedTitle": "Self-Paced Workshop",
  "course.findOutMore": "Find out more",

  "selfPaced.breadcrumbLabel": "Self-Paced",
  "selfPaced.eyebrowPrefix": "Self-Paced",
  "selfPaced.beginWhenReady": "Begin whenever you're ready",
  "selfPaced.whatsIncluded": "What's included",
  "selfPaced.curriculumEyebrow": "Curriculum",
  "selfPaced.faqHeading": "Frequently asked questions",
  "selfPaced.faqCertificationQuestion": "Is the certification the same as the trainer-led course?",
  "selfPaced.faqCertificationAnswer":
    "Yes. The self-paced format leads to the same certification as every other format of this course.",
  "selfPaced.readyHeading": "Ready to get started?",

  "level": "Level",
  "duration": "Duration",
  "certification": "Certification",
  "languages": "Languages",

  // Coach/Fellow profile page (/about/[slug]). "Bio" left in both languages
  // since it's already the naturally-used word in German too -- not
  // translated to something like "Biografie".
  "profile.bio": "Bio",
  "profile.backgroundExpertise": "Background & expertise",
  "profile.approach": "Approach",
  "profile.specialities": "Specialities",
  "profile.certifications": "Certifications",
  "profile.coursesDelivered": "Courses delivered",
  "profile.yearsExperienceSuffix": "years experience",
  "profile.upcomingTraining": "Upcoming training",
  "profile.findOutMore": "Find out more",
  "profile.recentArticles": "Recent articles",
  "profile.seeAllArticles": "See all articles",
  "profile.showLess": "Show less",

  // Not covered by any Insights translation draft yet -- falls back to the
  // "[DE] " placeholder until reviewed.
  "insights.minRead": "min read",
  "insights.by": "By",
  "insights.relatedReading": "Related reading",
  "insights.relatedTraining": "Related training",
  // "See all {Scrum} training" -- category names are dropped in between
  "insights.seeCategoryTrainingPrefix": "See all",
  "insights.seeCategoryTrainingSuffix": "training",
  // "&" rather than "and": one category is itself called "Coaching and
  // Facilitation", and "Coaching and Facilitation and Leadership" reads badly.
  "insights.listAnd": "&",
  // Connective sentence for the Related training card, one per matcher
  // signal (see TrainingSignal in src/lib/relatedTraining.ts). Articles
  // can override it with a relatedTrainingIntro of their own.
  "insights.trainingIntro.scrum-master": "Want to grow into the Scrum Master role rather than just run the meetings? These courses cover the accountability in practice.",
  "insights.trainingIntro.product-owner": "Want to shape a product vision and a backlog that reflects it? These courses are built around the Product Owner's job.",
  "insights.trainingIntro.scrum": "Want Scrum to work as practised rather than as written? These courses cover the framework the way experienced teams use it.",
  "insights.trainingIntro.ai-role": "Want to put AI to work in your role without handing over the judgement that makes you valuable? These courses show where it helps and where it doesn't.",
  "insights.trainingIntro.ai-adoption": "Want AI adoption to change how the organisation works, not just its tools? These courses cover the change side of it.",
  "insights.trainingIntro.retrospectives": "Want retrospectives that change something? Facilitation is the skill behind them, and these courses teach it.",
  "insights.trainingIntro.facilitation": "Want to run sessions where the group does the thinking rather than the facilitator? These courses teach exactly that.",
  "insights.trainingIntro.team-dynamics": "Want teams that decide and work together well without being managed into it? These courses are about that craft.",
  "insights.trainingIntro.coaching": "Want to coach teams and leaders properly rather than advise from the sidelines? These courses build that skill.",
  "insights.trainingIntro.transformation": "Want change that sticks rather than a rollout that fades? These courses are about the organisational side of the work.",
  "insights.trainingIntro.leadership": "Want to lead in a way that makes agility possible rather than merely permitted? These courses are built for that.",
  "insights.trainingIntro.safe": "Want to work with SAFe well rather than just install it? These courses cover the framework from the roles that make it work.",
  "insights.trainingIntro.flight-levels": "Want to take the ideas in this article further? The Flight Levels courses start with the introduction and build from there.",
  "insights.trainingIntro.strategy": "Want strategy that reaches the teams doing the work? Flight Level 3 is where that connection is designed, and these courses cover it.",
  "insights.trainingIntro.kanban": "Want work to flow rather than pile up? These courses take Kanban from a board on the wall to a system that keeps improving.",
  "insights.trainingIntro.generic": "Want to put the ideas in this article into practice? These courses are the natural next step.",

  // From betterchange-de-translation-draft-insights-template.md (the
  // Insights hub's shared template strings -- individual article titles/
  // bodies/categories are per-article content, translated separately).
  "insights.eyebrow": "insights",
  "insights.heading": "Articles, guides & resources",
  "insights.intro":
    "Practical thinking on Kanban, Flight Levels, agile transformation, and organisational change, written by people who have done the work.",
  "insights.featuredEyebrow": "Featured",
  "insights.article": "article",
  "insights.articlesPlural": "articles",
  "insights.searchLabel": "Search articles",
  "insights.searchPlaceholder": "Search articles…",
  "insights.filterByTopic": "Filter by topic",
  "insights.noResults": "No articles match the selected filters.",
  "insights.prevPage": "‹ Prev",
  "insights.nextPage": "Next ›",

  "register.eyebrow": "Register",
  "register.backToCourse": "← Back to course details",
  "register.orderSummary": "Order summary",
  "register.seats": "Seats",
  "register.subtotal": "Subtotal",
  "register.total": "Total",
  "register.pricesExclVat": "Prices exclude VAT (MwSt.)",
  "register.trainerSingular": "Your trainer",
  "register.trainerPlural": "Your trainers",
  "register.honeypotLabel": "Don't fill this out if you're human:",
  "register.bookingDetails": "Booking details",
  "register.yourName": "Your name",
  "register.yourEmail": "Your email",
  "register.street": "Street and number",
  "register.postcode": "Postcode",
  "register.city": "City, State",
  "register.company": "Company (optional)",
  "register.vatId": "VAT ID (optional)",
  "register.attendees": "Attendees",
  "register.attendee1Note":
    "Attendee 1 is filled in from your booking details above. Edit it if a different person is attending.",
  "register.attendeeName": "Name",
  "register.attendeeEmail": "Email",
  "register.attendeeAriaPrefix": "Attendee",
  "register.discountCodeQuestion": "Have a discount code?",
  "register.enterCode": "Enter code",
  "register.apply": "Apply",
  "register.anythingWeShouldKnow": "Anything we should know? (optional)",
  "register.consentLabel":
    "I agree to my data being used to process this registration, in line with the privacy policy.",
  "register.confirmRegistration": "Confirm registration",
  // Sold-out/waitlist messaging, the meta description's verb phrase, the
  // price-breakdown offer line, and the discount-code JS feedback strings
  // -- added in a later round of the same register-pages draft.
  "register.metaDescriptionPrefix": "Register for",
  "register.soldOutHeading": "This session is sold out",
  "register.soldOutBodyPrefix": "All seats for",
  "register.soldOutBodySuffix":
    "are taken. Join the waitlist and we'll email you personally the moment a spot opens up.",
  "register.joinWaitlist": "Join the waitlist",
  "register.waitlistJoining": "Joining…",
  "register.waitlistSuccess": "You're on the list. We'll email you the moment a seat opens up.",
  "register.waitlistError": "Couldn't join the waitlist. Check your connection and try again.",
  "register.offerThreeForTwo": "Offer (3-for-2)",
  "register.discountCodeLabel": "Discount code",
  "register.checking": "Checking…",
  "register.discountAppliedSuffix": "applied,",
  "register.off": "off",
  "register.codeNotRecognized": "Code not recognized",
  "register.codeCheckError": "Couldn't check that code. Try again",
} as const;

export type UIKey = keyof typeof en;

function placeholder(value: string): string {
  return `[DE] ${value}`;
}

const dePlaceholders: Record<UIKey, string> = Object.fromEntries(
  (Object.entries(en) as [UIKey, string][]).map(([key, value]) => [key, placeholder(value)])
) as Record<UIKey, string>;

// Reviewed, approved German copy (Phase B), from
// betterchange-de-translation-draft-homepage-services.md,
// betterchange-de-translation-draft-training-hub.md, and
// betterchange-de-translation-draft-mega-menu-disciplines.md. House style:
// impersonal/collective address (no "Sie"/"Du"), colon-form gender-inclusive
// language (Trainer:innen), and several terms kept as English loanwords
// (Training, Leadership, Facilitation, Coaching, course/certification codes).
//
// Two values below are shared JS constants rather than separately-typed-out
// duplicate strings, per betterchange-de-translation-draft-mega-menu-
// disciplines.md's explicit "reuse existing" notes -- so the two call
// sites for each can't drift apart in a future translation pass.
const notSureWhereToStartDe = "Unsicher, wo der richtige Startpunkt liegt?";
const seeFullScheduleDe = "Gesamten Trainingsplan ansehen";

const deOverrides: Partial<Record<UIKey, string>> = {
  "nav.services": "Leistungen",
  "nav.training": "Training",
  "nav.about": "Über uns",
  "nav.insights": "Insights",
  "nav.contact": "Kontakt",
  "nav.contactCta": "Kontakt",
  "nav.menu": "Menü",
  "nav.langSwitcherLabel": "Sprache",
  "breadcrumb.home": "Startseite",

  "footer.tagline":
    "Ein europäisches Netzwerk von Praktiker:innen für Training, Coaching und Transformation, auf Englisch und Deutsch.",
  "footer.trainingHeading": "Training",
  "footer.companyHeading": "Unternehmen",
  "footer.rights": "Alle Rechte vorbehalten.",

  "schedule.course": "Kurs",
  "schedule.date": "Datum",
  "schedule.location": "Ort",
  "schedule.format": "Format",
  "schedule.price": "Preis",
  "schedule.bookNow": "Jetzt buchen",
  "schedule.register": "Anmelden",
  "schedule.fullSchedule": "Alle Termine",
  "schedule.getInTouch": "Kontakt aufnehmen",
  "schedule.seeFullSchedule": seeFullScheduleDe,
  "schedule.seeAllScheduled": seeFullScheduleDe,
  "schedule.preferInHouse": "Lieber privates Inhouse-Training?",
  "schedule.letUsKnow": "Kontakt aufnehmen",
  "schedule.filterDiscipline": "Disziplin",
  "schedule.showAllPrefix": "Alle",
  "schedule.showAllSuffix": "Termine anzeigen",
  "schedule.showFewer": "Weniger anzeigen",
  "schedule.filterCountry": "Land",
  "schedule.filterTrainer": "Trainer:in",
  "schedule.exclVat": "zzgl. MwSt.",
  "schedule.startNow": "Jetzt starten",
  "schedule.alwaysAvailable": "Jederzeit verfügbar",
  "schedule.waysToJoin": "Teilnahmemöglichkeiten",
  "schedule.pickFormat": "Format auswählen",
  "schedule.paymentNote":
    "Keine Vorauszahlung nötig. Eine Rechnung mit ausgewiesener MwSt. wird per E-Mail zugestellt; die Zahlung ist per Überweisung oder Karte möglich.",
  "schedule.noSessionsForCourse": "Für diesen Kurs sind derzeit keine Termine geplant.",
  "schedule.noSessionsFilter": "Für diese Filterkombination sind derzeit keine Termine verfügbar.",

  "badge.inPerson": "Vor Ort",
  "badge.liveOnline": "Live online",
  "badge.selfPaced": "Selbstlernkurs (online)",

  "trainers.eyebrow": "Unsere Trainer:innen",
  "trainers.heading": "Die Trainer:innen im Überblick",

  "megaMenu.trainingHome": "Training-Startseite",
  "megaMenu.servicesHome": "Leistungen-Startseite",
  "megaMenu.categoryHomeSuffix": "-Startseite",
  // Mirrors training-hub-page/de.md's disciplinesHeading, which is
  // approved copy from a different system (a content-collection field,
  // not this dictionary) so it can't be a literal shared JS reference --
  // keep this in sync by hand if that heading ever changes.
  "megaMenu.sixDisciplines": "Sechs Disziplinen, ein Netzwerk aus Praktiker:innen.",
  "megaMenu.notSureWhereToStart": notSureWhereToStartDe,
  "megaMenu.talkToUsAboutTeam": "Ein Gespräch über die Situation des Teams",
  "megaMenu.helpText":
    "Gemeinsam lässt sich die passende Disziplin und das passende Format finden, vor Ort, live online oder im Selbststudium.",

  "cta.seeAllTraining": "Alle Trainings ansehen",
  "cta.ourServices": "Unsere Leistungen",
  "cta.meetFullTeam": "Das ganze Team kennenlernen",
  "cta.readAllReviews": "Alle Bewertungen lesen",
  "cta.viewAllInsights": "Alle Insights ansehen",
  "cta.learnMore": "Mehr erfahren",
  "cta.closingHeading": notSureWhereToStartDe,
  "cta.closingBody":
    "Ein kurzes Gespräch hilft oft weiter. Wir unterstützen gerne dabei, den passenden Trainings- oder Coaching-Ansatz für die jeweilige Situation zu finden.",
  "cta.categoryClosingHeading": "Wie wir unterstützen können",
  "cta.moreCoursesInPrefix": "Weitere Kurse im Bereich",
  "cta.getStarted": "Jetzt starten",
  "cta.viewDiscipline": "Zur Übersicht",

  "training.eyebrowLabel": "Training",
  "training.courseSingular": "Kurs",
  "training.coursePlural": "Kurse",
  "training.chooseWhereToStart": "Einstiegspunkt wählen",
  "training.disciplineCoursesHeadingPrefix": "Trainingskurse im Bereich",
  "training.upcomingDisciplineTrainingPrefix": "Anstehende Trainings im Bereich",
  "training.noSessionsForDisciplinePrefix": "Für",
  "training.noSessionsForDisciplineSuffix": "sind derzeit keine Termine geplant.",
  "training.formatSingular": "Format",
  "training.formatPlural": "Formate",
  "training.nextScheduledSessions": "Nächste Termine",

  "course.whoFor": "Für wen ist dieser Kurs geeignet?",
  "course.whatLearn": "Lerninhalte",
  "course.howToTake": "Kursformate",
  "course.chooseFormat": "Das passende Format wählen",
  "course.howThisRuns": "Ablauf des Kurses",
  "course.included": "Inklusive",
  "course.notSureFormat": "Unsicher, was am besten passt?",
  "course.notSureFormatTrailing": "und gemeinsam die passende Option finden.",
  "course.relatedCourses": "Verwandte Kurse",
  "course.trainerLabel": "Trainer:in",
  "course.onRequestLabel": "Auf Anfrage",
  "course.onRequestNote": "Aktuell nicht öffentlich terminiert, auf Anfrage jedoch für private oder unternehmensinterne Durchführung verfügbar.",

  // Found and fixed as a site-wide [DE]-placeholder scan follow-up: the
  // trainer-led-vs-self-paced two-card layout and the whole self-paced
  // course page were shipped without ever getting a translation pass.
  "course.trainerLedTitle": "Trainergeführter Workshop",
  "course.trainerLedDescription":
    "Lernen in der Gruppe mit zertifizierten Trainer:innen, vor Ort oder live online. Sozial, interaktiv und im festen Rhythmus der geplanten Termine.",
  "course.selfPacedTitle": "Selbstlern-Workshop",
  "course.findOutMore": "Mehr erfahren",

  "selfPaced.breadcrumbLabel": "Selbstlernkurs",
  "selfPaced.eyebrowPrefix": "Selbstlernkurs",
  "selfPaced.beginWhenReady": "Beginn, wann immer gewünscht",
  "selfPaced.whatsIncluded": "Was ist inklusive",
  "selfPaced.curriculumEyebrow": "Curriculum",
  "selfPaced.faqHeading": "Häufig gestellte Fragen",
  "selfPaced.faqCertificationQuestion": "Ist die Zertifizierung dieselbe wie beim trainergeführten Kurs?",
  "selfPaced.faqCertificationAnswer":
    "Ja. Der Selbstlernkurs führt zur gleichen Zertifizierung wie jedes andere Format dieses Kurses.",
  "selfPaced.readyHeading": "Bereit loszulegen?",

  "insights.minRead": "Min. Lesezeit",
  "insights.by": "Von",
  "insights.relatedReading": "Weiterführende Artikel",
  "insights.relatedTraining": "Passende Trainings",
  "insights.seeCategoryTrainingPrefix": "Alle Trainings zu",
  "insights.seeCategoryTrainingSuffix": "ansehen",
  "insights.listAnd": "und",
  "insights.trainingIntro.scrum-master": "Wer die Rolle als Scrum Master wirklich ausfüllen will, statt nur Meetings zu moderieren, findet in diesen Trainings das Handwerkszeug dafür.",
  "insights.trainingIntro.product-owner": "Eine Produktvision entwickeln und ein Backlog führen, das sie auch abbildet: Genau darum geht es in diesen Trainings.",
  "insights.trainingIntro.scrum": "Scrum so einsetzen, wie es in der Praxis funktioniert, nicht nur wie es im Guide steht: Diese Trainings zeigen, wie.",
  "insights.trainingIntro.ai-role": "KI im eigenen Arbeitsalltag sinnvoll nutzen, ohne das Urteilsvermögen abzugeben: Diese Trainings zeigen, wo sie hilft und wo nicht.",
  "insights.trainingIntro.ai-adoption": "KI soll die Arbeitsweise der Organisation verändern, nicht nur ihre Werkzeuge. Diese Trainings behandeln die Veränderungsseite davon.",
  "insights.trainingIntro.retrospectives": "Retrospektiven, die wirklich etwas verändern, brauchen gute Facilitation. Diese Trainings vermitteln genau diese Fähigkeit.",
  "insights.trainingIntro.facilitation": "Sessions leiten, in denen die Gruppe denkt und nicht die Moderation: Das ist der Kern dieser Trainings.",
  "insights.trainingIntro.team-dynamics": "Teams, die gut entscheiden und zusammenarbeiten, ohne dazu gemanagt zu werden: Diese Trainings vermitteln dieses Handwerk.",
  "insights.trainingIntro.coaching": "Teams und Führungskräfte wirklich coachen, statt von der Seitenlinie zu beraten: Diese Trainings bauen genau diese Fähigkeit auf.",
  "insights.trainingIntro.transformation": "Veränderung, die bleibt, statt eines Rollouts, der verpufft: Diese Trainings behandeln die organisatorische Seite der Arbeit.",
  "insights.trainingIntro.leadership": "Führung, die Agilität ermöglicht und nicht nur erlaubt: Dafür sind diese Trainings gemacht.",
  "insights.trainingIntro.safe": "SAFe gut anwenden statt nur einführen: Diese Trainings behandeln das Framework aus Sicht der Rollen, die es tragen.",
  "insights.trainingIntro.flight-levels": "Wer die Ideen aus diesem Artikel weiterverfolgen will: Die Flight Levels Trainings beginnen mit der Einführung und bauen darauf auf.",
  "insights.trainingIntro.strategy": "Strategie, die bei den Teams ankommt, wird auf Flight Level 3 gestaltet. Diese Trainings zeigen, wie.",
  "insights.trainingIntro.kanban": "Arbeit soll fließen, statt sich zu stapeln: Diese Trainings führen Kanban vom Board an der Wand zum System, das sich laufend verbessert.",
  "insights.trainingIntro.generic": "Die Ideen aus diesem Artikel in die Praxis bringen: Diese Trainings sind der naheliegende nächste Schritt.",

  // From betterchange-de-translation-draft-insights-template.md. The
  // draft's intro paragraph used an em dash ("... organisatorischem
  // Wandel — geschrieben von..."); converted to a comma per CLAUDE.md's
  // no-em-dash house style, same as the register-pages draft's waitlist
  // body sentence.
  "insights.eyebrow": "Insights",
  "insights.heading": "Artikel, Leitfäden & Ressourcen",
  "insights.intro":
    "Praxisnahe Gedanken zu Kanban, Flight Levels, agiler Transformation und organisatorischem Wandel, geschrieben von Menschen, die die Arbeit selbst gemacht haben.",
  "insights.featuredEyebrow": "Ausgewählt",
  "insights.article": "Artikel",
  "insights.articlesPlural": "Artikel",
  "insights.searchLabel": "Artikel durchsuchen",
  "insights.searchPlaceholder": "Artikel durchsuchen…",
  "insights.filterByTopic": "Nach Thema filtern",
  // Not in the draft (only shared template strings were covered there) --
  // written to match house style (impersonal, no em dash).
  "insights.noResults": "Keine Artikel entsprechen den gewählten Filtern.",
  "insights.prevPage": "‹ Zurück",
  "insights.nextPage": "Weiter ›",

  "level": "Niveau",
  "duration": "Dauer",
  "certification": "Zertifizierung",
  "languages": "Sprachen",

  // From betterchange-de-coach-profiles.md.
  "profile.bio": "Bio",
  "profile.backgroundExpertise": "Hintergrund & Expertise",
  "profile.approach": "Ansatz",
  "profile.specialities": "Spezialgebiete",
  "profile.certifications": "Zertifizierungen",
  "profile.coursesDelivered": "Durchgeführte Kurse",
  "profile.yearsExperienceSuffix": "Jahre Erfahrung",
  // Reuses "anstehende" for "upcoming", matching
  // training.upcomingDisciplineTrainingPrefix's established phrasing.
  "profile.upcomingTraining": "Anstehende Trainings",
  "profile.findOutMore": "Mehr erfahren",
  "profile.recentArticles": "Aktuelle Artikel",
  "profile.seeAllArticles": "Alle Artikel ansehen",
  "profile.showLess": "Weniger anzeigen",

  "certifiedBy": "Zertifiziert durch",
  "cta.talkToUs": "Kontakt aufnehmen",

  // From betterchange-de-translation-draft-register-pages.md. Anything not
  // covered there (sold-out/waitlist messaging, discount-code JS feedback,
  // the meta description's verb phrase) is deliberately left out here, so
  // it falls back to the "[DE] " placeholder rather than being guessed at.
  "register.eyebrow": "Anmeldung",
  "register.backToCourse": "← Zurück zu den Kursdetails",
  "register.orderSummary": "Bestellübersicht",
  "register.seats": "Plätze",
  "register.subtotal": "Zwischensumme",
  "register.total": "Gesamt",
  "register.pricesExclVat": "Preise zzgl. MwSt.",
  "register.trainerSingular": "Trainer:in",
  "register.trainerPlural": "Trainer:in",
  "register.honeypotLabel": "Dieses Feld bitte leer lassen:",
  "register.bookingDetails": "Buchungsdetails",
  "register.yourName": "Name",
  "register.yourEmail": "E-Mail",
  "register.street": "Straße und Hausnummer",
  "register.postcode": "Postleitzahl",
  "register.city": "Stadt, Region",
  "register.company": "Unternehmen (optional)",
  "register.vatId": "USt-IdNr. (optional)",
  "register.attendees": "Teilnehmende",
  "register.attendee1Note":
    "Teilnehmer:in 1 wird automatisch aus den Buchungsdetails oben übernommen. Bei Bedarf anpassen, falls eine andere Person teilnimmt.",
  "register.attendeeName": "Name",
  "register.attendeeEmail": "E-Mail",
  "register.attendeeAriaPrefix": "Teilnehmer:in",
  "register.discountCodeQuestion": "Rabattcode vorhanden?",
  "register.enterCode": "Code eingeben",
  "register.apply": "Anwenden",
  "register.anythingWeShouldKnow": "Sonstige Hinweise (optional)",
  "register.consentLabel":
    "Ich bin damit einverstanden, dass meine Daten gemäß der Datenschutzerklärung zur Bearbeitung dieser Anmeldung verwendet werden.",
  "register.confirmRegistration": "Anmeldung bestätigen",

  // Sold-out/waitlist messaging, the meta description's verb phrase, the
  // price-breakdown offer line, and the discount-code JS feedback strings
  // -- from a later round of the same register-pages draft. The em dash
  // in the draft's waitlist body sentence was converted to a full-stop
  // split per CLAUDE.md house style.
  "register.metaDescriptionPrefix": "Anmeldung für",
  "register.soldOutHeading": "Dieser Termin ist ausgebucht",
  "register.soldOutBodyPrefix": "Alle Plätze für",
  "register.soldOutBodySuffix":
    "sind vergeben. Auf die Warteliste eintragen. Sobald ein Platz frei wird, gibt es eine persönliche Benachrichtigung per E-Mail.",
  "register.joinWaitlist": "Zur Warteliste",
  "register.waitlistJoining": "Wird hinzugefügt…",
  "register.waitlistSuccess": "Eintragung erfolgreich. Sobald ein Platz frei wird, folgt eine Benachrichtigung per E-Mail.",
  "register.waitlistError": "Eintragung in die Warteliste fehlgeschlagen. Bitte Verbindung prüfen und erneut versuchen.",
  "register.offerThreeForTwo": "Angebot (3 für 2)",
  "register.discountCodeLabel": "Rabattcode",
  "register.checking": "Wird geprüft…",
  "register.discountAppliedSuffix": "angewendet,",
  "register.off": "Rabatt",
  "register.codeNotRecognized": "Code nicht erkannt",
  "register.codeCheckError": "Code konnte nicht geprüft werden. Bitte erneut versuchen.",
};

export const de: Record<UIKey, string> = { ...dePlaceholders, ...deOverrides };

export const ui = { en, de };
