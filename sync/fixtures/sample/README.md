# Sample API responses for testing sync:check

Hand-written in the shape the two .com APIs return (WordPress REST `posts`
with `_embed`, The Events Calendar `tribe/events/v1/events`), small enough
to read. They exist so the script's logic can be exercised without network
access:

    npm run sync:check -- --from-dir sync/fixtures/sample --baseline
    npm run sync:check -- --from-dir sync/fixtures/sample

Real responses saved with `--save-dir` have the same file names and can be
used the same way. Never commit real responses here; they go stale.
