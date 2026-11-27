# 0100. The calendar step of TC-43 waits for the calendar endpoint

Status: chosen by phittayanan on 2026-11-27 in the Claude Code session that started [Issue #158](https://github.com/phittayanan/habit-tracker/issues/158), from the proposal of Claude Code ("Yes, wait for #155"). Pending the reviewer, projectnewy, in the #158 PR. Numbered 0095 and 0096 on the #158 branch at first; renumbered 0099 and 0100 after PR #179 (ADR 0095), PR #180 (ADR 0097) and PR #182 (ADR 0098) merged (ADR 0094 rule 4, ADR 0098).

## Decision

AC-17.1 and TC-43 check that `GET /api/calendar` has no `reminder` field. That endpoint is built in [Issue #155](https://github.com/phittayanan/habit-tracker/issues/155) and is not on `staging` when #158 starts. So:

1. #158 is "blocked by" #155 (ADR 0094 rule 3).
2. Everything else of F-17 is built and tested now. The calendar step of TC-43 is written now and committed failing.
3. After #155 merges, the #158 branch is updated from `staging` once (ADR 0094 rule 4), and TC-43 passes before the review is requested.

## Options considered

- **A. Wait for #155 in the same PR (chosen).**
- B. Leave the calendar step out of #158 and check it later.

## Why

AC-17.1 stays whole in one PR, and the check runs against the real endpoint rather than a guess of its shape. Same pattern as ADR 0093.
