// Unit checks for withSlash() (src/lib/withSlash.ts), run under plain Node:
//   node --test scripts/check-with-slash.mjs      (also part of `npm run build`)
import test from "node:test";
import assert from "node:assert/strict";
import { withSlash } from "../src/lib/withSlash.ts";

const cases = [
  // pages gain the slash
  ["/training", "/training/"],
  ["/de/training", "/de/training/"],
  ["/training/kanban/kanban-system-design-(kmp1)", "/training/kanban/kanban-system-design-(kmp1)/"],
  ["/insights/agile-mishap-4:-incompetent-coaches-and-trainers", "/insights/agile-mishap-4:-incompetent-coaches-and-trainers/"],
  ["/insights/agile-mishap-1:-do-it-by-the-book!", "/insights/agile-mishap-1:-do-it-by-the-book!/"],
  ["/insights/scrum-3.0-explained", "/insights/scrum-3.0-explained/"],
  ["/insights/a,b", "/insights/a,b/"],
  // already fine
  ["/", "/"],
  ["/de/", "/de/"],
  ["/training/", "/training/"],
  // the empty prefix and the German prefix used for home links
  ["", "/"],
  ["/de", "/de/"],
  // anchors and queries survive, in either order of appearance
  ["/training#schedule", "/training/#schedule"],
  ["/training?topic=scrum", "/training/?topic=scrum"],
  ["/training?topic=scrum,kanban#schedule", "/training/?topic=scrum,kanban#schedule"],
  ["/training/#schedule", "/training/#schedule"],
  ["#schedule", "#schedule"],
  ["?x=1", "?x=1"],
  // files never get a slash
  ["/logo.png", "/logo.png"],
  ["/og-image.png", "/og-image.png"],
  ["/favicon.svg", "/favicon.svg"],
  ["/sitemap-index.xml", "/sitemap-index.xml"],
  ["/robots.txt", "/robots.txt"],
  ["/docs/brochure.pdf", "/docs/brochure.pdf"],
  ["/img/team.webp?v=2", "/img/team.webp?v=2"],
  ["/IMG/Photo.JPG", "/IMG/Photo.JPG"],
  // other people's URLs are untouched
  ["https://www.betterchange-consulting.com/blog", "https://www.betterchange-consulting.com/blog"],
  ["https://www.betterchange-consulting.it/", "https://www.betterchange-consulting.it/"],
  ["https://example.com/x", "https://example.com/x"],
  ["mailto:office@betterchange-consulting.de", "mailto:office@betterchange-consulting.de"],
  ["tel:+4930123", "tel:+4930123"],
  ["//cdn.example.com/x", "//cdn.example.com/x"],
  // this site's own absolute URLs are pages too
  ["https://betterchange-consulting.de", "https://betterchange-consulting.de/"],
  ["https://betterchange-consulting.de/about", "https://betterchange-consulting.de/about/"],
  ["https://www.betterchange-consulting.de/insights/what-is-scrum", "https://www.betterchange-consulting.de/insights/what-is-scrum/"],
  ["https://betterchange-consulting.de/about#team", "https://betterchange-consulting.de/about/#team"],
  ["https://betterchange-consulting.de/logo.png", "https://betterchange-consulting.de/logo.png"],
  // a look-alike host is not this site
  ["https://betterchange-consulting.dev/about", "https://betterchange-consulting.dev/about"],
];

for (const [input, expected] of cases) {
  test(`withSlash(${JSON.stringify(input)})`, () => assert.equal(withSlash(input), expected));
}

test("withSlash is idempotent", () => {
  for (const [, expected] of cases) assert.equal(withSlash(expected), expected);
});
