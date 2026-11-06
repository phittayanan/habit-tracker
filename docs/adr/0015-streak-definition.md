# 0015. What a streak means

Status: accepted
Design ID: D-14 (Issue #3)

## Decision
A. Consecutive days where the daily target was met. One missed day resets it to zero.

## Options considered
- A. Consecutive days where the daily target was met. One missed day resets it to zero. **(chosen)**
- B. Consecutive days with any entry, whatever the value.
- C. Consecutive days where the target was met, and one missed day in a row is allowed.
- D. The product has no streak. The theme's streak item is not built, and the change is recorded as an approved scope change.
- Other: your own answer.

## Why
One clear rule that uses the same "day met" check as progress (D-12); today does not break the streak until the day is over.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
