# 0092. Target versions are deleted with their goal

Status: chosen by phittayanan on 2026-11-27 in the Claude Code session for [Issue #153](https://github.com/phittayanan/habit-tracker/issues/153), from two options Claude Code proposed. projectnewy, the F-14 contract author, agreed in the [review of 136c4b3](https://github.com/phittayanan/habit-tracker/pull/176#pullrequestreview-6089019427) of PR #176. Numbered 0092 and 0093 there, because PR #174 uses 0086 to 0091.

## Decision

`GoalTarget.goal_id` references `Goal` with `ON DELETE CASCADE`: deleting a goal row also deletes its target versions. The app has no goal delete; only test cleanup deletes goals. A goal with entries still cannot be deleted, because `Entry.goal_id` stays `ON DELETE RESTRICT`.

## Options considered

- **A. CASCADE (chosen).**
- B. RESTRICT, as `Entry`. Every goal has a version row, so no goal could be deleted before its versions.

## Why

A target version has no meaning without its goal. Entries are the Participant's own data and keep protecting the goal.
