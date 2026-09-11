import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

/*
  Content model (spec §5), populated from the real Wix CMS CSV exports
  (TrainingCategories, TrainingCourses, CourseAudience, CourseLearning,
  CourseLevels, TrainingSchedule, Fellows, Insights). Field shapes follow
  what the CSVs actually contain rather than the original guess-schema, so
  nothing here is invented.
*/

const trainingCategory = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/training-categories" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    certificationBody: z.string().optional(),
    // Explainer video for the category page hero. Optional -- most topics
    // won't have one; the block simply doesn't render when it's absent.
    videoUrl: z.string().optional(),
    videoTitle: z.string().optional(),
    order: z.number(),
  }),
});

const trainingCourse = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/training-courses" }),
  schema: z.object({
    name: z.string(),
    code: z.string(),
    category: reference("training-categories"),
    // Freeform: certification levels don't follow one consistent naming
    // pattern across Flight Levels / Kanban / Scrum / ICAgile.
    level: z.string().optional(),
    durationText: z.string(),
    durationDays: z.number(),
    certification: z.string().optional(),
    formats: z.array(z.enum(["in-person", "live-online", "self-paced"])).min(1),
    priceFrom: z.string().optional(),
    specialOfferText: z.string().optional(),
    languages: z.array(z.string()).default([]),
    whoIsThisFor: z.array(z.string()),
    whatYoullLearn: z.array(z.string()),
    summary: z.string(),
    sortOrder: z.number().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    // URL slug from the live site's sitemap (may contain literal
    // parentheses, e.g. "flight-level-2-design-(fl2d)"). Falls back to the
    // content id when absent so new courses don't need to set this.
    urlSlug: z.string().optional(),
  }),
});

// One shared "location" field for every scheduled session, replacing the
// live site's "country" (home/full-schedule) vs "location" (training hub)
// mismatch flagged in spec §2 bug 5.
const trainingSchedule = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/training-schedules" }),
  schema: z.object({
    course: reference("training-courses"),
    date: z.coerce.date().optional(), // absent for self-paced (start anytime)
    format: z.enum(["in-person", "live-online", "self-paced"]),
    location: z.string(),
    // Multiple trainers can co-teach a session (several of the
    // non-Germany sister-site sessions are run by two people). Plain
    // trainerName stays as a rare fallback for a trainer with no
    // migrated profile at all -- every trainer in the data today has
    // one, so trainers should be preferred whenever possible.
    trainers: z.array(reference("coach-profiles")).optional(),
    trainerName: z.string().optional(),
    price: z.string(),
    offer: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["available", "sold-out", "tbc"]).default("available"),
    // Sessions run by a sister site (e.g. betterchange-consulting.dk/.it)
    // that aren't fulfilled through our own registration flow at all --
    // the register button sends people to externalUrl in a new tab
    // instead, and the internal /training/register/[session] page isn't
    // even generated for these (see its getStaticPaths filter).
    isExternal: z.boolean().default(false),
    externalUrl: z.string().url().optional(),
  }),
});

const coachProfile = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/coach-profiles" }),
  schema: z.object({
    name: z.string(),
    firstName: z.string().optional(),
    role: z.string(),
    country: z.string(),
    languages: z.array(z.string()),
    photo: z.string().optional(),
    linkedinUrl: z.string().optional(),
    yearsExperience: z.string().optional(),
    // Spec §2 bug 1: only Russell Hill's profile has real content today —
    // every other Fellow's bio/background/approach is still literal
    // "[PLACEHOLDER]" text in the CMS. Interim fix: everyone stays listed
    // on the About page, but only hasFullProfile: true entries link
    // through to a profile page.
    hasFullProfile: z.boolean(),
    bio: z.string().optional(),
    backgroundAndExpertise: z.string().optional(),
    approach: z.string().optional(),
    specialities: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    coursesDelivered: z.array(z.string()).optional(), // TrainingCourse codes
    displayOrder: z.number().default(10),
    // URL slug from the live site's sitemap (may contain accented
    // characters, e.g. "jesper-ørting"). Falls back to the content id.
    urlSlug: z.string().optional(),
  }),
});

