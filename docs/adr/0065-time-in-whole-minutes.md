# 0065. A Time goal stores whole minutes

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q2). To be agreed by projectnewy in the review of the #151 PR.

## Decision

1. For a `TIME` template the unit is `minutes`; the Manager cannot type another unit.
2. The template's minimum and maximum, a goal's daily target and every entry value are whole minutes. A value with a fraction is refused with `400 VALIDATION_ERROR`.
3. Screens show time as hours and minutes, for example "7 h 10 min", "45 min" or "7 h".

## Options considered

- **B. Minutes, whole numbers (chosen).**
- A. Hours with 2 decimals. Rejected: an exact time such as 7 h 10 min (7.1666… h) cannot be stored under BR-03's 2 decimal places.
- C. A free unit. Rejected: the bar could not know its scale.

## Why

Any hours-and-minutes value is exact in whole minutes, so the "exact value against BR-03 two decimals" open point of [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) goes away.
