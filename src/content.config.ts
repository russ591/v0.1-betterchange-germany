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
    // Reference when the trainer has a migrated profile, plain name
    // otherwise (some trainer IDs in the source data don't map to a
    // published Fellow).
    trainer: reference("coach-profiles").optional(),
    trainerName: z.string().optional(),
    price: z.string(),
    offer: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["available", "sold-out", "tbc"]).default("available"),
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
    title: z.string(),
    contentType: z.string().optional(),
    primaryCategory: z.string().optional(),
    categories: z.array(z.string()).default([]),
    date: z.coerce.date(),
    readTimeMinutes: z.number().optional(),
    // Reference when the author has a migrated profile, plain name
    // fallback otherwise.
    author: reference("coach-profiles").optional(),
    authorName: z.string().optional(),
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

export const collections = {
  "training-categories": trainingCategory,
  "training-courses": trainingCourse,
  "training-schedules": trainingSchedule,
  "coach-profiles": coachProfile,
  "insights-articles": insightsArticle,
  "legal-pages": legalPage,
};
