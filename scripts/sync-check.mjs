#!/usr/bin/env node
// Detects what has changed on betterchange-consulting.com since the last
// sync and prints it. Makes NO content decisions and writes nothing to the
// site: the daily sync session (docs/sync-runbook.md) reads this output and
// does the work. The only file this script ever writes is sync/state.json,
// and only with --baseline or --record.
//
//   npm run sync:check                      diff the latest .com snapshot (pushed by
//                                           the .com site to the com-snapshot
//                                           Netlify Function) against sync/state.json
//   npm run sync:check -- --api             read the .com REST API directly instead
//                                           (fallback; .com's anti-bot check blocks
//                                           most automated networks)
//   npm run sync:check -- --baseline        record EVERYTHING currently on .com as
//                                           already seen (first-time setup), and
//                                           list recent posts that may be missing
//                                           on .de (information only)
//   npm run sync:check -- --record          after a sync PR: mark the current .com
//                                           state as seen (same as --baseline, but
//                                           keeps baselinedAt)
//   npm run sync:check -- --from-dir <dir>  read posts.json / events.json /
//                                           types.json saved earlier instead of
//                                           fetching (see --save-dir)
//   npm run sync:check -- --save-dir <dir>  save the raw API responses for reuse
//   npm run sync:check -- --apply-source-ids
//                                           write sourceId/sourceUrl into existing
//                                           session files that match a .com event
//                                           (same registration URL, or same course
//                                           and start date); works in any mode
//   npm run sync:check -- --forget 123,456  drop these post/event ids from
//                                           sync/state.json first, so they count as
//                                           new again on this and later runs
//   npm run sync:check -- --json            machine-readable output
//
// Snapshot source (default): GET $COM_SNAPSHOT_URL (defaults to the .de
// site's com-snapshot function) with the shared secret from $COM_SYNC_SECRET
// in the X-Sync-Secret header. A snapshot older than 48 hours is reported as
// a question, so a broken push on the .com side doesn't go unnoticed.
//
// Network: Node's fetch only honours HTTPS_PROXY with NODE_USE_ENV_PROXY=1
// (Node 22.21+); the cloud sandbox needs that. In --api mode the .com host
// sits behind SiteGround's anti-bot check, which answers automated requests
// with an HTML challenge instead of JSON; this script recognises that page
// and says so rather than pretending the site is empty.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STATE_PATH = join(ROOT, "sync", "state.json");
const SESSIONS_DIR = join(ROOT, "src", "content", "training-schedules");
const ARTICLES_DIR = join(ROOT, "src", "content", "insights-articles");
const COURSES_DIR = join(ROOT, "src", "content", "training-courses");

const BASE = "https://www.betterchange-consulting.com";
const POSTS_URL = `${BASE}/wp-json/wp/v2/posts`;
const TYPES_URL = `${BASE}/wp-json/wp/v2/types`;
const EVENTS_URL = `${BASE}/wp-json/tribe/events/v1/events`;

const SNAPSHOT_URL = process.env.COM_SNAPSHOT_URL || "https://betterchange-consulting.de/.netlify/functions/com-snapshot";
const SNAPSHOT_MAX_AGE_HOURS = 48;

const GERMANY = new Set(["germany", "deutschland", "de"]);
const OWN_TRAINER = /russell\s+hill/i;
const WEBINAR = /(^|\/)webinar(\/|$)/i;
// Post types that are people, not articles. Never imported; a new one is
// listed in the run summary so Russ can update the About page.
const PROFILE_TYPES = new Set(["fellow"]);

// ---------------------------------------------------------------- args ----
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const MODE = flag("--baseline") ? "baseline" : flag("--record") ? "record" : "check";
const FROM_DIR = opt("--from-dir");
const USE_API = flag("--api");
const SAVE_DIR = opt("--save-dir");
const APPLY_IDS = flag("--apply-source-ids");
const JSON_OUT = flag("--json");
const FORGET = (opt("--forget") || "").split(",").map((x) => x.trim()).filter(Boolean);

