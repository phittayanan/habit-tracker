# 0057. Work until blocked: blocked-by links, review first, even split

Status: agreed by phittayanan and projectnewy in Issue #115 (proposal by phittayanan on 2026-11-19; projectnewy agreed to all four rules and the limit of 2 on 2026-11-19, and added the two points in "Other rule files" and "Shared files")

## Decision

1. **Blocks are recorded.** When an Issue needs another Issue merged first, it gets a GitHub "blocked by" link to it. An Issue with no open blocker can start.
2. **Keep working until a block, own Issues only.** After opening a PR, its author may start their next own Issue that has no open blocker, branched from current `staging` (never from an unmerged branch). Each person has at most **2** of their own PRs waiting for review at once. Nobody takes the other's Issue, even when free, unless the other agrees and the assignee is changed on the Issue.
3. **Review before starting.** When the other's PR is waiting for your review, you review it before you start a new Issue.
4. **Even work.** New Issues alternate owners (ADR 0036). At each status check the agent counts closed Issues by assignee and reviews by reviewer for each person; if one side is clearly ahead, the next set of Issues is split to even it out.

## Shared files

With two PRs open at once, files that every PR touches conflict. `docs/ai-use.md` joins the busy files of `CLAUDE.md` (database schema, `package.json`, route index): the PR that merges second updates its branch from `staging` and fixes its row before it asks for review.

## Other rule files

projectnewy's course-wide `Rule_of_this_AI.md` (outside this repository) says not to start a new Issue until the previous one is approved and merged by the partner. For habit-tracker, this ADR and `CLAUDE.md` win. projectnewy updates his own file; no PR changes it.

## Replaces

The `CLAUDE.md` line "Do not run ahead: finish the current step, open the PR, and stop for review." Until this ADR is merged, that line stays in force.

## Not changed

One Issue, one branch, one PR; who reviews and merges (the student who did not write the PR); the review format (ADR 0055); spec and test first; asking the human before a product or design decision.

## Source

Issue #115: the proposal of 2026-11-19 and projectnewy's comment of 2026-11-19 (11:13 UTC). Implementation owner phittayanan, reviewer and merger projectnewy.
