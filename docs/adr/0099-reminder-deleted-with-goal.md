# 0099. A goal's reminder is deleted with its goal

Status: chosen by phittayanan on 2026-11-27 in the Claude Code session that started [Issue #158](https://github.com/phittayanan/habit-tracker/issues/158), from two options Claude Code proposed ("Yes, CASCADE"). Pending the reviewer, projectnewy (F-17 contract author), in the #158 PR. Numbered 0095 and 0096 on the #158 branch at first; renumbered 0099 and 0100 after PR #179 (ADR 0095), PR #180 (ADR 0097) and PR #182 (ADR 0098) merged (ADR 0094 rule 4, ADR 0098).

## Decision

`GoalReminder.goal_id` references `Goal` with `ON DELETE CASCADE`: deleting a goal row also deletes its reminder. The app has no goal delete; only scripts and test cleanup delete goals. A goal with entries still cannot be deleted, because `Entry.goal_id` stays `ON DELETE RESTRICT`.

## Options considered

- **A. CASCADE, as `GoalTarget` (ADR 0092) (chosen).**
- B. RESTRICT, as `Entry`: a goal with a reminder could not be deleted before its reminder.

## Why

A reminder has no meaning without its goal, the same reason as ADR 0092. The F-17 contract (section 8) said only "reference to `Goal`".
