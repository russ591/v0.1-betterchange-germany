// Imports the raw Wix CMS CSV exports in scripts/wix-import/data/ into
// src/content/*.md files. Re-run with `node scripts/wix-import/import.mjs`
// whenever a fresh export replaces the CSVs in that folder.
//
// Only rows the live site actually shows are migrated: Status === "PUBLISHED".
// Draft/TBC rows are skipped and counted, not silently dropped.

import { parse } from "csv-parse/sync";
import * as yaml from "js-yaml";
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "data");
const CONTENT = path.join(__dirname, "..", "..", "src", "content");

function readCsv(name) {
  const raw = readFileSync(path.join(DATA, name), "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true, bom: true });
}

function resetDir(dir) {
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".md")) rmSync(path.join(dir, f));
  }
}

function writeEntry(dir, slug, data, body) {
  const frontmatter = yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"' });
  const content = body ? `---\n${frontmatter}---\n${body}\n` : `---\n${frontmatter}---\n`;
  writeFileSync(path.join(dir, `${slug}.md`), content, "utf-8");
}

const clean = (s) => (typeof s === "string" ? s.trim() : s);
const nonEmpty = (s) => {
  const c = clean(s);
  return c && c.length > 0 ? c : undefined;
};

const LANG_NAMES = {
  EN: "English",
  DE: "German",
  DA: "Danish",
  SV: "Swedish",
  IT: "Italian",
  NL: "Dutch",
  ES: "Spanish",
  ET: "Estonian",
  PL: "Polish",
  CR: "Croatian",
  HR: "Croatian",
  FI: "Finnish",
};

function parseLanguages(raw) {
  if (!raw) return [];
  return raw
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // flags are pairs of regional-indicator codepoints, not covered by
      // \p{Extended_Pictographic} -- just pull the trailing letter code
      const match = s.match(/[A-Za-z]+\s*$/);
      const code = (match ? match[0] : s).trim();
      return LANG_NAMES[code] || code;
    });
}

function parseCountryField(raw) {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.join(" & ") : String(arr);
  } catch {
    return raw;
  }
}

const summary = {};

// ---------------------------------------------------------------------
// 1. Training categories
// ---------------------------------------------------------------------
const categoriesDir = path.join(CONTENT, "training-categories");
resetDir(categoriesDir);
const categoryRows = readCsv("TrainingCategories.csv");
const categoryIdToSlug = new Map();

for (const row of categoryRows) {
  const slug = row.CategorySlug;
  categoryIdToSlug.set(row.ID, slug);
  writeEntry(categoriesDir, slug, {
    name: row.Title,
    tagline: row.CategoryTagline,
    description: row.CategoryDescription,
    certificationBody: nonEmpty(row.certificationBody),
    order: Number(row.sortOrder),
  });
}
summary.categories = categoryRows.length;

// ---------------------------------------------------------------------
// 2. Course audience / learning / levels lookups
// ---------------------------------------------------------------------
function sentenceArray(row, count) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    const v = nonEmpty(row[`sentence${i}`]);
    if (v) out.push(v);
  }
  return out;
}

const audienceMap = new Map();
for (const row of readCsv("CourseAudience.csv")) {
  audienceMap.set(row.ID, sentenceArray(row, 6));
}

const learningMap = new Map();
for (const row of readCsv("CourseLearning.csv")) {
  learningMap.set(row.ID, sentenceArray(row, 8));
}

const levelMap = new Map();
for (const row of readCsv("CourseLevels.csv")) {
  levelMap.set(row.ID, row.CourseLevelText);
}

// ---------------------------------------------------------------------
// 3. Training courses
// ---------------------------------------------------------------------
const coursesDir = path.join(CONTENT, "training-courses");
resetDir(coursesDir);
const courseRows = readCsv("TrainingCourses.csv");
const courseIdToSlug = new Map();
const courseCodeToSlug = new Map();

function parseFormats(formatText) {
  const map = { "in-person": "in-person", online: "live-online", "self-paced": "self-paced" };
  return (formatText || "")
    .split("·")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((s) => map[s])
    .filter(Boolean);
}

for (const row of courseRows) {
  const slug = row.slug;
  courseIdToSlug.set(row.ID, slug);
  courseCodeToSlug.set(row.courseCode, slug);

  writeEntry(coursesDir, slug, {
    name: row.Title,
    code: row.courseCode,
    category: categoryIdToSlug.get(row.TrainingCategory),
    level: levelMap.get(row.courseLevelReference),
    durationText: row.durationText,
    durationDays: Number(row.durationDays) || 0,
    certification: nonEmpty(row.courseCertification),
    formats: parseFormats(row.formatText),
    priceFrom: nonEmpty(row.priceFrom),
    specialOfferText: nonEmpty(row.specialOfferText),
    languages: (row.languageOptions || "").split(" or ").map((s) => s.trim()).filter(Boolean).map((s) => LANG_NAMES[s] || s),
    whoIsThisFor: audienceMap.get(row.courseAudienceReference) || [],
    whatYoullLearn: learningMap.get(row.courseLearningReference) || [],
    summary: row.shortDescription,
    sortOrder: Number(row.sortOrder) || undefined,
    metaTitle: nonEmpty(row.TrainingCourseMetaTitle),
    metaDescription: nonEmpty(row.TrainingCourseMetaDescription),
  });
}
summary.courses = courseRows.length;

// ---------------------------------------------------------------------
// 4. Fellows / coach profiles
// ---------------------------------------------------------------------
const profilesDir = path.join(CONTENT, "coach-profiles");
resetDir(profilesDir);
const fellowRows = readCsv("Fellows.csv");
const fellowIdToSlug = new Map(); // all fellows, for cross-reference resolution
const fellowIdToName = new Map();
const publishedFellowSlugs = new Set();
let draftFellowCount = 0;