const insightsArticle = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights-articles" }),
  schema: z.object({
    // Kept as English loanwords on German entries too (Change Management,
    // Leadership, Coaching, Flight Levels, Kanban, Blog, Webinar, etc.),
    // same as the filter tags elsewhere on the site -- with two agreed
    // exceptions: "Product Development" -> "Produktentwicklung" and
    // "AI" -> "KI". Standing rule for the whole batch-by-batch Insights
    // translation project; no need to re-flag this per batch.
    title: z.string(),
    contentType: z.string().optional(),
    primaryCategory: z.string().optional(),
    categories: z.array(z.string()).default([]),
    date: z.coerce.date(),
    readTimeMinutes: z.number().optional(),
    // Reference when the author has a migrated profile, plain name
    // fallback otherwise. On German entries, always pull author from
    // the EN source article, not from the batch draft's per-article
    // header (Russ's author-ID-to-name mapping there is unreliable --
    // confirmed mismatches across several batches). Only flag if the
    // EN source's own attribution looks wrong. Standing rule for the
    // whole batch-by-batch Insights translation project; no need to
    // re-flag this per batch.
    author: reference("coach-profiles").optional(),
    authorName: z.string().optional(),
    // Translated into German on German entries as part of each batch's
    // reviewed draft, same as bodyHtml. Standing rule for the whole
    // batch-by-batch Insights translation project; no need to re-flag
    // this per batch.
    excerpt: z.string(),
    featured: z.boolean().default(false),
    imageUrl: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    bodyHtml: z.string(),
    // URL slug from the live site's sitemap — many contain literal
    // punctuation (colons, apostrophes, em-dashes). Falls back to the
    // content id when absent so new articles don't need to set this.
    urlSlug: z.string().optional(),
  }),
});

// Impressum, Datenschutzerklärung and AGB — real legal text migrated
// verbatim from the live .de site, kept as markdown so headings/lists
// render through Astro's standard markdown pipeline rather than a
// hand-transcribed HTML string.
const legalPage = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal-pages" }),
  schema: z.object({
    title: z.string(),
  }),
});

// German-language scaffold (phase A): page-level prose for the three
// hand-built marketing pages (home, services, training hub) that isn't
// otherwise sourced from a content collection. One entry per language --
// "en.md" and "de.md" -- rather than the locale-subfolder convention used
// by training-categories/training-courses, since each of these collections
// only ever holds a single page's two language variants, not a list.
const homePage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/home-page" }),
  schema: z.object({
    metaDescription: z.string(),
    heroEyebrow: z.string(),
    heroHeadingLead: z.string(),
    heroHeadingTrail: z.string(),
    heroBody: z.string(),
    stats: z.array(z.object({ label: z.string(), value: z.string(), description: z.string() })),
    workedWithLabel: z.string(),
    servicesEyebrow: z.string(),
    servicesHeading: z.string(),
    upcomingEyebrow: z.string(),
    upcomingHeading: z.string(),
    teamEyebrow: z.string(),
    teamHeading: z.string(),
    teamBody: z.string(),
    quoteEyebrow: z.string(),
    quoteText: z.string(),
    quoteCite: z.string(),
    insightsEyebrow: z.string(),
    insightsHeading: z.string(),
  }),
});

const servicesPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services-page" }),
  schema: z.object({
    metaDescription: z.string(),
    heroEyebrow: z.string(),
    heroHeading: z.string(),
    heroBody: z.string(),
    servicesEyebrow: z.string(),
    servicesHeading: z.string(),
    howItWorksEyebrow: z.string(),
    howItWorksHeading: z.string(),
    steps: z.array(z.object({ heading: z.string(), body: z.string() })),
    insightsEyebrow: z.string(),
    insightsHeading: z.string(),
  }),
});

const trainingHubPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/training-hub-page" }),
  schema: z.object({
    metaDescription: z.string(),
    heroEyebrow: z.string(),
    heroHeading: z.string(),
    heroBody: z.string(),
    disciplinesEyebrow: z.string(),
    disciplinesHeading: z.string(),
    upcomingEyebrow: z.string(),
    upcomingHeading: z.string(),
    formatsEyebrow: z.string(),
    formatsHeading: z.string(),
    formats: z.array(z.object({ name: z.string(), description: z.string() })),
    inHouseEyebrow: z.string(),
    inHouseHeading: z.string(),
    inHouseBody: z.string(),
    feedbackEyebrow: z.string(),
    feedbackHeading: z.string(),
    feedbackIntro: z.string(),
    testimonials: z.array(
      z.object({ quote: z.string(), role: z.string(), location: z.string(), course: z.string(), format: z.string() })
    ),
    ratingValue: z.string(),
    ratingLabel: z.string(),
  }),
});

const aboutPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/about-page" }),
  schema: z.object({
    metaDescription: z.string(),
    heroEyebrow: z.string(),
    heroHeading: z.string(),
    heroBody: z.string(),
    approachEyebrow: z.string(),
    approachHeading: z.string(),
    approachParagraphs: z.array(z.string()),
    stats: z.array(z.object({ label: z.string(), value: z.string(), description: z.string() })),
    peopleEyebrow: z.string(),
    teamHeading: z.string(),
    teamBody: z.string(),
  }),
});

const contactPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/contact-page" }),
  schema: z.object({
    metaDescription: z.string(),
    eyebrow: z.string(),
    heading: z.string(),
    body: z.string(),
    location: z.string(),
    responseTime: z.string(),
    stepsEyebrow: z.string(),
    steps: z.array(z.object({ title: z.string(), body: z.string() })),
    languagesNote: z.string(),
    honeypotLabel: z.string(),
    nameLabel: z.string(),
    emailLabel: z.string(),
    messageLabel: z.string(),
    consentLabel: z.string(),
    submitLabel: z.string(),
  }),
});

const fullSchedulePage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/full-schedule-page" }),
  schema: z.object({
    metaDescription: z.string(),
    eyebrow: z.string(),
    heading: z.string(),
    body: z.string(),
  }),
});

const thankYouPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/thank-you-page" }),
  schema: z.object({
    metaDescription: z.string(),
    eyebrow: z.string(),
    heading: z.string(),
    body: z.string(),
    buttonLabel: z.string(),
  }),
});

const registerThankYouPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/register-thank-you-page" }),
  schema: z.object({
    metaDescription: z.string(),
    eyebrow: z.string(),
    heading: z.string(),
    body: z.string(),
    nextStepsHeading: z.string(),
    steps: z.array(z.string()),
    buttonLabel: z.string(),
  }),
});

const notFoundPage = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/not-found-page" }),
  schema: z.object({
    metaDescription: z.string(),
    eyebrow: z.string(),
    heading: z.string(),
    body: z.string(),
    backHomeLabel: z.string(),
    seeTrainingLabel: z.string(),
    contactLabel: z.string(),
  }),
});

export const collections = {
  "training-categories": trainingCategory,
  "training-courses": trainingCourse,
  "training-schedules": trainingSchedule,
  "coach-profiles": coachProfile,
  "insights-articles": insightsArticle,
  "legal-pages": legalPage,
  "home-page": homePage,
  "services-page": servicesPage,
  "training-hub-page": trainingHubPage,
  "about-page": aboutPage,
  "contact-page": contactPage,
  "full-schedule-page": fullSchedulePage,
  "thank-you-page": thankYouPage,
  "register-thank-you-page": registerThankYouPage,
  "not-found-page": notFoundPage,
};
