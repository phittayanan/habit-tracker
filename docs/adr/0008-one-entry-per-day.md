# 0008. Second entry on the same day

Status: accepted
Design ID: D-07 (Issue #3)

## Decision
B. One entry per day. A second entry is rejected, but the participant can edit the existing entry (see D-08).

## Options considered
- A. One entry per participant, template and day. A second entry is rejected with an error.
- B. One entry per day. A second entry is rejected, but the participant can edit the existing entry (see D-08). **(chosen)**
- C. One entry per day. A second entry replaces the first.
- D. Several entries per day are added together. Each entry must be inside the range, and the daily total may also have a maximum.
- Other: your own answer.

## Why
The rejected second entry is the Sprint 1 business-rule test; editing comes later (D-08).

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
