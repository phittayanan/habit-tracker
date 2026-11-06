# 0012. Goal states and transitions

Status: accepted
Design ID: D-11 (Issue #3)

## Decision
A. Active, then Ended when the end date passes. The system sets the state from dates, and the participant takes no state action.

## Options considered
- A. Active, then Ended when the end date passes. The system sets the state from dates, and the participant takes no state action. **(chosen)**
- B. Active, Completed (target met) or Ended (period over). The system sets the state from dates and progress.
- C. Active, Completed, or Cancelled by the participant. The participant can cancel, and cancelled goals take no new entries.
- D. Active or Archived only. The participant archives a goal, and it keeps its history.
- Other: your own answer.

## Why
The state comes from the dates, so nothing is stored that can go wrong; an entry to an ended goal is rejected by the D-04 date rule.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
