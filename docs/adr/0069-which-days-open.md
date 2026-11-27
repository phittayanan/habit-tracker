# 0069. Which days open, and which goals a day lists

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q6). To be agreed by projectnewy in the review of the #151 PR.

## Decision

1. A future day is shown but cannot be opened. Today and past days open.
2. A day lists only the goals whose start and end dates include that day. With none, it says "No goals on this day."

## Options considered

- **A. Only valid days and goals (chosen).**
- B. Every day opens with every goal, and invalid saves get the BR-01 error. Rejected: it offers inputs that can only fail.
