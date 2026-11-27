# 0098. ADR numbers on pushed branches, a per-worktree browser test port, and union merge for the AI use log

Status: proposed by phittayanan in Issue #181; agreed by projectnewy, with one addition to change 1 and one to change 3, on 2026-11-27. Extends rule 2 of [ADR 0094](0094-merge-and-worktree-rules.md) and settles, for `docs/ai-use.md` only, what ADR 0094 left out. Implementation owner projectnewy, reviewer and merger phittayanan.

## Context

The first parallel run under ADR 0094 (#155 and #158, 2026-11-27) showed three problems:

- #158 pushed ADR 0095 and 0096 on its branch before it had a PR. Rule 2 of ADR 0094 checks only `staging` and open PRs, so #179 (0095) and #180 (0097, after a renumber from 0096) could not see them.
- `client/playwright.config.js` and TC-73 in `client/test/templates.spec.js` hard-coded port 33132, so two worktrees could not run the browser tests at once. The default Playwright output folder is also shared. TC-59 in `client/test/progress.spec.js` hard-coded a second port, 33140 (found while building #181; not in the Issue text).
- #180 conflicted with #179 on `docs/ai-use.md`, where both had added a row at the end of the log.

## Decision

1. **ADR numbers:** before naming a new ADR, run `git fetch`, then take the next number that is free on `staging`, in every open PR and on every pushed branch (`git ls-tree` on each `origin/*` branch). Recheck the same way before asking for review. The fetch keeps the check from reading old `origin/*` refs.
2. **Browser test port:**
   - The Playwright config and the tests read the port from `TEST_SERVER_PORT`; the default stays 33132, so one worktree and CI need no setting.
   - The server that TC-59 restarts uses the main port plus 8 (33140 by default), so there is no second variable.
   - Each worktree that runs browser tests at the same time as another sets its own `TEST_SERVER_PORT` and its own `PLAYWRIGHT_OUTPUT_DIR`. Two chosen ports must not be the same or 8 apart.
   - Separate test databases are still required (ADR 0094 rule 5).
3. **`docs/ai-use.md` merges:** `.gitattributes` has `docs/ai-use.md merge=union`, for this file only.
   - It is meant for newly appended rows: rows that two branches add at the end of the log are both kept without a conflict.
   - Check the diff of `docs/ai-use.md` after every merge. When both sides edited the same existing row, union can keep both versions without any warning.

## Not changed

The rest of ADR 0094. `docs/traceability.md` is written and merged as before: its rows are edited in place, and a union merge could join them wrongly without a warning. `docs/ai-use.md` stays one file.

## Limit

GitHub's own merge may not apply `.gitattributes` merge drivers, so a PR page may still report a conflict on `docs/ai-use.md`. This has not been verified. The expected gain is local: `git merge staging` on a branch keeps both rows by itself.

Checked with local throwaway branches on Windows on 2026-11-27: a branch whose own files do not have the `.gitattributes` line yet still conflicts on `docs/ai-use.md`, also when the branch it merges brings the line. So a branch made before this change can conflict once more, on the update that brings the line in.

## Source

Issue #181: phittayanan's proposal of 2026-11-27 (change 3 added the same day) and projectnewy's answer of 2026-11-27. The "main port plus 8" part of change 2 was chosen by projectnewy in the Claude Code chat while the Issue was being built; phittayanan reviews it in the PR.
