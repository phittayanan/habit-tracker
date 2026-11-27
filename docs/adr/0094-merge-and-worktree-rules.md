# 0094. Merge rules for busy files, ADR numbers, blocked by, staging updates and worktrees

Status: agreed by phittayanan and projectnewy in Issue #177 (proposal by phittayanan on 2026-11-27; projectnewy agreed to rules 1 to 3, and to rules 4 and 5 with one addition each, on 2026-11-27)

## Context

On 2026-11-27 three open PRs (#173, #174, #176) changed the same files. Each merge into `staging` broke the other two again, so the same conflict was fixed more than once:

- #176 against #173: `client/src/goals.jsx`, `docs/ai-use.md`, `docs/traceability.md`
- #176 against #174: `docs/ai-use.md`, `docs/system-sds.md`, `docs/traceability.md`
- #174 and #176 both added ADR 0086 and 0087. Git did not flag this because the file names differed.
- Issue 153 waited for #168 (ADR 0087) without a "blocked by" link until 2026-11-27.

ADR 0057 lets each student work on more than one Issue at a time. One folder can hold only one checked-out branch, so parallel Issues in one folder means switching branches, and old worktrees from Claude sessions were left with `claude/...` branch names or no branch.

## Decision

1. **Busy files** are the ones `CLAUDE.md` lists plus every file an open PR also changes, shared docs (`docs/traceability.md`, `docs/system-sds.md`, `docs/srs.md`) included. When starting an Issue, name each overlap with its PR number.
2. **ADR numbers:** before naming a new ADR, take the next number that is free on `staging` and in every open PR. Recheck before asking for review.
3. **Blocked by:** when an Issue waits for another Issue, add the "blocked by" link, also when an ADR lets its PR open before the other merges.
4. **When to update from `staging`:** when an open PR that changes the same files is approved or will merge first, wait for it to merge, then update once. The PR that merges second fixes the conflicts, including renumbering a clashing ADR. If that PR is still not merged and our work is waiting on it, the two of us may agree a new order in the thread.
5. **One worktree per Issue** (for parallel work with no open blocker):
   - Each Issue gets its own git worktree folder and its own Claude session. Never switch branches inside a folder that holds another Issue's work.
   - The worktree's branch follows the `CLAUDE.md` name rule (`feat|fix|docs|chore/<issue-number>-<slug>`), branched from `staging`; rename an auto-made `claude/...` branch before the first push.
   - After the PR merges, remove that worktree and delete its local branch.
   - Worktrees that run tests at the same time use separate test databases.

## Not changed

ADR 0057 (work until blocked, at most 2 own PRs waiting for review); one Issue, one branch, one PR; who reviews and merges; the review format (ADR 0055, ADR 0085).

## Not in this decision

How `docs/ai-use.md` and `docs/traceability.md` are written (for example one file per Issue, or `.gitattributes merge=union`). These still conflict on every pair of PRs; they can be a separate Issue if both students want it.

## Source

Issue #177: the proposal of 2026-11-27, rule 5 added the same day, and projectnewy's comment of 2026-11-27 (14:29 UTC). projectnewy's reasons for the two additions: "will merge first" is a guess, so no PR should wait with no end (rule 4); a worktree separates files only, and the server and browser suites reset the test database, so two runs on one database can break each other's results (rule 5). projectnewy agreed that how `docs/ai-use.md` and `docs/traceability.md` are written stays out of this decision. Implementation owner phittayanan, reviewer and merger projectnewy.
