// Fails the build when a search title or description in the content
// collections breaks the limits that keep Google from cutting it off.
//
// BaseLayout appends " · Better Change" (16 characters) to every title and
// Google shows about 60 characters, so a metaTitle may be 45 characters at
// most. A metaDescription may be 155 at most and must be a whole sentence,
// never an excerpt cut off with an ellipsis.
//
// Checked for every `metaTitle` / `metaDescription` in src/content/**/*.md
// (articles, courses, categories, page copy, both languages):
//   - metaTitle longer than 45 characters
//   - metaDescription longer than 155 characters
//   - a leftover "[DE] " placeholder
//   - an em dash (house style)
//   - a metaDescription that ends in an ellipsis ("…" or "..."), except the
//     English articles listed in scripts/meta-ellipsis-baseline.txt, which
//     are existing excerpts nobody has rewritten yet. That list may only
//     shrink: a new ellipsis fails the build, and so does a listed file that
//     no longer needs its entry.
//
// Run on its own with `npm run check:meta`; `npm run build` runs it first.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(root, "src/content");
const baselinePath = join(root, "scripts/meta-ellipsis-baseline.txt");

export const LIMITS = { metaTitle: 45, metaDescription: 155 };

function* markdownFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(path);
    else if (entry.name.endsWith(".md")) yield path;
  }
}

// Reads the two meta fields straight out of the front matter instead of
// parsing the whole YAML, so the build needs no dev dependency. Handles the
// scalar styles used in src/content: plain, 'single', "double" (one line or
// wrapped) and the > / | block styles. Checked against js-yaml over every
// content file when it was written.
function metaFields(path) {
  const match = readFileSync(path, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const found = {};
  for (let i = 0; i < lines.length; i++) {
    const key = lines[i].match(/^(metaTitle|metaDescription):\s*(.*)$/);
    if (!key) continue;
    let [, name, rest] = key;
    const continuation = [];
    // Lines that belong to this value: indented, or blank inside a block.
    while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === "")) {
      continuation.push(lines[++i]);
    }
    while (continuation.length && continuation[continuation.length - 1].trim() === "") continuation.pop();
    const folded = (parts) => parts.map((part) => part.trim()).join(" ").trim();
    if (/^[>|][+-]?\s*$/.test(rest)) {
      found[name] = rest.startsWith("|") ? continuation.map((l) => l.trim()).join("\n") : folded(continuation);
    } else if (rest.startsWith('"')) {
      const text = folded([rest, ...continuation]);
      found[name] = text.slice(1, text.lastIndexOf('"')).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (_, esc) => {
        if (esc[0] === "u" || esc[0] === "x") return String.fromCharCode(parseInt(esc.slice(1), 16));
        return { n: "\n", t: "\t", '"': '"', "\\": "\\", "/": "/" }[esc] ?? esc;
      });
    } else if (rest.startsWith("'")) {
      const text = folded([rest, ...continuation]);
      found[name] = text.slice(1, text.lastIndexOf("'")).replace(/''/g, "'");
    } else {
      found[name] = folded([rest, ...continuation]);
    }
  }
  return found;
}

const baseline = new Set(
  existsSync(baselinePath)
    ? readFileSync(baselinePath, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
    : []
);

const problems = [];
const stillEllipsis = new Set();
let checked = 0;

for (const path of markdownFiles(contentDir)) {
  const rel = relative(contentDir, path);
  const data = metaFields(path);
  for (const field of ["metaTitle", "metaDescription"]) {
    const value = data[field];
    if (value === undefined || value === null) continue;
    checked++;
    const text = String(value);
    const fail = (message) => problems.push(`${rel}: ${field} ${message}`);
    if (text.length > LIMITS[field]) fail(`is ${text.length} characters, the limit is ${LIMITS[field]}: "${text}"`);
    if (text.startsWith("[DE]")) fail(`still has a "[DE]" placeholder: "${text}"`);
    if (text.includes("—")) fail(`contains an em dash: "${text}"`);
    if (field === "metaDescription" && /(…|\.\.\.)\s*$/.test(text)) {
      stillEllipsis.add(rel);
      if (!baseline.has(rel)) fail(`is cut off with an ellipsis, write a whole sentence: "${text}"`);
    }
  }
}

for (const rel of baseline) {
  if (!stillEllipsis.has(rel)) {
    problems.push(`${rel}: no longer ends in an ellipsis, remove it from scripts/meta-ellipsis-baseline.txt`);
  }
}

if (problems.length) {
  console.error(`Meta length check failed (${problems.length} problem${problems.length === 1 ? "" : "s"}):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    `\nLimits: metaTitle ${LIMITS.metaTitle} characters, metaDescription ${LIMITS.metaDescription}, whole sentences, no placeholders, no em dashes.`
  );
  process.exit(1);
}
console.log(
  `Meta length check passed: ${checked} metaTitle/metaDescription values (${stillEllipsis.size} English article descriptions still end in an ellipsis, see scripts/meta-ellipsis-baseline.txt).`
);
