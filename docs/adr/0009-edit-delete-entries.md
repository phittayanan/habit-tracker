# 0009. Editing and deleting entries

Status: accepted
Design ID: D-08 (Issue #3)

## Decision
C. Edit or delete on any day inside the goal period. Progress and streaks are recomputed after each change.

## Options considered
- A. Entries cannot be edited or deleted once saved. Fewer rules, and a wrong entry stays.
- B. Edit or delete on the same day only. A short correction window, and older data is fixed.
- C. Edit or delete on any day inside the goal period. Progress and streaks are recomputed after each change. **(chosen)**
- D. Delete only, no edit. A wrong entry is removed and entered again.
- Other: your own answer.

## Why
Same date rule as D-04; progress and streaks are computed from the entries each time, so an edit needs no extra update step. Not in Sprint 1.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