for (const row of fellowRows) {
  fellowIdToSlug.set(row.ID, row.slug);
  fellowIdToName.set(row.ID, row.FellowName);
}

const PLACEHOLDER = "[PLACEHOLDER]";
const pipeList = (raw) => {
  if (!raw) return undefined;
  const parts = raw.split("|").map((s) => s.trim()).filter((s) => s && s !== PLACEHOLDER);
  return parts.length > 0 ? parts : undefined;
};
const realText = (raw) => {
  const v = nonEmpty(raw);
  return v && v !== PLACEHOLDER ? v : undefined;
};

for (const row of fellowRows) {
  if (row.Status !== "PUBLISHED") {
    draftFellowCount++;
    continue;
  }
  const bio = realText(row.bio);
  const hasFullProfile = Boolean(bio);

  writeEntry(profilesDir, row.slug, {
    name: row.FellowName,
    firstName: nonEmpty(row.FellowFirstName),
    role: row.AuthorTitle || row.Title,
    country: parseCountryField(row.Country),
    languages: parseLanguages(row.languages),
    photo: nonEmpty(row.photoUrl),
    linkedinUrl: nonEmpty(row.linkedinUrl),
    yearsExperience: realText(row.yearsExperience),
    hasFullProfile,
    bio,
    backgroundAndExpertise: realText(row.backgroundText),
    approach: realText(row.approachText),
    specialities: pipeList(row.specialties),
    certifications: pipeList(row.certifications),
    coursesDelivered: pipeList(row.coursesDelivered),
    displayOrder: Number(row.DisplayOrder) || 10,
  });
  publishedFellowSlugs.add(row.slug);
}
summary.fellowsPublished = publishedFellowSlugs.size;
summary.fellowsDraft = draftFellowCount;

// ---------------------------------------------------------------------
// 5. Training schedule
// ---------------------------------------------------------------------
const scheduleDir = path.join(CONTENT, "training-schedules");
resetDir(scheduleDir);
const scheduleRows = readCsv("TrainingSchedule.csv");
let scheduleSkipped = 0;
let scheduleWritten = 0;

function scheduleFormat(raw) {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if (v.startsWith("self-paced")) return "self-paced";
  if (v === "online") return "live-online";
  if (v === "in-person") return "in-person";
  return undefined;
}

for (const row of scheduleRows) {
  if (row.Status !== "PUBLISHED") {
    scheduleSkipped++;
    continue;
  }
  const courseSlug = courseIdToSlug.get(row.TrainingCourse);
  if (!courseSlug) {
    scheduleSkipped++;
    continue;
  }
  const format = scheduleFormat(row.format);
  const slug = row.sessionId.toLowerCase();

  const trainerId = nonEmpty(row.Trainer);
  const trainerSlug = trainerId ? fellowIdToSlug.get(trainerId) : undefined;
  const trainerIsPublished = trainerSlug && publishedFellowSlugs.has(trainerSlug);

  let location;
  if (format === "self-paced") {
    location = "Online";
  } else {
    location = [nonEmpty(row.city), nonEmpty(row.country)].filter(Boolean).join(", ");
  }

  writeEntry(scheduleDir, slug, {
    course: courseSlug,
    date: nonEmpty(row.startDate),
    format,
    location,
    trainer: trainerIsPublished ? trainerSlug : undefined,
    trainerName: !trainerIsPublished ? fellowIdToName.get(trainerId) : undefined,
    price: nonEmpty(row.priceLabel),
    offer: nonEmpty(row.specialOfferText),
    notes: nonEmpty(row.notes),
    status: nonEmpty(row.status) || "available",
  });
  scheduleWritten++;
}
summary.schedulePublished = scheduleWritten;
summary.scheduleSkipped = scheduleSkipped;

// ---------------------------------------------------------------------
// 6. Insights articles
// ---------------------------------------------------------------------
const articlesDir = path.join(CONTENT, "insights-articles");
resetDir(articlesDir);
const articleRows = readCsv("Insights.csv");
let articlesWritten = 0;
let articlesSkipped = 0;

for (const row of articleRows) {
  if (row.Status !== "PUBLISHED") {
    articlesSkipped++;
    continue;
  }
  if (!row.slug || !row.bodyContent) {
    articlesSkipped++;
    continue;
  }

  const authorId = nonEmpty(row.author);
  const authorSlug = authorId ? fellowIdToSlug.get(authorId) : undefined;
  const authorIsPublished = authorSlug && publishedFellowSlugs.has(authorSlug);

  writeEntry(articlesDir, row.slug, {
    title: row.Title,
    contentType: nonEmpty(row.contentType),
    primaryCategory: nonEmpty(row.primaryCategory),
    categories: (row.categories || "").split(",").map((s) => s.trim()).filter(Boolean),
    date: nonEmpty(row.publishedDate) || nonEmpty(row.lastModifiedDate),
    readTimeMinutes: Number(row.timeToRead) || undefined,
    author: authorIsPublished ? authorSlug : undefined,
    authorName: !authorIsPublished ? fellowIdToName.get(authorId) : undefined,
    excerpt: row.excerpt,
    featured: String(row.Featured).toLowerCase() === "true",
    metaTitle: nonEmpty(row.metaTitle),
    metaDescription: nonEmpty(row.metaDescription),
    bodyHtml: row.bodyContent,
  });
  articlesWritten++;
}
summary.articlesPublished = articlesWritten;
summary.articlesSkipped = articlesSkipped;

console.log(JSON.stringify(summary, null, 2));
