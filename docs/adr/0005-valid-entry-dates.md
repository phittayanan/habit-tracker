# 0005. Valid entry dates

Status: accepted
Design ID: D-04 (Issue #3)

## Decision
C. Past or today, but only inside the goal's start and end dates. Entries outside the goal period are rejected.

## Options considered
- A. Today only. Nothing can be backfilled, and the date check is a single comparison.
- B. Today and past dates, no future dates. Backfilling is possible, so edits and streaks must handle older days.
- C. Past or today, but only inside the goal's start and end dates. Entries outside the goal period are rejected. **(chosen)**
- D. Any date inside the goal's period, including future dates. Planned entries are possible, and progress must handle days not yet reached.
- Other: your own answer.

## Why
Two simple date checks (not in the future, inside the goal period); both give clear rejection tests for Sprint 1.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
