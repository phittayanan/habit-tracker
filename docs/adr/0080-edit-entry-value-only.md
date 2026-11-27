# 0080. Only the value of an entry can be edited

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q6). To be agreed by phittayanan in the review of the #150 PR.

## Decision

An edit changes an entry's value. Its date and goal cannot change; a wrong date is fixed by deleting the entry and recording it again.

## Options considered

- **A. Value only (chosen).**
- B. Value and date.

## Why

Fewer rules and tests.
