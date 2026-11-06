# 0013. How progress is computed

Status: accepted
Design ID: D-12 (Issue #3)

## Decision
B. Days met: the count of days where the day's value reached the daily target, out of the days so far.

## Options considered
- A. Percent of the target reached: the sum of entries divided by the goal target.
- B. Days met: the count of days where the day's value reached the daily target, out of the days so far. **(chosen)**
- C. Both A and B on the same screen. Two measures to specify and test.
- D. The total so far and the amount remaining, with no percentage. Plain numbers only.
- Other: your own answer.

## Why
It matches a daily target (D-09) and is one count that is easy to test.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
