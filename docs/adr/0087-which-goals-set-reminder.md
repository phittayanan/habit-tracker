# 0087. A reminder can be set while the goal has not ended

Status: chosen by projectnewy on 2026-11-27 in [Issue #157](https://github.com/phittayanan/habit-tracker/issues/157) (Q2). Agreed by phittayanan in the [review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219) of PR #174.

## Decision

A reminder can be set or changed when the goal's end date is today or later, including a goal that has not started. An ended goal still shows its reminder and it can be removed.

## Options considered

- A. Goals that have not ended (chosen).
- B. Every goal.

## Why

It follows the rule for target changes (ADR 0076).
