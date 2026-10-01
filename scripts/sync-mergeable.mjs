#!/usr/bin/env node
// Decides, mechanically, whether the current sync branch may be merged by
// the sync itself under the CLAUDE.md merge policy: every file changed
// against origin/main must be a training-session data file carrying a
// sourceId, or sync/state.json. Anything else means the PR waits for Russ.
//
//   npm run sync:mergeable                 judge HEAD against origin/main
//   npm run sync:mergeable -- <base> <head>  judge any range (for example a
//                                          merged PR: main~1 main)
//
// It fetches origin/main first, so the verdict is against what main is now,
// not against a stale local checkout. Exit code 0 = may be merged by the
// sync, 1 = waits for Russ, 2 = could not judge. Paste the output into the
// PR description.

import { execFileSync } from "node:child_process";

const SESSION_FILE = /^src\/content\/training-schedules\/[^/]+\.md$/;
const STATE_FILE = "sync/state.json";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const [baseArg, headArg] = process.argv.slice(2);
const head = headArg || "HEAD";
let base = baseArg || "origin/main";

try {
  if (!baseArg) {
    try {
      git("fetch", "--quiet", "origin", "main");
    } catch (e) {
      console.log(`warning: could not fetch origin/main (${String(e.message).split("\n")[0]}); judging against the local origin/main, which may be stale`);
    }
  }
  const mergeBase = git("merge-base", base, head);
  const headSha = git("rev-parse", head);
  const baseSha = git("rev-parse", base);
  const ahead = git("rev-list", "--count", `${base}..${head}`);
  const behind = git("rev-list", "--count", `${head}..${base}`);
  console.log(`sync:mergeable  base ${base} (${baseSha.slice(0, 7)}), head ${head} (${headSha.slice(0, 7)}), merge-base ${mergeBase.slice(0, 7)}; ${ahead} commit(s) ahead, ${behind} behind`);

  const changed = git("diff", "--name-status", mergeBase, head)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split("\t");
      return { status: status[0], path: paths[paths.length - 1], from: paths[0] };
    });

  const problems = [];
  const hasSourceId = (ref, path) => {
    try {
      return /^sourceId:\s*\S/m.test(git("show", `${ref}:${path}`));
    } catch {
      return false;
    }
  };
  for (const f of changed) {
    if (f.path === STATE_FILE) continue;
    if (!SESSION_FILE.test(f.path)) {
      problems.push(`${f.path}: not a training-session file`);
      continue;
    }
    if (f.status === "D") {
      if (!hasSourceId(mergeBase, f.path)) problems.push(`${f.path}: deleted, but it carried no sourceId (Russ's own session)`);
    } else if (f.status === "R") {
      if (!hasSourceId(mergeBase, f.from) || !hasSourceId(head, f.path)) problems.push(`${f.from} -> ${f.path}: renamed, but it carries no sourceId`);
    } else if (!hasSourceId(head, f.path)) {
      problems.push(`${f.path}: carries no sourceId`);
    }
    if (f.status === "M" && !hasSourceId(mergeBase, f.path)) problems.push(`${f.path}: modified, but it carried no sourceId before (Russ's own session)`);
  }

  console.log(`changed files (${changed.length}):`);
  for (const f of changed) console.log(`  ${f.status}  ${f.from && f.from !== f.path ? `${f.from} -> ` : ""}${f.path}`);
  if (!changed.length) {
    console.log("\nNOT MERGEABLE: nothing changed against main.");
    process.exit(1);
  }
  if (Number(behind) > 0) console.log(`\nnote: main has ${behind} commit(s) this branch lacks; merge main in first if GitHub reports a conflict.`);
  if (problems.length) {
    console.log("\nWAITS FOR RUSS. Not training-only:");
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log("\nMERGEABLE BY THE SYNC: training-only (synced session files with a sourceId, plus sync/state.json). Merge once the build passes.");
} catch (e) {
  console.error(`sync:mergeable could not judge: ${String(e.stderr || e.message).trim()}`);
  process.exit(2);
}
