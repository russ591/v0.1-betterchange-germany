// Fails the build when the built site links to one of its own pages without the
// trailing slash.
//
// Every page is published as <path>/index.html, so its real URL ends in "/".
// A link without the slash makes the host answer with a 301 first (Netlify's
// pretty URLs), which wastes crawl budget and, for canonicals and hreflang,
// points search engines at a URL that is not the final one. Build the link
// with withSlash() (src/i18n/utils.ts) instead of writing the path by hand.
//
// Usage: node scripts/check-internal-links.mjs [dist-dir]
//   --report   print the totals and the worst offenders but always exit 0
//   --json     print the totals as one JSON line (for before/after counts)
//
// What it looks at, in every dist/**/*.html:
//   - <a href>, <form action> (Netlify Forms redirect), <link href> (canonical, hreflang
//     alternates) and og:url
//   - internal means a path starting with "/" or an absolute URL on
//     betterchange-consulting.de (with or without www)
// What counts as a violation: the path resolves to a built page directory
// (dist/<path>/index.html) but does not end with "/". Links to files
// (.png, .pdf, .webp, .xml, ...) resolve to a file in dist and are fine.
// Paths that resolve to nothing in dist (Netlify redirect sources, API
// endpoints such as /.netlify/functions/...) are counted separately and never
// fail the check: they are not page links.
// It also checks netlify.toml: every internal redirect target must end in "/"
// (or be a file) and resolve to a built page, so an old URL needs one 301, not
// a 301 to the unslashed URL followed by a second 301 to the slashed one.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_HOSTS = new Set(["betterchange-consulting.de", "www.betterchange-consulting.de"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const unescapeHtml = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** Every internal link in one HTML file as { kind, href }. */
export function extractLinks(html) {
  const links = [];
  for (const m of html.matchAll(/<a\b[^>]*?\shref=("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    links.push({ kind: "a", href: unescapeHtml(m[2] ?? m[3] ?? m[4]) });
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = /\srel=["']?([^"'\s>]+)/i.exec(tag)?.[1];
    const href = /\shref=("([^"]*)"|'([^']*)')/i.exec(tag);
    if (href && (rel === "canonical" || rel === "alternate")) {
      links.push({ kind: rel === "canonical" ? "canonical" : "hreflang", href: unescapeHtml(href[2] ?? href[3]) });
    }
  }
  for (const m of html.matchAll(/<form\b[^>]*?\saction=("([^"]*)"|'([^']*)')/gi)) {
    links.push({ kind: "form-action", href: unescapeHtml(m[2] ?? m[3]) });
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (/\sproperty=["']og:url["']/i.test(tag)) {
      const content = /\scontent=("([^"]*)"|'([^']*)')/i.exec(tag);
      if (content) links.push({ kind: "og:url", href: unescapeHtml(content[2] ?? content[3]) });
    }
  }
  return links;
}

/** The site path of an internal link (no query, no hash), or null if it is not internal. */
export function internalPath(href) {
  const h = href.trim();
  if (!h || h.startsWith("#") || h.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) {
    let url;
    try {
      url = new URL(h);
    } catch {
      return null;
    }
    if (!/^https?:$/.test(url.protocol) || !SITE_HOSTS.has(url.hostname)) return null;
    return url.pathname || "/";
  }
  if (!h.startsWith("/")) return null; // relative to the page: none are expected, see below
  return h.split("#")[0].split("?")[0] || "/";
}

export function classify(distDir, path) {
  if (path.endsWith("/")) return "ok";
  const decoded = decode(path);
  const target = join(distDir, decoded);
  if (existsSync(target) && statSync(target).isFile()) return "file";
  if (existsSync(join(target, "index.html"))) return "page-without-slash";
  return "unresolved";
}

/** Internal `to = "/..."` targets in netlify.toml that would chain or point nowhere. */
export function badRedirectTargets(distDir, tomlPath) {
  if (!existsSync(tomlPath)) return [];
  const bad = [];
  for (const line of readFileSync(tomlPath, "utf8").split("\n")) {
    const m = /^\s*to\s*=\s*"(\/[^"]*)"/.exec(line);
    if (!m) continue;
    const target = m[1];
    if (target.startsWith("/.netlify/")) continue;
    const path = target.split("#")[0].split("?")[0];
    const result = classify(distDir, path);
    if (result === "page-without-slash") bad.push({ target, why: "no trailing slash (a second 301)" });
    else if (result === "unresolved") bad.push({ target, why: "does not resolve to a built page" });
    else if (result === "ok" && !existsSync(join(distDir, decode(path), "index.html"))) {
      bad.push({ target, why: "does not resolve to a built page" });
    }
  }
  return bad;
}

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const distDir = args.find((a) => !a.startsWith("--")) ?? fileURLToPath(new URL("../dist", import.meta.url));
  if (!existsSync(distDir)) {
    console.error(`check-internal-links: ${distDir} does not exist; run the build first.`);
    process.exit(2);
  }

  const files = walk(distDir);
  const violations = [];
  const unresolved = new Map();
  const relativeLinks = [];
  const byKind = {};
  let internal = 0;

  for (const file of files) {
    const page = "/" + relative(distDir, file).replace(/index\.html$/, "").replace(/\\/g, "/");
    for (const { kind, href } of extractLinks(readFileSync(file, "utf8"))) {
      const path = internalPath(href);
      if (path === null) {
        // A link like "about" or "../x" would resolve against the page URL, which is
        // a trailing-slash directory: flag it, since it is never what was meant.
        if (!/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("#") && !href.startsWith("//") && href.trim() && !href.startsWith("/")) {
          relativeLinks.push({ page, kind, href });
        }
        continue;
      }
      internal++;
      const result = classify(distDir, path);
      if (result === "page-without-slash") {
        violations.push({ page, kind, href });
        byKind[kind] = (byKind[kind] ?? 0) + 1;
      } else if (result === "unresolved") {
        const list = unresolved.get(path) ?? [];
        list.push(page);
        unresolved.set(path, list);
      }
    }
  }

  const redirectProblems = badRedirectTargets(distDir, fileURLToPath(new URL("../netlify.toml", import.meta.url)));
  const distinct = new Set(violations.map((v) => v.href.split("#")[0].split("?")[0])).size;
  const summary = {
    pages: files.length,
    internalLinks: internal,
    withoutSlash: violations.length,
    distinctTargets: distinct,
    byKind,
    relativeLinks: relativeLinks.length,
    unresolved: unresolved.size,
    redirectTargetProblems: redirectProblems.length,
  };

  if (flags.has("--json")) {
    console.log(JSON.stringify(summary));
    return;
  }

  console.log(
    `check-internal-links: ${files.length} pages, ${internal} internal links, ` +
      `${violations.length} to a page without the trailing slash (${distinct} distinct targets), ` +
      `${unresolved.size} paths that resolve to nothing in dist (redirect sources, functions; not checked).`
  );
  if (Object.keys(byKind).length) console.log(`  by kind: ${JSON.stringify(byKind)}`);

  if (violations.length) {
    const grouped = new Map();
    for (const v of violations) {
      const key = v.href;
      grouped.set(key, [...(grouped.get(key) ?? []), v.page]);
    }
    const rows = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [href, pages] of rows.slice(0, 25)) {
      console.log(`  ${href}  (${pages.length}x, e.g. ${pages[0]})`);
    }
    if (rows.length > 25) console.log(`  ... and ${rows.length - 25} more distinct links`);
  }
  if (relativeLinks.length) {
    console.log(`  ${relativeLinks.length} page-relative links (resolve against the trailing-slash page URL):`);
    for (const r of relativeLinks.slice(0, 10)) console.log(`    ${r.page}  ${r.kind}  ${r.href}`);
  }

  if (redirectProblems.length) {
    console.log(`  ${redirectProblems.length} netlify.toml redirect targets that chain or point nowhere:`);
    for (const r of redirectProblems.slice(0, 25)) console.log(`    ${r.target}  (${r.why})`);
  }

  if (!flags.has("--report") && (violations.length || relativeLinks.length || redirectProblems.length)) {
    console.error(
      "\ncheck-internal-links: FAIL. Build internal page links with withSlash() (src/i18n/utils.ts), " +
        "or add the trailing slash to a hard-coded path, so the link points at the final URL."
    );
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
