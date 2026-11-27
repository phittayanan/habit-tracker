# 0077. One target version per goal and effective date

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q3). Agreed by phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171.

## Decision

A second change with the same effective-from date replaces that date's row. A goal has at most one target for any day.

## Options considered

- **A. Replace that date's row (chosen).**
- B. Keep every change and use the last one.

## Why

Each day is judged against one target.
