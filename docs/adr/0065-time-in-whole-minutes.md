# 0065. A Time goal stores whole minutes

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q2). To be agreed by projectnewy in the review of the #151 PR.

## Decision

1. For a `TIME` template the unit is `minutes`; the Manager cannot type another unit.
2. The template's minimum and maximum, a goal's daily target and every entry value are whole minutes. A value with a fraction is refused with `400 VALIDATION_ERROR`.
3. Every screen shows time as hours and minutes, for example "7 h 10 min", "45 min" or "7 h": the calendar, day box and List (F-11, F-15), the Sprint 1 goals page (entries and day totals, F-08), the goal list and form (F-07) and the Manager's template table (F-03).
4. A typed Time value outside the day box (the Manager's minimum and maximum, a goal's target, the record form on the goals page) is typed in minutes, with the hours-and-minutes form shown beside the box ("= 7 h 10 min"). Point 4 and the full list in point 3 were chosen by phittayanan on 2026-11-27 (R3), answering projectnewy's finding 3 in the [review of d4c72cb](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087108343) of PR #167.

## Options considered

- **B. Minutes, whole numbers (chosen).**
- A. Hours with 2 decimals. Rejected: an exact time such as 7 h 10 min (7.1666… h) cannot be stored under BR-03's 2 decimal places.
- C. A free unit. Rejected: the bar could not know its scale.

## Why

Any hours-and-minutes value is exact in whole minutes, so the "exact value against BR-03 two decimals" open point of [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) goes away.
