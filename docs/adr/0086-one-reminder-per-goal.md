# 0086. One reminder per goal, which can be removed

Status: chosen by projectnewy on 2026-11-27 in [Issue #157](https://github.com/phittayanan/habit-tracker/issues/157) (Q1). To be agreed by phittayanan in the review of the #157 PR.

## Decision

A goal has at most one reminder: one time and one or more weekdays. Saving again replaces it, and the owner can remove it.

## Options considered

- A. One, editable and removable (chosen).
- B. One, not removable.
- C. Several per goal.

## Why

It meets FR-21 with little to build, and a reminder that is no longer wanted can be taken off.
