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

  "level": "Level",
  "duration": "Duration",
  "certification": "Certification",
  "languages": "Languages",

  // Not covered by any Insights translation draft yet -- falls back to the
  // "[DE] " placeholder until reviewed.
  "insights.minRead": "min read",
  "insights.by": "By",
  "insights.relatedReading": "Related reading",

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

  "insights.minRead": "Min. Lesezeit",
  "insights.by": "Von",
  "insights.relatedReading": "Weiterführende Artikel",

  "level": "Niveau",
  "duration": "Dauer",
  "certification": "Zertifizierung",
  "languages": "Sprachen",

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
