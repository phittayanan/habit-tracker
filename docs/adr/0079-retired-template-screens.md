# 0079. Screens after a template is retired

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q5). To be agreed by phittayanan in the review of the #150 PR.

## Decision

1. The Manager's table keeps the row with the word "Retired" and no Edit or Retire button.
2. The API refuses an edit of a retired template, also when no goal uses it.
3. A Participant's existing goals on it show its name and unit as before, with no extra label. This answers SRS A-5.

## Options considered

- **A. No buttons; existing goals unchanged (chosen).**
- B. A, plus a "Retired template" label on existing goals.
- C. An unused retired template can still be edited.

## Why

A retired template cannot start a goal, so editing it has no use, and existing goals continue (ADR 0017).
