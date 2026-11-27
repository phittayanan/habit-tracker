# 0094. Merge rules for busy files, ADR numbers, blocked by, staging updates and worktrees

Status: proposed by phittayanan in Issue #177 (2026-11-27). Waiting for projectnewy to agree, change or refuse each rule in Issue #177. Not in force until both students agree and this file is updated to "agreed".

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
4. **When to update from `staging`:** when an open PR that changes the same files is approved or will merge first, wait for it to merge, then update once. The PR that merges second fixes the conflicts, including renumbering a clashing ADR.
5. **One worktree per Issue** (for parallel work with no open blocker):
   - Each Issue gets its own git worktree folder and its own Claude session. Never switch branches inside a folder that holds another Issue's work.
   - The worktree's branch follows the `CLAUDE.md` name rule (`feat|fix|docs|chore/<issue-number>-<slug>`), branched from `staging`; rename an auto-made `claude/...` branch before the first push.
   - After the PR merges, remove that worktree and delete its local branch.

## Not changed

ADR 0057 (work until blocked, at most 2 own PRs waiting for review); one Issue, one branch, one PR; who reviews and merges; the review format (ADR 0055, ADR 0085).

## Not in this decision

How `docs/ai-use.md` and `docs/traceability.md` are written (for example one file per Issue, or `.gitattributes merge=union`). These still conflict on every pair of PRs; they can be a separate Issue if both students want it.

## Source

Issue #177: the proposal of 2026-11-27 and rule 5 added the same day. projectnewy's answer: pending. Implementation owner phittayanan, reviewer and merger projectnewy.
