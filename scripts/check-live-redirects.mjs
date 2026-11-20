// Run against a deployed copy of the site (a Netlify deploy preview or production) to confirm
// the trailing-slash behaviour the build cannot see, because it depends on the host:
//
//   node scripts/check-live-redirects.mjs https://deploy-preview-123--<site>.netlify.app
//
// For a handful of real pages it checks that
//   - the slashed URL answers 200 on its own (no redirect), and
//   - the unslashed URL answers a single 301 straight to the slashed URL (no 200 duplicate);
// and for every plain redirect rule in netlify.toml (no wildcards) that
//   - the old URL answers a single 301 whose Location is the rule's slashed target, and
//   - that target answers 200 on its own, so an old URL costs one hop, never a chain.
// Exits 1 with the failing URLs listed. Needs network access to the site, so it cannot run in CI
// without one; it never changes anything.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: node scripts/check-live-redirects.mjs <https://deploy-preview-N--site.netlify.app>");
  process.exit(2);
}

const PAGES = [
  "/",
  "/de/",
  "/training/",
  "/de/training/",
  "/training/kanban/",
  "/de/training/kanban/",
  "/insights/what-is-scrum-a-straight-answer-to-the-most-common-question-in-agile/",
  "/insights/agile-mishap-4:-incompetent-coaches-and-trainers/",
  "/contact/",
  "/about/",
];

function redirectRules() {
  const toml = readFileSync(fileURLToPath(new URL("../netlify.toml", import.meta.url)), "utf8");
  const rules = [];
  for (const block of toml.split("[[redirects]]").slice(1)) {
    const get = (key) => new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, "m").exec(block)?.[1];
    const from = get("from");
    const to = get("to");
    const status = /^\s*status\s*=\s*(\d+)/m.exec(block)?.[1];
    if (!from?.startsWith("/") || !to?.startsWith("/") || from.includes("*") || status !== "301") continue;
    rules.push({ from, to });
  }
  return rules;
}

const hop = async (path) => {
  const res = await fetch(base + path, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") };
};
const sameUrl = (location, expectedPath) => {
  if (!location) return false;
  const got = new URL(location, base + "/");
  const want = new URL(expectedPath, base + "/");
  return got.pathname === want.pathname && got.search === want.search;
};

const failures = [];
const fail = (url, why) => failures.push(`${url}  ${why}`);
let checks = 0;

for (const page of PAGES) {
  checks += 2;
  const slashed = await hop(page);
  if (slashed.status !== 200) fail(page, `expected 200, got ${slashed.status}${slashed.location ? ` -> ${slashed.location}` : ""}`);
  if (page === "/") continue;
  const bare = page.replace(/\/$/, "");
  const r = await hop(bare);
  if (r.status !== 301 || !sameUrl(r.location, page)) fail(bare, `expected one 301 to ${page}, got ${r.status}${r.location ? ` -> ${r.location}` : ""}`);
}

for (const { from, to } of redirectRules()) {
  checks += 2;
  const target = to.split("#")[0];
  const r = await hop(from);
  if (r.status !== 301 || !sameUrl(r.location, target)) fail(from, `expected one 301 to ${target}, got ${r.status}${r.location ? ` -> ${r.location}` : ""}`);
  if (!target.endsWith("/")) fail(from, `rule target ${to} has no trailing slash`);
  const final = await hop(target);
  if (final.status !== 200) fail(target, `redirect target should answer 200, got ${final.status}${final.location ? ` -> ${final.location}` : ""}`);
}

console.log(`check-live-redirects: ${checks} checks against ${base}, ${failures.length} failed.`);
for (const f of failures.slice(0, 60)) console.log("  " + f);
if (failures.length > 60) console.log(`  ... and ${failures.length - 60} more`);
process.exit(failures.length ? 1 : 0);
