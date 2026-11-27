# 0082. Deleting an entry asks first

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q8). Agreed by phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171.

## Decision

Delete shows the entry's value, unit and date with "Cancel" and "Delete". Nothing is removed until "Delete".

## Options considered

- **A. Ask first (chosen).**
- B. Delete at once.

## Why

A deleted entry cannot be restored.
