import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

/*
  Content model (spec §5). Five collections, each mapping to a Wix CMS
  collection from the old site. Only a handful of real sample entries exist
  right now (spec step 5) — the rest of the courses/profiles/articles are
  added the same way, one file per entry, once the full migration starts.
*/

const trainingCategory = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/training-categories" }),
  schema: z.object({
    name: z.string(),
    // Short paragraph used on the Training hub. The live site's actual copy
    // for these six blurbs wasn't available to pull during this build --
    // see the placeholder note on each entry.
    description: z.string(),
    order: z.number(),
  }),
});

const trainingCourse = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/training-courses" }),
  schema: z.object({
    name: z.string(),
    code: z.string(),
    category: reference("training-categories"),
    // Freeform rather than an enum: certification levels don't follow one
    // consistent naming pattern across Flight Levels / Kanban / Scrum / ICAgile.
    level: z.string(),
    durationDays: z.number(),
    certification: z.string(),
    // one shared schema for every format a course can run in (spec §4 —
    // Format/pricing option panel)
    formats: z
      .array(
        z.object({
          type: z.enum(["in-person", "live-online", "self-paced"]),
          price: z.string(),
          priceNote: z.string().optional(),
        })
      )
      .min(1),
    whoIsThisFor: z.array(z.string()),
    whatYoullLearn: z.array(z.string()),
    summary: z.string(),
  }),
});

// One shared "location" field for every scheduled session, replacing the
// live site's "country" (home/full-schedule) vs "location" (training hub)
// mismatch flagged in spec §2 bug 5.
const trainingSchedule = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/training-schedules" }),
  schema: z.object({
    course: reference("training-courses"),
    date: z.coerce.date(),
    format: z.enum(["in-person", "live-online", "self-paced"]),
    location: z.string(),
    trainer: reference("coach-profiles"),
    price: z.string(),
  }),
});

const coachProfile = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/coach-profiles" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    country: z.string(),
    languages: z.array(z.string()),
    photo: z.string().optional(),
    // Spec §2 bug 1: only Russell Hill's profile has real content on the
    // live site today. The interim fix is to keep every Fellow listed on
    // the About page, but only link through to a profile page when
    // hasFullProfile is true -- everyone else renders card-only, no link,
    // until their real bio/background/approach copy is written.
    hasFullProfile: z.boolean(),
    summary: z.string().optional(),
    bio: z.string().optional(),
    backgroundAndExpertise: z.string().optional(),
    approach: z.string().optional(),
    specialities: z.array(z.string()).optional(),
  }),
});

const insightsArticle = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights-articles" }),
  schema: z.object({
    title: z.string(),
    category: reference("training-categories"),
    date: z.coerce.date(),
    readTime: z.string(),
    author: reference("coach-profiles"),
    type: z.enum(["written", "webinar"]),
    excerpt: z.string(),
    relatedTopics: z.array(z.string()).default([]),
  }),
});

export const collections = {
  "training-categories": trainingCategory,
  "training-courses": trainingCourse,
  "training-schedules": trainingSchedule,
  "coach-profiles": coachProfile,
  "insights-articles": insightsArticle,
};
