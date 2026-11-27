# 0075. Goal versions in a new table; daily_target stays as the latest target

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q1). To be agreed by phittayanan in the review of the #150 PR. Issue #150 says both students decide this.

## Decision

1. A new table `GoalTarget` (goal, effective-from date, daily target; one row per goal and date) stores the goal versions.
2. `Goal.daily_target` is kept and always holds the latest target. Every change updates it in the same transaction as the version row.
3. The migration is additive: it creates the table and copies each existing goal's `daily_target` into one row effective from its start date. No column is changed or dropped.
4. A day uses the version with the latest effective-from date on or before it. A goal with no such row uses `daily_target`.
5. This replaces the sentence in SDS 3.5 that moves the column to the version rows.

## Options considered

- **A. Keep the column and update it to the latest target (chosen).**
- B. Keep the column holding the first target. After a rollback, today and later days would use the old first target.
- C. Move the column, as SDS 3.5 said. The previous app version could not run after a rollback.

## Why

An app rollback keeps working and judges today against the current target. While rolled back, days before a change are judged against the latest target; no version row is lost.
