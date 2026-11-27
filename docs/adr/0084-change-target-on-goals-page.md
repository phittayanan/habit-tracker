# 0084. The target is changed on the goals page

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q10). To be agreed by phittayanan in the review of the #150 PR. Amends ADR 0073 point 2: the goals page also gains this control.

## Decision

Each goal that has not ended has a "Change target" button on the goals page. It opens a box in place with Save and Cancel and says from which date the new target applies.

## Options considered

- **A. In place on the goals page (chosen).**
- B. A separate page `/goals/:id/edit`.

## Why

Less to build and test.
