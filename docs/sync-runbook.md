# Runbook: daily sync from betterchange-consulting.com to betterchange-consulting.de

This is what the scheduled daily session follows. Read CLAUDE.md first; every rule there still applies. This runbook only adds the sync-specific steps and the one narrow merge permission described at the end.

Russ only wants to be asked when something is genuinely unclear. Anything unclear is skipped and listed as a question; everything else carries on. His answers live in `sync/decisions.json` (see "Decisions"), so a question is asked once and never guessed at.

## What the sync owns and what it never touches

- betterchange-consulting.com is the source of truth for every **external** training session (`isExternal: true` in `src/content/training-schedules/`, the sessions whose Register button opens a sister site). The sync owns all of them, whether or not they carry a `sourceId`: it creates them from .com events, keeps them in step, and removes any that has no upcoming event on .com. This decision dates from 2026-10-02, when six external sessions with no .com counterpart were removed.
- Articles are owned only when they carry a `sourceId`: `src/content/insights-articles/` (English) and `src/content/insights-articles/de/` (German).
- Every session with the internal .de registration (no `isExternal`: the German courses and Russ's own online courses) and every article without a `sourceId` belongs to Russ. Never edit or remove those.
- Never touch registration, Lexware or email code (`src/components/pages/RegisterPageContent.astro`, anything under `netlify/functions/` including the `com-snapshot` function). Never change `LEXWARE_TEST_MODE` or any other environment variable. Never merge anything to main except the one case in "Merging" below.

## How the data gets here: push, not pull

The .com host sits behind SiteGround's anti-bot check, which blocks automated requests from most networks, so the sync never reads the .com API directly. Instead a small snippet installed on the .com site (`docs/com-snapshot-snippet.php`, install steps in `docs/com-snapshot-setup.md`) builds a snapshot once a day and a couple of minutes after any post or event is saved, and POSTs it to the .de site's `com-snapshot` Netlify Function, which keeps the latest and the previous snapshot in Netlify Blobs. `sync:check` reads the latest snapshot from that function by default. The snapshot holds metadata for every published post, full content for posts published in the last 60 days, every upcoming event, and the post-type list, in the shape the WordPress REST API returns. Besides blog posts it carries the .com site's other public post types: `resources` (how-to guides and explainers, treated exactly like blog posts) and `fellow` (people, never imported; see "Fellows" below). Elementor templates (`elementor_library`, `elementor_snippet`) and calendar internals also reach the snapshot from an older snippet; the script drops them before looking at anything.

Event dates in the snapshot are the site-local `start_date` and `end_date`. The `utc_*` fields are 22:00 the evening before for an event stored at midnight Europe/Berlin and must not be used; the script already reads the local ones.

Both directions are protected by one shared secret:

- On .com: the `BC_SYNC_SECRET` constant in `wp-config.php`.
- On Netlify and in the daily run's environment: `COM_SYNC_SECRET`.

`sync:check` treats a snapshot older than 48 hours as a question ("Stale .com snapshot"), so a broken snippet is noticed the same day. When the snippet in this repository changes (it did on 2026-10-02 to forward the Trainer field), Russ pastes the new version into the snippet on .com and pushes once by hand (`docs/com-snapshot-setup.md`, "Updating the snippet"); until then the snapshot lacks the new data. Two fallbacks exist for the script: `--api` reads the .com REST API directly, and `--from-dir <dir>` reads responses saved earlier with `--save-dir`.

## Before the first run (one-time setup)

1. Install the snippet on .com and set the secret on both sides (`docs/com-snapshot-setup.md`). Use "Push now" on the .com dashboard and confirm the dashboard notice reports OK.
2. Baseline: `npm run sync:check -- --baseline`. This records every post and event in the snapshot as already seen, so the first daily run does not try to import 200 old articles, and prints two information-only lists: recent .com posts that seem to have no counterpart on .de, and existing sessions here that match a .com event.
3. Give the existing non-German sessions their `sourceId`s: `npm run sync:check -- --apply-source-ids` (works in any mode and leaves the state alone). A session matches an event when the session's `externalUrl` is the event's registration link, or when the event resolves to the same course and starts on the same date; the output says which basis matched. Only unambiguous, non-German, non-Russell matches are written. From then on the sync owns those sessions. The command also lists the external sessions that match nothing in the snapshot, for Russ to check whether they still run.
4. Upcoming events that should be imported by the first daily run rather than treated as already seen: drop them from the state with `npm run sync:check -- --forget <id,id,...>`. The next check then reports them as new (or as questions, if there is no course page for them).
5. Commit `sync/state.json` and the updated session files.

This was done on 2026-10-01: 8 sessions were linked, and 9 upcoming events with no .de session were forgotten so the first daily run imports them (one of them, CASP, is a standing question).

## Environment the daily run needs

- Repository: `russ591/v0.1-betterchange-germany`, branch off `main`, push access, and permission to open and (for training-only PRs) merge pull requests.
- `COM_SYNC_SECRET`: the shared secret for reading the snapshot. Optionally `COM_SNAPSHOT_URL` to read from a deploy preview instead of the live function.
- `REPLICATE_API_TOKEN` for article images (`docs/insights-image-style-guide.md`).
- `NODE_USE_ENV_PROXY=1` when running in the cloud sandbox, so Node's fetch honours the proxy.
- Network access to the .de site (the snapshot function), Replicate and GitHub. Nothing else: the sync never sends email and never talks to Lexware.

## Decisions: Russ's answers, read on every run

`sync/decisions.json` is where an answered question goes, so the sync applies it from then on and never asks again. `sync:check` reads it on every run. It is keyed by .com id:

- `events.<id>`: `ignore` (a reason; the event is never raised or imported again), `trainer` (a `coach-profiles` id), `trainerName` (display name when there is no profile), `course` (a `training-courses` id, when the title does not resolve on its own), `note`, `decided` (date).
- `posts.<id>`: `ignore` (a reason), `author` (a `coach-profiles` id), `webinar` (`"writeup"` or `"announcement"`, settling the webinar rule for that post), `note`, `decided`.
- `organizers`: a .com organizer name mapped to the trainer it stands for: a `coach-profiles` id, a display name, or `""` for "no trainer shown". One entry answers the question for every future event from that organizer (for example `"Better Change Italy": "giuseppe-de-simone"` once Russ confirms it).

When Russ answers a question in chat or on a PR, the session that gets the answer records it here, in a PR of its own if nothing else is pending (a decisions-only change waits for Russ like any other PR; it is his answer, so he can approve it in a glance). The daily run itself never writes this file.

Current decisions: the Zagreb CSM (#19677) is run by Nino Zeljko and is imported; CASP (#19412) is ignored for good.

## Step 0: finish what an earlier run left open

Before anything else, look for open pull requests from earlier sync runs (branches named `sync/...`). For each one that `npm run sync:mergeable` judges `MERGEABLE BY THE SYNC` (run it on that PR's head against `origin/main`) and whose checks have all passed, merge it now, then fetch `origin/main` again so this run builds on it. A sync PR whose checks failed, or that waits for Russ, is left alone and mentioned in the final summary. This catches the case where a previous run gave up waiting for the Netlify deploy preview (see "Merging").

## Step 1: find out what changed

Run `npm run sync:check`. It compares the latest .com snapshot with `sync/state.json` and prints:

- new posts (`resources` entries count as posts; a Webinar-category post is included when it is a write-up or recap with real content, and skipped only when it is an announcement or sign-up page for a session, see "Webinar posts"),
- new, changed (date, price, registration link) and removed non-German events, each new event with the `course:` id and the `trainer:` it resolves to (and where the trainer came from: a decision, the Trainer field, the organizer, or the event description),
- synced sessions whose `trainers` no longer match the Trainer field on .com,
- external sessions to remove (no upcoming .com event), external sessions that match a .com event but lack a `sourceId`, and past external sessions to delete as housekeeping,
- questions (an event whose trainer, venue country or .de course page cannot be determined, a webinar post that cannot be told apart from an announcement, a snapshot older than 48 hours),
- new Fellow profiles on .com (information only, see "Fellows").

If it prints `Nothing to do.`, stop. No branch, no PR, no summary beyond one line.

If it prints `Nothing to sync; information only:` followed by new Fellows, there is no content to sync; see "Fellows" for what to do.

The script makes no content decisions. `--json` gives the same result as machine-readable output.

## Step 2: branch

Create `sync/YYYY-MM-DD` from `origin/main` after `git fetch origin main`, never from a local `main` or from another session's branch: the container's checkout can be older than what is on GitHub. Everything from this run goes there. When a run has both training changes and at least one article, make two branches, `sync/YYYY-MM-DD-training` and `sync/YYYY-MM-DD-articles`, so the two PRs can be handled differently (see "Merging").

## Step 3: training events

Only non-German events reach this step. The script already skips events whose venue is in Germany, and online events run by Russell Hill; Russ adds those to both sites himself.

**New event**

1. The script has already resolved the course (`course:` in its output) from the certification code in brackets in the event title (CSM, CSPO, A-CSM, CAL 1, CSP-SM, ICP-ATF, KMP 1 and so on), or from the course name for courses without a code (AI for Product Owners, AI for Scrum Masters). An event with no matching .de course page (for example CASP) never reaches this step: the script lists it under questions, and it stays a question until a course page exists. Never create a course page.
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
4. Trainer: use what the script printed after `trainer:`. It takes, in this order, Russ's decision for the event, the event's **"Trainer" field on .com** (The Events Calendar's additional fields "Trainer" and "2nd Trainer", which the snippet forwards in `custom_fields`; every field whose label contains "Trainer" counts, so a session with two trainers gets both), the organizer when it is a coach profile or is mapped under `organizers` in `sync/decisions.json`, and otherwise a "Trainer: Name" line in the event description. Every name is mapped to its `coach-profiles` id (Giuseppe De Simone becomes `giuseppe-de-simone`) and goes in `trainers`. A name with no profile on .de is a question, not a `trainerName` guess; so is an event with none of these. Never assign a trainer on precedent. Russ fills the Trainer field on .com as the normal answer; `trainerName` in `sync/decisions.json` is for the rare trainer who will never get a profile.

**Changed event** (date, price, registration link, title, location): update the session file that carries that `sourceId`. If the date changed, rename the file to the new date as well.

**Trainer differs from .com** (the "Synced sessions whose trainer differs" list): set the session's `trainers` to the ids the script printed, which come from the Trainer field on .com. This is a training-only change like any other.

**Removed or cancelled event** (an event whose date is still ahead has disappeared from .com): delete the session file that carries that `sourceId`. If the event still exists on .com but is marked cancelled or postponed in its title, treat it as removed.

**External session to remove**: an external session that has no upcoming .com event, with or without a `sourceId`. Delete the file; .com is the source of truth. **External session matching a .com event without a sourceId**: add `sourceId` and `sourceUrl` (or run `npm run sync:check -- --apply-source-ids`).

**Past external sessions**: the .com snapshot only holds upcoming events, so a session whose date has passed drops out of it. The script never reports that as a cancellation. It lists such sessions under "Past external sessions to delete"; delete them in the same training PR as plain housekeeping, with no mention in the questions. (The site stops listing them on its own on the day they pass, so nothing is visible either way.)

Only ever touch external sessions and sessions with a `sourceId`. A session with the internal registration is Russ's: if a change would affect one, raise a question instead.

## Webinar posts

The Webinar category on .com holds two kinds of post. An **announcement** (a sign-up page for a coming session: a date later than the post's own, registration wording or a sign-up link, little text beyond that) is never imported. A **write-up** or recap of a session with real content (the Lightning Lesson on coordination cost, the Maja Lovrenčić conversation) is an article like any other and goes through Step 4 with its Webinar category kept. The script decides from the post text: under 400 words with a later date or sign-up wording is an announcement; 400 words or more without either is a write-up; anything in between, or a post whose text is outside the snapshot's content window, is a question, never a silent skip. Russ settles a question with `webinar: "writeup"` or `"announcement"` (or `ignore`) in `sync/decisions.json`. `npm run sync:check -- --webinars` lists every Webinar-category post with its classification and whether .de already has it.

Before 2026-10-02 every Webinar-category post was skipped; the 13 that existed then were baselined as seen, and 11 of them already have a .de article from before the sync. Only the Lightning Lesson (#19684) was released for import; the Italian feedback webinar (#19471) is left in the baseline.

## Step 4: articles

Only posts that are articles reach this step: blog posts, `resources` entries, and webinar write-ups (see "Webinar posts"). A `fellow` entry never does (see "Fellows").

1. **Language.** If the post is not in English (for example Italian), do not guess. Raise a question and stop for that post.
2. **Author.** Keep the real .com author if they are a Better Change Fellow with a `coach-profiles` entry (`author: <id>`); the script prints `author by decision:` when Russ has answered in `sync/decisions.json`. Anyone else, or no author name in the snapshot: raise a question and stop for that post. Never guess an author. (Snapshots before the 2026-10-02 snippet update carry no author names at all, because an internal REST request from cron embeds the author without one; the updated snippet looks the display name up directly.)
3. **English rewrite.** Rewrite the post in English following the house style in CLAUDE.md: no em dashes, clean HTML in `bodyHtml`, a real excerpt, a `metaDescription`, `readTimeMinutes`. Choose `primaryCategory` and `categories` from the existing set only (Scrum, Agile, Change Management, Leadership, Coaching, Flight Levels, Kanban, AI, Product Development, plus content types Blog and Webinar). Keep the .com publication date as `date`.
4. **German translation** into `src/content/insights-articles/de/<same-slug>.md` following the German house rules in CLAUDE.md: no direct address (no "Sie", no "du"), colon-form gender-inclusive language, English loanwords for Scrum and agile terms, the English title kept on the German page, no em dashes, German price format, "Product Development" as "Produktentwicklung" and "AI" as "KI" in categories. Write the German excerpt and metaDescription too.
5. **Source fields.** Set `sourceId` (the .com post id, as a string) and `sourceUrl` (the .com post URL) identically on both entries.
6. **Image.** Generate the hero image via Replicate (Flux) following `docs/insights-image-style-guide.md`: one concrete visual metaphor, the style suffix word for word, the checks before use, and the metaphor and prompt recorded in the PR description. Download it immediately, since Replicate URLs expire, and save it as `public/insights/<slug>.webp` at the existing images' size (1200 by 821); set `imageUrl: /insights/<slug>.webp` on both entries. If two generations fail the guide's checks, leave the article without an image and raise a question.
7. **Related training.** The related-training block is computed at build time from the article text (`src/lib/relatedTraining.ts`), so nothing to add. If the computed sentence reads badly for this article, add a hand-written `relatedTrainingIntro` on both entries, the German one without direct address.
8. Build and check the article page in both languages: no `[DE]` placeholders, no em dashes, working image.

## Fellows

The .com site keeps its Fellow profiles as a `fellow` post type. These are people, not articles, and the sync never imports them. A new one is listed in the run's final summary as information ("new Fellow on .com: name, link") so Russ can update the About page and `coach-profiles` by hand.

A run whose only output is new Fellows ("Nothing to sync; information only") still records them, or they would be listed again every day: run `npm run sync:check -- --record` on a `sync/YYYY-MM-DD-state` branch and open a PR that changes only `sync/state.json`. That PR may be merged by the sync once the build passes, exactly like a training-only PR, because it changes nothing on the site.

## Step 5: state

Update `sync/state.json` in the same PR as the change it records: `npm run sync:check -- --record` after the content changes are made. A rejected PR then means the item is retried or questioned again on the next run, which is intended.

`--record` marks a syncable post or event as seen only when something here carries its `sourceId` (or it was already recorded, or the sync will never import it: webinar announcements, Fellows, skipped and ignored events, questions). An event or post the run left out on purpose is listed under "Not recorded as seen" and comes back on the next run, so nothing is lost by skipping it; there is no need to edit the state by hand for that.

Questions are remembered in the state file too, so a known open question is not raised again until the event or post changes. To make the sync look at something again on purpose (an event or post Russ has answered a question about, or one that was recorded as seen by mistake), drop it from the state with `npm run sync:check -- --forget <id,id,...>`; the next check reports it as new.

## Step 6: build and PR

- `npm run build` must pass (it runs `astro check` first). Run the `[DE]` scan and the em-dash scan from the CLAUDE.md pre-merge checklist on new pages.
- Run `npm run sync:mergeable` on the branch. It fetches `origin/main`, lists every file the branch changes against it and prints one of `MERGEABLE BY THE SYNC` or `WAITS FOR RUSS`, with the reasons. Paste its output into the PR description. This verdict, not a reading of the diff, decides the "Merging" section below.
- Open the PR against `main` with a description listing every change, and a **Questions for Russ** section listing everything skipped and why. If there are only questions and no changes, do not open a PR; report the questions in the run's final summary instead.
- Two PRs when a run has both training changes and articles.

## Merging

- A **training-only PR** is merged by the run itself once the PR's checks pass, and only if `npm run sync:mergeable` printed `MERGEABLE BY THE SYNC`: every changed file is a `src/content/training-schedules/*.md` the sync owns (external, or carrying a `sourceId`), or `sync/state.json`. If it printed `WAITS FOR RUSS`, the PR waits. A **state-only PR** (just `sync/state.json`, from a Fellows-only run) passes the same check. Do not judge this by eye: the 2026-10-01 run misjudged its own PR as not training-only because it believed `main` lacked the baseline, while the branch was in fact based on the merged `main` and GitHub's file list held nothing but session files and the state.
- **Waiting for the checks.** The PR's check is the Netlify deploy preview, which can sit in the queue behind a production build. Poll the PR's checks about once a minute for up to 20 minutes.
  - A check **fails**: do not merge. Report the failure in the final summary with the check's name and link, and leave the PR open for Russ.
  - The checks **pass** within 20 minutes: merge.
  - The checks are **still pending after 20 minutes**, the local `npm run build` passed and `sync:mergeable` said `MERGEABLE BY THE SYNC`: merge anyway, and say in the final summary that the PR was merged before the deploy preview finished. The 2026-10-02 run left PR 47 unmerged after 8 minutes of "in progress" for this reason; the next run's Step 0 would have merged it, but waiting is the better outcome.
- An **article PR** always waits for Russ.
- This is the only exception to the CLAUDE.md merge policy. Nothing else is ever merged by the sync.

## Final summary of a run

One short message: what was synced, which PR(s) were opened and whether the training PR was merged (and whether that happened before the deploy preview finished, or an earlier run's PR was merged in Step 0), any check that failed, the questions for Russ, and any new Fellow on .com (name and link). When there was nothing to do, one line.
