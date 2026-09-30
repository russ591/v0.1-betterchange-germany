# Runbook: daily sync from betterchange-consulting.com to betterchange-consulting.de

This is what the scheduled daily session follows. Read CLAUDE.md first; every rule there still applies. This runbook only adds the sync-specific steps and the one narrow merge permission described at the end.

Russ only wants to be asked when something is genuinely unclear. Anything unclear is skipped and listed as a question; everything else carries on.

## What the sync owns and what it never touches

- The sync may create, edit and remove **only** content that carries a `sourceId`: training sessions in `src/content/training-schedules/` and articles in `src/content/insights-articles/` (English) and `src/content/insights-articles/de/` (German).
- Anything **without** a `sourceId` belongs to Russ. Never edit or remove it. This is what protects his own German courses and his own articles.
- Never touch registration, Lexware or email code (`src/components/pages/RegisterPageContent.astro`, anything under `netlify/functions/`). Never change `LEXWARE_TEST_MODE` or any other environment variable. Never merge anything to main except the one case in "Merging" below.

## Before the first run (one-time setup, done by Russ or a session on a network that can reach .com)

1. The .com host sits behind SiteGround's anti-bot check. From the cloud sandbox every API request currently gets an HTML challenge page instead of JSON, and `sync:check` stops with exit code 3 and a clear message when that happens. The daily run needs either a network that .com lets through, or the check switched off for `/wp-json/` on the .com side. Until then, responses can be saved elsewhere and fed in with `--from-dir`.
2. Baseline: `npm run sync:check -- --baseline` (or `--from-dir <saved responses> --baseline`). This records every post and event currently on .com as already seen, so the first daily run does not try to import 200 old articles, and prints two information-only lists: recent .com posts that seem to have no counterpart on .de, and existing sessions here that match a .com event.
3. Give the existing non-German sessions their `sourceId`s: `npm run sync:check -- --baseline --apply-source-ids`. Check the printed matches first; only unambiguous, non-German, non-Russell matches are written. From then on the sync owns those sessions.
4. Commit `sync/state.json` and the updated session files.

## Environment the daily run needs

- Repository: `russ591/v0.1-betterchange-germany`, branch off `main`, push access, and permission to open and (for training-only PRs) merge pull requests.
- Network access to `https://www.betterchange-consulting.com/wp-json/` (see above), `https://api.replicate.com` and the Replicate output host for images, and GitHub.
- `NODE_USE_ENV_PROXY=1` when running in the cloud sandbox, so Node's fetch honours the proxy.
- `REPLICATE_API_TOKEN` for article images. Nothing else: the sync never sends email and never talks to Lexware or Netlify.

## Step 1: find out what changed

Run `npm run sync:check`. It compares the live .com posts and events with `sync/state.json` and prints:

- new posts (non-webinar; webinar announcements are never imported),
- new, changed (date, price, registration link) and removed non-German events,
- questions (an event whose location or trainer cannot be determined).

If it prints `Nothing to do.`, stop. No branch, no PR, no summary beyond one line.

The script makes no content decisions. `--json` gives the same result as machine-readable output.

## Step 2: branch

Create `sync/YYYY-MM-DD` from the latest `main`. Everything from this run goes there. When a run has both training changes and at least one article, make two branches, `sync/YYYY-MM-DD-training` and `sync/YYYY-MM-DD-articles`, so the two PRs can be handled differently (see "Merging").

## Step 3: training events

Only non-German events reach this step. The script already skips events whose venue is in Germany, and online events run by Russell Hill; Russ adds those to both sites himself.

**New event**

1. Find the matching course in `src/content/training-courses/` by certification code in the event title (CSM, CSPO, A-CSM, CAL-1, CAL-2, CSP-SM, ICP-ATF, ICP-ACC, FL2D, FL3D, FLSA, FLIN, KMP and so on). No matching .de course page (for example CASP)? Skip the event and raise a question. Never create a course page.
2. Create `src/content/training-schedules/<code>-<city-or-online>-<dd-mm-yyyy>.md` following the existing external sessions (for example `csm-cph-04-11-2026.md`):

   ```yaml
   ---
   course: csm
   date: '2026-11-04T01:00:00Z'
   format: in-person            # or live-online
   location: Copenhagen, Denmark
   trainers:
     - bent-myllerup            # coach-profiles id; omit if the trainer has no profile and use trainerName instead
   price: from DKK 7,000        # exactly as given on .com, in its own currency
   status: available
   isExternal: true
   externalUrl: https://...     # the .com event's registration link ("website" field)
   sourceId: '5101'             # the .com event id
   sourceUrl: https://www.betterchange-consulting.com/event/...
   ---
   ```

   The filename is the registration URL for internal sessions, so keep the date in it accurate even though external sessions have no internal registration page. `isExternal: true` makes the Register button open the .com registration URL in a new tab, exactly as the existing external sessions do.
