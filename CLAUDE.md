# CLAUDE.md — betterchange-consulting.de

Context and conventions for any Claude Code session working on this repo. Read this in full before making changes. If you discover a new convention, gotcha, or decision during your session, **add it here** so other sessions (running on other branches) benefit from it too.

## Project overview

Full rebuild of betterchange-consulting.de from Wix Studio to a coded Astro site, deployed on Netlify. Bilingual site (English + German), stack: Astro, Netlify, GitHub, Google Workspace SMTP for email, Lexware Office XL for invoicing (Mollie card payments planned as a later phase, not yet built).

As of the v2.0.0 milestone: the entire site is live in both languages, including all core pages, the training/course/register flow, and all 81 "quality-tier" Insights articles. Two things remain deliberately deferred (not forgotten — see "Deferred work" below).

## Known recurring bugs / gotchas

**Netlify stale-build issue.** Deploy logs sometimes show "All files already uploaded by a previous deploy with the same commits" while the live site keeps serving old output. Standard "Trigger deploy" / "Retry" does NOT fix this. Use **"Clear cache and deploy site"** specifically in the Netlify Deploys tab. This has recurred multiple times across this project — if a change isn't showing live after a normal deploy, this is the first thing to try before assuming the code is wrong.

**Locale-aware links.** Every href that could point to a page with both an English and German version MUST be prefix-aware (`${prefix}/...`), not hardcoded. This bug has recurred multiple times: `registrationHref()`, the 404 page's buttons, and breadcrumbs on Insights article pages have all shipped with hardcoded English-only links at least once. When adding or touching any internal link, check it's prefix-aware.

**Astro's built-in `/404` special-casing doesn't extend to `/de/404`.** Astro builds `src/pages/404.astro` to `dist/404.html` (a file, for static-host error page conventions) but `src/pages/de/404.astro` builds to `dist/de/404/index.html` (a directory) — Netlify's automatic "nearest 404.html" behavior won't find it without an explicit `netlify.toml` redirect rule. Also, Astro's sitemap auto-exclusion for `/404` doesn't extend to `/de/404` either — both need explicit handling, and this has been missed and re-broken at least once.

**Insights article author data.** The CSV/database only has opaque author UUIDs, no names. **Never guess an author name from a UUID or from memory of a title-to-author mapping** — always verify against the actual English source page for that specific article. Guessed author attributions have been wrong in multiple past batches (confirmed mismatches across ~6 articles in one batch alone).

**Em dashes are prohibited house-wide**, per house style (see below) — check for these in visible content on every change, including article titles, generated copy, and code comments in files that also contain rendered content (script blocks are fine, rendered text is not).

## German translation house style

- **No direct address.** Never use "Sie" or "Du" to address the reader. Use impersonal/collective/passive constructions instead ("Wir unterstützen..." / "Es lohnt sich, ..." / passive voice), consistent with how the whole site is written.
- **Gender-inclusive language** uses the colon form (Trainer:innen, Teilnehmer:innen, Praktiker:innen).
- **English loanwords kept as-is**: Training, Leadership, Facilitation, Coaching, Scrum Master, Product Owner, Sprint, Backlog, and all course/certification codes (FL2D, CSM, CSPO, etc.) — these are standard usage in German-language agile/business contexts, do not translate them.
- **Category/content-type labels** (Change Management, Leadership, Coaching, Flight Levels, Kanban, Blog, Webinar, Agile, Scrum) stay as English loanwords too, **except**: "Product Development" → "Produktentwicklung" and "AI" → "KI".
- **No em dashes** anywhere in rendered content (see gotcha above) — use commas or split into two sentences.
- **German number formatting**: "€1.890" not "€1,890" (period as thousands separator, currency symbol first — matches the rest of the site's `germanizePrice()` convention, NOT the `de-DE` Intl default which puts € after the number).
- **metaTitle convention**: kept identical to the page's own title (English), not prefixed with anything like "Webinar Recording:" — this was a deliberate choice, not an oversight, don't "fix" it to add a prefix.

## Content/routing conventions

- **Insights hub stays English-only.** There is no `/de/insights` route. Individual articles CAN have German translations at `/de/insights/[slug]`, but the hub/listing page itself is not translated. Breadcrumbs and nav on German article pages should NOT link to `/de/insights` (this exact bug has occurred and been fixed once already).
- **German course pages use short certification-code slugs**, not a translated version of the English long-form slug — e.g. `/de/training/scrum/csm/`, not a German equivalent of `/training/scrum/certified-scrum-master-(csm)`. This is intentional, documented, and shared with how Insights article locale routing works.
- **Article title translation**: article titles are kept in English on the German pages (not translated), consistent with how course names are handled.

## Deferred work (not started, not forgotten)

1. **~76 SEO-filler Insights articles** — generic, repetitive, keyword-heavy older content, deliberately deprioritized vs. the 81 "quality-tier" articles which are done. List of which articles fall into this bucket was generated by a length + title-pattern heuristic; re-derivable by comparing article body length (filler tends to run 9,000–14,000 characters vs. 3,000–5,500 for quality-tier) if needed.
2. **Individual Fellow/coach profile pages** (`/about/[slug]`) — not yet translated to German.

## Safety / testing

- **LEXWARE_TEST_MODE** must be confirmed enabled before any end-to-end registration/payment flow is tested. When true, invoices are created as drafts prefixed "TEST —" and never finalized. Never test the registration flow without first confirming this is on.
- This is a **static Astro build** — Lexware integration lives in Netlify Functions, which are NOT reachable from a local dev/preview server or from a sandboxed session with blocked network egress. Functional/payment-flow testing can only be done by a human directly on the live site (or a deploy preview with function access), not by an AI session running in an isolated sandbox.

## Pre-merge checklist (used successfully twice, reuse for future merges)

Before merging any branch back to `main`, run and report pass/fail on:
1. Full `[DE]`-placeholder scan across the whole site
2. Hreflang and canonical tags on all new/changed pages
3. Language switcher behaviour on all affected page types
4. Locale-aware links, full audit (see gotcha above)
5. Sitemap inclusion for all new URLs, both locales
6. Build health (clean rebuild + `astro check`)
7. Leaked/duplicated content scan (dev notes, placeholder text, WP-import artifacts)
8. Shared-component consistency (mega-menu, footer, closing CTAs) across all new page types
