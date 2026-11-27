# 0089. An ended goal has no current streak

Status: chosen by projectnewy on 2026-11-27 in [Issue #157](https://github.com/phittayanan/habit-tracker/issues/157) (Q4). Agreed by phittayanan in the [review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219) of PR #174.

## Decision

An ended goal shows no current streak. Its best streak stays on its detail page.

## Options considered

- A. Show none (chosen).
- B. Show the run that ends on the end date.

## Why

No streak is running any more, and a number could read as if it were.
