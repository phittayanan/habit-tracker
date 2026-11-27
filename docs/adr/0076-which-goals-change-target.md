# 0076. A target can change while the goal has not ended

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q2). Agreed by phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171.

## Decision

A Participant can change the daily target of a goal whose end date is today or later, including a goal that has not started. The new target is effective from today, or from the start date if the goal has not started. An ended goal is refused.

## Options considered

- **A. Any goal that has not ended (chosen).**
- B. Only a goal running today.

## Why

A goal that has not started can be corrected, and a finished goal's results stay.
