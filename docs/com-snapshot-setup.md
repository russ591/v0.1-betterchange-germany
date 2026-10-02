# Setting up the .com snapshot push

What this does: the .com WordPress site sends a copy of its posts and events to the .de site once a day, and a couple of minutes after you save a post or an event. The .de sync reads that copy. The .com site's anti-bot protection is never involved, because nothing calls .com from outside.

You need about 15 minutes, the Code Snippets plugin on .com, access to the .com file manager, and the Netlify dashboard for the .de site.

## 1. Make a secret

Make up one long random password, at least 32 characters, letters and digits only. A password manager's generator is ideal. This is the shared secret. You will paste it in two places and nowhere else. Do not put it in chat, email or the snippet.

## 2. Put the secret on the .de side (Netlify)

1. Netlify dashboard, the betterchange-consulting.de site, Site configuration, Environment variables.
2. Add a variable named exactly `COM_SYNC_SECRET` with the secret as its value. Scope: all deploy contexts is fine.
3. Trigger a deploy of the current main branch afterwards (Deploys, Trigger deploy, Deploy site) so the function picks up the variable. This needs the `com-snapshot` function to be on main already, so do this step after PR 43 is merged.

If `NETLIFY_SITE_ID` and `NETLIFY_BLOBS_TOKEN` are already set for the discount codes, nothing else is needed; the snapshot store uses the same credentials.

**Testing before the function is on main.** Netlify builds a deploy preview for the pull request, functions included, and it can receive snapshots too. To send the first snapshot there, add a second line to `wp-config.php` (step 3) above the secret, with the preview address copied from the pull request's Netlify link:

```php
define('BC_SYNC_ENDPOINT', 'https://deploy-preview-43--<site-name>.netlify.app/.netlify/functions/com-snapshot');
```

Remove that line again once the pull request is merged; the snippet then uses the live site address on its own. The environment variable from step 2 must be available to deploy previews (the default "all deploy contexts" scope is).

## 3. Put the secret on the .com side (WordPress)

1. SiteGround Site Tools for betterchange-consulting.com, Site, File Manager.
2. Open `public_html/wp-config.php` for editing.
3. Find the line that says `/* That's all, stop editing! Happy publishing. */` and add this line **above** it, with your secret between the quotes:

   ```php
   define('BC_SYNC_SECRET', 'paste-the-secret-here');
   ```

4. Save the file. Load the .com site once in the browser to make sure it still works; a typo in this file takes the site down, so check before moving on.

## 4. Install the snippet

1. In the .com WordPress admin, Snippets, Add New.
2. Title: `Better Change: push snapshot to .de`.
3. Paste the whole contents of `docs/com-snapshot-snippet.php` from the .de repository into the code box. If the box already starts with `<?php`, remove that first line from what you pasted so it is not there twice.
4. Below the code, choose "Run snippet everywhere". Leave the priority at its default.
5. Click "Save Changes and Activate".

## 5. Test it

1. Go to the WordPress Dashboard (the first admin page). A notice at the top says "Snapshot push to betterchange-consulting.de: not run yet" with a "Push now" link.
2. Click "Push now". A plain-text page appears with the result. You want `"ok": true` and `"status": 200`, plus the number of posts and events sent. The first push can take a few seconds.
3. Go back to the Dashboard. The notice now says OK with the time and counts.

If it says FAILED:

- "No secret configured": the `wp-config.php` line is missing or misspelt.
- HTTP 401: the two secrets are not identical. Check both for stray spaces.
- HTTP 503: `COM_SYNC_SECRET` is not set on Netlify, or the site was not redeployed after setting it.
- HTTP 404: the `com-snapshot` function is not deployed yet (PR 43 not merged, or deploy still running).
- Anything else: tell Claude the exact text of the notice.

## 6. From then on

- Once a day at about 03:10 site time, and two minutes after any post or event is saved, trashed or deleted, the snippet pushes again on its own. WordPress runs these jobs when the site gets visitors, so on a quiet day the daily push may land a little later.
- The Dashboard notice always shows the last result. The .de sync raises a question if the newest snapshot is more than 48 hours old, so a broken push is noticed within a day.
- To stop the push, deactivate the snippet in Snippets. To change the secret, change it in both places and push once by hand.

## Updating the snippet

When `docs/com-snapshot-snippet.php` changes in the .de repository, the copy on .com has to be replaced by hand: .com WordPress admin, Snippets, open "Better Change: push snapshot to .de", replace the whole code box with the new file (again without a second `<?php` line), save, then Dashboard, "Push now", and check the notice says OK. The .de sync only sees the new data once that push has landed.

Changes so far: 2026-10-02, the event's "Trainer" additional field is forwarded (as `trainer`, plus the raw `custom_fields`, which also carries "2nd Trainer"), because the organizer on .com is usually a company name and the .de sync needs the person. Later the same day, Elementor template types were excluded from what the snippet sends, every post got a `wordCount` (so the .de sync can tell a webinar announcement from a write-up even for posts whose text is outside the 60-day content window), and the author's display name is looked up directly, because the embedded author object came back without a name. Install this version: without it, every imported article is an author question.

## What the snippet sends

Metadata for every published post (title, date, link, categories, author), the full text of posts published in the last 60 days, every upcoming event with its dates, venue, price, registration link and Trainer field, the same for any other public post type, and the list of post types. Nothing about users, comments, settings or anything unpublished. The snippet never changes anything on .com.
