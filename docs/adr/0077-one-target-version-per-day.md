# 0077. One target version per goal and effective date

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q3). To be agreed by phittayanan in the review of the #150 PR.

## Decision

A second change with the same effective-from date replaces that date's row. A goal has at most one target for any day.

## Options considered

- **A. Replace that date's row (chosen).**
- B. Keep every change and use the last one.

## Why

Each day is judged against one target.
