# 0083. An edit or delete cannot take the day total above the maximum

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q9). Agreed by phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171) of PR #171.

## Decision

An edit or delete after which the day total would be above the template's `max_value` is refused with `409 DAILY_TOTAL_ABOVE_MAX` and changes nothing. For a delete this can happen only on a template that allows negative values.

## Options considered

- **A. Refuse (chosen).**
- B. Allow it and let the total exceed the maximum.

## Why

BR-04 stays true for every stored day.
