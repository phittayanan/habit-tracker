# 0080. Only the value of an entry can be edited

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q6). Agreed by phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171.

## Decision

An edit changes an entry's value. Its date and goal cannot change; a wrong date is fixed by deleting the entry and recording it again.

## Options considered

- **A. Value only (chosen).**
- B. Value and date.

## Why

Fewer rules and tests.