// --------------------------------------------------------------- fetch ----
class ChallengeError extends Error {}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "betterchange-de-sync/1 (+https://betterchange-consulting.de)" },
  });
  const text = await res.text();
  if (/sgcaptcha|\.well-known\/sgcaptcha/.test(text) || (res.status === 202 && text.trim().startsWith("<html"))) {
    throw new ChallengeError(
      `${url} answered with SiteGround's anti-bot challenge page instead of JSON. ` +
        `Automated requests from this network are being blocked on the .com side; ` +
        `run this script from a network that can reach the API, or save the responses with --save-dir and use --from-dir.`
    );
  }
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}: ${text.slice(0, 200)}`);
  return { body: JSON.parse(text), headers: res.headers };
}

async function fetchAllPosts() {
  const out = [];
  for (let page = 1; ; page++) {
    const url = `${POSTS_URL}?per_page=100&page=${page}&_embed=1&status=publish&orderby=date&order=desc`;
    const { body, headers } = await getJson(url);
    out.push(...body);
    const totalPages = Number(headers.get("x-wp-totalpages") || 1);
    if (page >= totalPages || body.length === 0) break;
  }
  return out;
}

async function fetchTypes() {
  const { body } = await getJson(TYPES_URL);
  return body;
}

// Any extra public post type (the site uses Custom Post Type UI) is fetched
// through its own rest_base and treated like posts.
async function fetchExtraTypePosts(types) {
  const extra = {};
  for (const [slug, t] of Object.entries(types || {})) {
    if (["post", "page", "attachment", "tribe_events", "tribe_venue", "tribe_organizer", "nav_menu_item", "wp_block", "wp_template", "wp_template_part", "wp_navigation", "wp_font_family", "wp_font_face", "wp_global_styles"].includes(slug)) continue;
    if (!t.rest_base) continue;
    const items = [];
    for (let page = 1; ; page++) {
      const url = `${BASE}/wp-json/wp/v2/${t.rest_base}?per_page=100&page=${page}&_embed=1`;
      let body, headers;
      try {
        ({ body, headers } = await getJson(url));
      } catch (e) {
        if (e instanceof ChallengeError) throw e;
        break; // type not exposed over REST after all
      }
      items.push(...body);
      const totalPages = Number(headers.get("x-wp-totalpages") || 1);
      if (page >= totalPages || body.length === 0) break;
    }
    extra[slug] = { name: t.name, rest_base: t.rest_base, items };
  }
  return extra;
}

async function fetchAllEvents() {
  const out = [];
  let url = `${EVENTS_URL}?per_page=50&page=1&start_date=2000-01-01`;
  for (let guard = 0; url && guard < 50; guard++) {
    const { body } = await getJson(url);
    out.push(...(body.events || []));
    url = body.next_rest_url || null;
  }
  return out;
}

async function loadFromSnapshot() {
  const secret = process.env.COM_SYNC_SECRET;
  if (!secret) {
    throw new Error("COM_SYNC_SECRET is not set; it is the shared secret the com-snapshot function expects in the X-Sync-Secret header (or use --api / --from-dir).");
  }
  const res = await fetch(SNAPSHOT_URL, { headers: { Accept: "application/json", "X-Sync-Secret": secret } });
  const text = await res.text();
  if (res.status === 401) throw new Error(`${SNAPSHOT_URL} rejected the secret (401); check COM_SYNC_SECRET.`);
  if (res.status === 404) throw new Error(`${SNAPSHOT_URL} has no snapshot yet (404); the .com snippet has not pushed one.`);
  if (!res.ok) throw new Error(`${SNAPSHOT_URL} -> HTTP ${res.status}: ${text.slice(0, 200)}`);
  const snap = JSON.parse(text);
  const events = Array.isArray(snap.events) ? snap.events : (snap.events && snap.events.events) || [];
  return { posts: snap.posts || [], events, types: snap.types || {}, extra: snap.extraTypes || snap.extra || {}, snapshot: { generatedAt: snap.generatedAt || null, receivedAt: snap.receivedAt || null, trigger: snap.trigger || null, site: snap.site || null } };
}

function loadFromDir(dir) {
  const read = (name) => {
    const p = join(dir, name);
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  };
  const posts = read("posts.json") || [];
  const eventsRaw = read("events.json") || [];
  const events = Array.isArray(eventsRaw) ? eventsRaw : eventsRaw.events || [];
  const types = read("types.json") || {};
  const extra = read("extra-types.json") || {};
  return { posts, events, types, extra };
}

// ---------------------------------------------------------- normalise ----
function stripHtml(s) {
  return String(s || "").replace(/<[^>]+>/g, "").replace(/&#8217;|&rsquo;/g, "'").replace(/&amp;/g, "&").replace(/&#8211;|&ndash;/g, "-").replace(/&#8212;|&mdash;/g, "-").replace(/\s+/g, " ").trim();
}

function postCategories(post) {
  const terms = (post._embedded && post._embedded["wp:term"]) || [];
  const cats = [];
  for (const group of terms) for (const t of group || []) if (t.taxonomy === "category") cats.push({ slug: t.slug, name: t.name });
  return cats;
}

function normalisePost(post, typeSlug = "post") {
  const cats = postCategories(post);
  const link = post.link || "";
  const isWebinar = WEBINAR.test(new URL(link, BASE).pathname) || cats.some((c) => /webinar/i.test(c.slug));
  const author = post._embedded && post._embedded.author && post._embedded.author[0];
  return {
    id: String(post.id),
    type: typeSlug,
    title: stripHtml(post.title && post.title.rendered),
    slug: post.slug,
    link,
    date: post.date_gmt || post.date,
    modified: post.modified_gmt || post.modified,
    categories: cats.map((c) => c.slug),
    author: author ? author.name : null,
    lang: post.lang || post.language || null,
    webinar: isWebinar,
  };
}

function venueOf(ev) {
  const v = Array.isArray(ev.venue) ? ev.venue[0] : ev.venue;
  return v && typeof v === "object" ? v : null;
}

function normaliseEvent(ev) {
  const v = venueOf(ev);
  const organizers = (Array.isArray(ev.organizer) ? ev.organizer : ev.organizer ? [ev.organizer] : [])
    .map((o) => (typeof o === "object" ? o.organizer : o))
    .filter(Boolean);
  const title = stripHtml(ev.title);
  const country = v && v.country ? String(v.country) : null;
  const city = v && v.city ? String(v.city) : null;
  const venueName = v && v.venue ? String(v.venue) : null;
  const online = /online|virtual|remote|zoom/i.test([venueName, city, title, ev.description ? stripHtml(ev.description).slice(0, 200) : ""].filter(Boolean).join(" ")) || (!v && /online/i.test(title));
  return {
    id: String(ev.id),
    title,
    url: ev.url || null,
    // The site-local date, not the UTC one: .com stores events at midnight
    // Europe/Berlin, so utc_start_date is 22:00 the evening before and would
    // shift every event back a day (and every synced session file's name
    // with it).
    start: (ev.start_date || ev.utc_start_date || "").slice(0, 10),
    end: (ev.end_date || ev.utc_end_date || "").slice(0, 10),
    cost: ev.cost || (ev.cost_details && ev.cost_details.values && ev.cost_details.values.join("-")) || null,
    registrationUrl: ev.website || null,
    modified: ev.modified_utc || ev.modified || null,
    country,
    city,
    venue: venueName,
    online,
    organizers,
    categories: (ev.categories || []).map((c) => c.slug || c.name).filter(Boolean),
  };
}

// The brief's rule: skip Germany; sync online events unless Russell Hill
// runs them; anything undeterminable is a question, never a guess.
function classifyEvent(e) {
  if (e.country && GERMANY.has(e.country.trim().toLowerCase())) return { kind: "skip", reason: "venue in Germany (Russ adds these himself)" };
  const trainer = e.organizers.join(", ");
  if (e.online) {
    if (!trainer) return { kind: "question", reason: "online event with no organizer/trainer on .com; cannot tell whether it is Russell Hill's" };
    if (OWN_TRAINER.test(trainer)) return { kind: "skip", reason: "Russell Hill's own online course (Russ adds these himself)" };
    return { kind: "sync" };
  }
  if (!e.country) return { kind: "question", reason: "no venue country on .com; cannot tell whether it is in Germany" };
  return { kind: "sync" };
}

const codeKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Which .de course an event belongs to: the certification code in brackets in
// its title ("Certified Scrum Master (CSM)", "Kanban System Design (KMP 1)"),
// or, for courses without a code ("AI for Product Owners"), the course name
// itself. null when there is no such course page here; the sync never
// creates one, so that event becomes a question.
function courseForEvent(e, courses) {
  const title = String(e.title || "");
  const bracketed = [...title.matchAll(/\(([^()]+)\)/g)].map((m) => codeKey(m[1].replace(/[®™]/g, "")));
  for (const code of bracketed) {
    if (!code) continue;
    const hit = courses.find((c) => [c.code, c.certification].filter(Boolean).some((x) => codeKey(x) === code));
    if (hit) return hit.id;
  }
  const bare = normTitle(title.replace(/\([^()]*\)/g, ""));
  const byName = courses.find((c) => bare && normTitle(String(c.name || "").replace(/\([^()]*\)/g, "")) === bare);
  return byName ? byName.id : null;
}

// classifyEvent plus the course check: an event the sync would otherwise
// import but has no course page here is a question, never a new page.
function decideEvent(e, courses) {
  const cls = classifyEvent(e);
  if (cls.kind !== "sync") return cls;
  const course = courseForEvent(e, courses);
  if (!course) return { kind: "question", reason: "no matching .de course page for this event (the sync never creates course pages)" };
  return { kind: "sync", course };
}

const EVENT_FINGERPRINT = ["start", "end", "cost", "registrationUrl", "title", "country", "city"];
function eventChanges(prev, next) {
  return EVENT_FINGERPRINT.filter((k) => (prev[k] || null) !== (next[k] || null)).map((k) => ({ field: k, from: prev[k] || null, to: next[k] || null }));
}

// ------------------------------------------------------ local content ----
function readFrontmatter(path) {
  const text = readFileSync(path, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].replace(/^['"]|['"]$/g, "");
  }
  return { fm, text };
}

function localSessions() {
  return readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const path = join(SESSIONS_DIR, f);
      const { fm } = readFrontmatter(path);
      return { file: `src/content/training-schedules/${f}`, path, ...fm };
    });
}

function localArticles() {
  return readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { fm } = readFrontmatter(join(ARTICLES_DIR, f));
      return { file: f, slug: f.replace(/\.md$/, ""), title: fm.title || "", urlSlug: fm.urlSlug || "", sourceId: fm.sourceId || "" };
    });
}

function localCourses() {
  return readdirSync(COURSES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { fm } = readFrontmatter(join(COURSES_DIR, f));
      return { id: f.replace(/\.md$/, ""), name: fm.name || "", code: fm.code || "", certification: fm.certification || "" };
    });
}

function normTitle(s) {
  return stripHtml(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// A .com post "seems to exist on .de" when its slug or normalised title
// matches an article file, urlSlug or title here.
function postExistsLocally(post, articles) {
  const t = normTitle(post.title);
  return articles.some((a) => a.slug === post.slug || a.urlSlug === post.slug || normTitle(a.title) === t || a.sourceId === post.id);
}

// Matches an existing session to a .com event by the same registration URL
// (the session's externalUrl against the event's "website" field), or by the
// same course and the same start date. Reported, and only written with
// --apply-source-ids. One candidate is a match; more than one is ambiguous
// and left alone.
const normUrl = (u) => String(u || "").trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "").replace(/\/+\?/, "?");

function matchSessionsToEvents(sessions, events, courses) {
  const matches = [];
  // Only events the sync could own. A German or Russell's-own event must
  // never be linked to one of Russ's sessions, or the sync would start
  // editing it.
  events = events.filter((e) => classifyEvent(e).kind !== "skip");
  for (const s of sessions) {
    if (s.sourceId || !s.date) continue;
    const day = String(s.date).slice(0, 10);
    const url = normUrl(s.externalUrl);
    const candidates = [];
    for (const e of events) {
      const byUrl = Boolean(url) && normUrl(e.registrationUrl) === url;
      const byDate = e.start === day && courseForEvent(e, courses) === s.course;
      if (byUrl || byDate) candidates.push({ event: e, basis: byUrl && byDate ? "url+date" : byUrl ? "url" : "date" });
    }
    if (candidates.length === 1) matches.push({ session: s, event: candidates[0].event, basis: candidates[0].basis });
    else if (candidates.length > 1) matches.push({ session: s, ambiguous: candidates.map((c) => `${c.event.id} (${c.basis})`) });
  }
  return matches;
}

function applySourceIds(matches) {
  let n = 0;
  for (const m of matches) {
    if (!m.event) continue;
    const { text } = readFrontmatter(m.session.path);
    if (/^sourceId:/m.test(text)) continue;
    const updated = text.replace(/\n---/, `\nsourceId: '${m.event.id}'\nsourceUrl: ${m.event.url}\n---`);
    writeFileSync(m.session.path, updated);
    n++;
  }
  return n;
}

// ---------------------------------------------------------------- main ----
function loadState() {
  return JSON.parse(readFileSync(STATE_PATH, "utf8"));
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

async function main() {
  let raw;
  if (FROM_DIR) {
    raw = loadFromDir(resolve(FROM_DIR));
  } else if (!USE_API) {
    raw = await loadFromSnapshot();
    if (SAVE_DIR) {
      const dir = resolve(SAVE_DIR);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "posts.json"), JSON.stringify(raw.posts, null, 2));
      writeFileSync(join(dir, "events.json"), JSON.stringify(raw.events, null, 2));
      writeFileSync(join(dir, "types.json"), JSON.stringify(raw.types, null, 2));
      writeFileSync(join(dir, "extra-types.json"), JSON.stringify(raw.extra, null, 2));
    }
  } else {
    const types = await fetchTypes();
    const [posts, events, extra] = await Promise.all([fetchAllPosts(), fetchAllEvents(), fetchExtraTypePosts(types)]);
    raw = { posts, events, types, extra };
    if (SAVE_DIR) {
      const dir = resolve(SAVE_DIR);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "posts.json"), JSON.stringify(posts, null, 2));
      writeFileSync(join(dir, "events.json"), JSON.stringify(events, null, 2));
      writeFileSync(join(dir, "types.json"), JSON.stringify(types, null, 2));
      writeFileSync(join(dir, "extra-types.json"), JSON.stringify(extra, null, 2));
    }
  }

  const posts = raw.posts.map((p) => normalisePost(p, "post"));
  for (const [slug, t] of Object.entries(raw.extra || {})) for (const item of t.items || []) posts.push(normalisePost(item, slug));
  const events = raw.events.map(normaliseEvent);
  const publicTypes = Object.entries(raw.types || {})
    .filter(([slug, t]) => !["attachment", "nav_menu_item", "wp_block", "wp_template", "wp_template_part", "wp_navigation", "wp_font_family", "wp_font_face", "wp_global_styles"].includes(slug))
    .map(([slug, t]) => `${slug}${t.rest_base && t.rest_base !== slug ? ` (rest: ${t.rest_base})` : ""}`);
  const resourcesType = Object.keys(raw.types || {}).find((k) => /resource/i.test(k)) || null;

  const state = loadState();
  if (FORGET.length) {
    for (const id of FORGET) {
      delete state.posts[id];
      delete state.events[id];
    }
    saveState(state);
  }
  const articles = localArticles();
  const sessions = localSessions();
  const courses = localCourses();

  const report = { mode: MODE, generatedAt: new Date().toISOString(), source: FROM_DIR ? "dir" : USE_API ? "api" : "snapshot", snapshot: raw.snapshot || null, postTypes: publicTypes, resourcesType, newPosts: [], newFellows: [], skippedWebinars: 0, newEvents: [], changedEvents: [], removedEvents: [], skippedEvents: [], questions: [], possiblyMissingOnDe: [], sessionMatches: [], forgotten: FORGET, counts: {} };

  // A stale snapshot means the .com snippet has stopped pushing; say so as a
  // question rather than quietly diffing old data.
  if (raw.snapshot && raw.snapshot.generatedAt) {
    const ageHours = (Date.now() - new Date(raw.snapshot.generatedAt).getTime()) / 3_600_000;
    if (!Number.isFinite(ageHours) || ageHours > SNAPSHOT_MAX_AGE_HOURS) {
      report.questions.push({ id: "snapshot", title: "Stale .com snapshot", start: raw.snapshot.generatedAt, url: SNAPSHOT_URL, reason: `the latest snapshot was generated ${Number.isFinite(ageHours) ? Math.round(ageHours) + " hours" : "an unknown time"} ago (limit ${SNAPSHOT_MAX_AGE_HOURS}); the snippet on .com may have stopped pushing` });
    }
  }

  // ---- posts
  for (const p of posts) {
    if (p.webinar) {
      report.skippedWebinars++;
      continue;
    }
    if (state.posts[p.id]) continue;
    if (PROFILE_TYPES.has(p.type)) report.newFellows.push(p);
    else report.newPosts.push(p);
  }

  // ---- events
  const seenNow = new Set();
  for (const e of events) {
    seenNow.add(e.id);
    const cls = decideEvent(e, courses);
    if (cls.kind === "skip") {
      report.skippedEvents.push({ id: e.id, title: e.title, start: e.start, reason: cls.reason });
      continue;
    }
    if (cls.kind === "question") {
      // Raised once; raised again only if the event itself changes, so a
      // known open question doesn't come back every single day.
      const prev = state.events[e.id];
      if (!prev || !prev.question || eventChanges(prev, e).length) report.questions.push({ id: e.id, title: e.title, start: e.start, url: e.url, reason: cls.reason });
      continue;
    }
    const prev = state.events[e.id];
    if (!prev) report.newEvents.push({ ...e, course: cls.course });
    else {
      const ch = eventChanges(prev, e);
      if (ch.length) report.changedEvents.push({ ...e, changes: ch });
    }
  }
  for (const [id, prev] of Object.entries(state.events)) {
    if (!seenNow.has(id) && !prev.skipped && !prev.question) report.removedEvents.push({ id, ...prev });
  }

  // ---- baseline extras: possibly-missing recent posts, session matches
  if (MODE === "baseline") {
    const cutoff = Date.now() - 183 * 86_400_000;
    for (const p of posts) {
      if (p.webinar || PROFILE_TYPES.has(p.type)) continue;
      if (new Date(p.date).getTime() < cutoff) continue;
      if (!postExistsLocally(p, articles)) report.possiblyMissingOnDe.push({ id: p.id, title: p.title, date: p.date.slice(0, 10), link: p.link });
    }
  }
  if (MODE === "baseline" || APPLY_IDS) {
    report.sessionMatches = matchSessionsToEvents(sessions, events, courses).map((m) => ({
      session: m.session.file,
      eventId: m.event ? m.event.id : null,
      eventTitle: m.event ? m.event.title : null,
      basis: m.basis || null,
      ambiguous: m.ambiguous || null,
    }));
    if (APPLY_IDS) report.counts.sourceIdsWritten = applySourceIds(matchSessionsToEvents(sessions, events, courses));
  }

  // ---- record state
  if (MODE === "baseline" || MODE === "record") {
    const next = { ...state, version: 1, baselinedAt: state.baselinedAt || new Date().toISOString(), recordedAt: new Date().toISOString() };
    next.source.postTypes = publicTypes;
    next.posts = {};
    for (const p of posts) next.posts[p.id] = { type: p.type, slug: p.slug, link: p.link, date: p.date, modified: p.modified, title: p.title, webinar: p.webinar };
    next.events = {};
    for (const e of events) {
      const cls = decideEvent(e, courses);
      next.events[e.id] = { title: e.title, url: e.url, start: e.start, end: e.end, cost: e.cost, registrationUrl: e.registrationUrl, modified: e.modified, country: e.country, city: e.city, online: e.online, organizers: e.organizers, skipped: cls.kind === "skip" ? cls.reason : null, question: cls.kind === "question" ? cls.reason : null };
    }
    saveState(next);
  }

  report.counts = {
    ...report.counts,
    postsOnCom: posts.length,
    webinarsOnCom: posts.filter((p) => p.webinar).length,
    eventsOnCom: events.length,
    eventsGermanOrOwn: report.skippedEvents.length,
    eventsUndecided: events.filter((e) => decideEvent(e, courses).kind === "question").length,
    eventsSyncable: events.filter((e) => decideEvent(e, courses).kind === "sync").length,
    fellowsOnCom: posts.filter((p) => PROFILE_TYPES.has(p.type)).length,
    postsInState: Object.keys(loadState().posts).length,
    eventsInState: Object.keys(loadState().events).length,
    localSessionsWithSourceId: localSessions().filter((s) => s.sourceId).length,
    localExternalSessions: sessions.filter((s) => s.isExternal === "true").length,
  };

  const nothingToSync = !report.newPosts.length && !report.newEvents.length && !report.changedEvents.length && !report.removedEvents.length && !report.questions.length;
  const nothing = MODE === "check" && nothingToSync && !report.newFellows.length;

  if (JSON_OUT) {
    console.log(JSON.stringify({ ...report, nothingToSync: MODE === "check" && nothingToSync, nothingToDo: nothing }, null, 2));
    return;
  }

  const c = report.counts;
  console.log(`sync:check (${MODE}) at ${report.generatedAt}, source: ${report.source}${report.snapshot && report.snapshot.generatedAt ? ` (snapshot generated ${report.snapshot.generatedAt}, received ${report.snapshot.receivedAt || "?"}, trigger ${report.snapshot.trigger || "?"})` : ""}`);
  console.log(`  .com: ${c.postsOnCom} posts (${c.webinarsOnCom} webinar announcements, ignored; ${c.fellowsOnCom} Fellow profiles, information only), ${c.eventsOnCom} events (${c.eventsGermanOrOwn} German or Russell's own, skipped; ${c.eventsSyncable} syncable; ${c.eventsUndecided} undecided)`);
  console.log(`  post types on .com: ${report.postTypes.join(", ") || "(unknown)"}; separate "resources" type: ${report.resourcesType || "none found"}`);
  console.log(`  state: ${c.postsInState} posts, ${c.eventsInState} events recorded; ${c.localSessionsWithSourceId} local sessions carry a sourceId (${c.localExternalSessions} external sessions in total)`);
  if (FORGET.length) console.log(`  forgot ${FORGET.length} id(s) from sync/state.json first: ${FORGET.join(", ")}`);
  if (MODE === "check") {
    if (nothing) {
      console.log("\nNothing to do.");
      return;
    }
    if (nothingToSync) console.log("\nNothing to sync; information only:");
    const section = (title, items, fmt) => {
      if (!items.length) return;
      console.log(`\n${title} (${items.length})`);
      for (const i of items) console.log(`  - ${fmt(i)}`);
    };
    section("New posts (non-webinar; resources count as posts)", report.newPosts, (p) => `#${p.id} ${p.title} [${p.date.slice(0, 10)}${p.author ? `, ${p.author}` : ""}${p.type !== "post" ? `, type ${p.type}` : ""}] ${p.link}`);
    section("New non-German events", report.newEvents, (e) => `#${e.id} ${e.title} | course: ${e.course} | ${e.start}${e.end && e.end !== e.start ? ` to ${e.end}` : ""} | ${[e.city, e.country].filter(Boolean).join(", ") || (e.online ? "Online" : "?")} | ${e.cost || "no cost given"} | trainer: ${e.organizers.join(", ") || "?"} | ${e.registrationUrl || e.url}`);
    section("Changed non-German events", report.changedEvents, (e) => `#${e.id} ${e.title}: ${e.changes.map((ch) => `${ch.field} ${ch.from} -> ${ch.to}`).join("; ")}`);
    section("Removed or cancelled non-German events", report.removedEvents, (e) => `#${e.id ?? "?"} ${e.title} | ${e.start}`);
    section("Questions for Russ", report.questions, (q) => `#${q.id} ${q.title} (${q.start}): ${q.reason} ${q.url || ""}`);
    section("New Fellows on .com (information only, never imported; update the About page by hand)", report.newFellows, (p) => `${p.title} [${p.date.slice(0, 10)}] ${p.link}`);
    if (APPLY_IDS) {
      console.log(`\nExisting sessions matched to .com events (${report.sessionMatches.filter((m) => m.eventId).length} matched, ${report.sessionMatches.filter((m) => m.ambiguous).length} ambiguous), ${c.sourceIdsWritten} sourceIds written:`);
      for (const m of report.sessionMatches) console.log(`  - ${m.session} -> ${m.eventId ? `#${m.eventId} ${m.eventTitle} (matched by ${m.basis})` : `ambiguous: ${m.ambiguous.join(", ")}`}`);
      const unmatched = sessions.filter((s) => s.isExternal === "true" && !s.sourceId && !report.sessionMatches.some((m) => m.session === s.file));
      if (unmatched.length) {
        console.log(`\nExternal sessions with no .com event in the snapshot (${unmatched.length}; check whether they still run):`);
        for (const s of unmatched) console.log(`  - ${s.file} | ${s.course} | ${String(s.date).slice(0, 10)} | ${s.location || "?"} | ${s.externalUrl || ""}`);
      }
    }
  } else {
    console.log(`\nState ${MODE === "baseline" ? "baselined" : "recorded"} in sync/state.json.`);
    if (report.possiblyMissingOnDe.length) {
      console.log(`\nRecent .com posts (last 6 months, non-webinar) with no obvious counterpart on .de, for information only (${report.possiblyMissingOnDe.length}):`);
      for (const p of report.possiblyMissingOnDe) console.log(`  - #${p.id} ${p.title} [${p.date}] ${p.link}`);
    } else if (MODE === "baseline") console.log("\nNo recent non-webinar .com posts look missing on .de.");
    if (report.sessionMatches.length) {
      console.log(`\nExisting sessions matched to .com events (${report.sessionMatches.filter((m) => m.eventId).length} matched, ${report.sessionMatches.filter((m) => m.ambiguous).length} ambiguous)${APPLY_IDS ? `, ${c.sourceIdsWritten} sourceIds written` : ", not written (add --apply-source-ids)"}:`);
      for (const m of report.sessionMatches) console.log(`  - ${m.session} -> ${m.eventId ? `#${m.eventId} ${m.eventTitle} (matched by ${m.basis})` : `ambiguous: ${m.ambiguous.join(", ")}`}`);
    }
    if (report.questions.length) {
      console.log(`\nEvents that need a decision before they can ever sync (${report.questions.length}):`);
      for (const q of report.questions) console.log(`  - #${q.id} ${q.title} (${q.start}): ${q.reason}`);
    }
  }
}

main().catch((e) => {
  console.error(`sync:check failed: ${e.message}`);
  process.exit(e instanceof ChallengeError ? 3 : 1);
});