3. Show the date and location and the price as given on .com, in its own currency. Do not convert currencies and do not invent an offer.
4. Trainer: match the organizer name to a `coach-profiles` id. No profile? Use `trainerName`. No organizer at all on .com? The script has already turned that into a question.

**Changed event** (date, price, registration link, title, location): update the session file that carries that `sourceId`. If the date changed, rename the file to the new date as well.

**Removed or cancelled event**: delete the session file that carries that `sourceId`. If the event still exists on .com but is marked cancelled or postponed in its title, treat it as removed.

Only ever touch sessions with a `sourceId`. If a change would affect a session without one, raise a question instead.

## Step 4: articles

Only non-webinar posts reach this step.

1. **Language.** If the post is not in English (for example Italian), do not guess. Raise a question and stop for that post.
2. **Author.** Keep the real .com author if they are a Better Change Fellow with a `coach-profiles` entry (`author: <id>`). Anyone else: raise a question and stop for that post. Never guess an author.
3. **English rewrite.** Rewrite the post in English following the house style in CLAUDE.md: no em dashes, clean HTML in `bodyHtml`, a real excerpt, a `metaDescription`, `readTimeMinutes`. Choose `primaryCategory` and `categories` from the existing set only (Scrum, Agile, Change Management, Leadership, Coaching, Flight Levels, Kanban, AI, Product Development, plus content types Blog and Webinar). Keep the .com publication date as `date`.
4. **German translation** into `src/content/insights-articles/de/<same-slug>.md` following the German house rules in CLAUDE.md: no direct address (no "Sie", no "du"), colon-form gender-inclusive language, English loanwords for Scrum and agile terms, the English title kept on the German page, no em dashes, German price format, "Product Development" as "Produktentwicklung" and "AI" as "KI" in categories. Write the German excerpt and metaDescription too.
5. **Source fields.** Set `sourceId` (the .com post id, as a string) and `sourceUrl` (the .com post URL) identically on both entries.
6. **Image.** Generate the hero image via Replicate (Flux) in the existing style of the Insights images (the earlier images were generated in a separate session; if no written style guide is in the repo, match the look of the existing files in `public/insights/` and raise a question asking Russ to check the style guide in). Download it immediately, since Replicate URLs expire, and save it as `public/insights/<slug>.webp`; set `imageUrl: /insights/<slug>.webp` on both entries.
7. **Related training.** The related-training block is computed at build time from the article text (`src/lib/relatedTraining.ts`), so nothing to add. If the computed sentence reads badly for this article, add a hand-written `relatedTrainingIntro` on both entries, the German one without direct address.
8. Build and check the article page in both languages: no `[DE]` placeholders, no em dashes, working image.

## Step 5: state

Update `sync/state.json` in the same PR as the change it records: `npm run sync:check -- --record` after the content changes are made. A rejected PR then means the item is retried or questioned again on the next run, which is intended.

Questions are remembered in the state file too, so a known open question is not raised again until the event or post changes.

## Step 6: build and PR

- `npm run build` must pass (it runs `astro check` first). Run the `[DE]` scan and the em-dash scan from the CLAUDE.md pre-merge checklist on new pages.
- Open the PR against `main` with a description listing every change, and a **Questions for Russ** section listing everything skipped and why. If there are only questions and no changes, do not open a PR; report the questions in the run's final summary instead.
- Two PRs when a run has both training changes and articles.

## Merging

- A **training-only PR** is merged automatically once the build passes, and only if every changed file is one of: `src/content/training-schedules/*.md` carrying a `sourceId`, and `sync/state.json`. If anything else is touched, the PR waits for Russ.
- An **article PR** always waits for Russ.
- This is the only exception to the CLAUDE.md merge policy. Nothing else is ever merged by the sync.

## Final summary of a run

One short message: what was synced, which PR(s) were opened and whether the training PR was merged, and the questions for Russ. When there was nothing to do, one line.
