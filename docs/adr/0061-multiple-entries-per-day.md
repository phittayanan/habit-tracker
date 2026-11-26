# 0061. Several entries per day, with a day total up to the template maximum

Status: decided by projectnewy, owner of [Issue #139](https://github.com/phittayanan/habit-tracker/issues/139), on 2026-11-27; agreement by phittayanan is pending in the review of the PR for that Issue. Replaces ADR 0008.

## Decision

1. A Participant may record several entries for one goal on one day.
2. Each entry stays inside the template's minimum and maximum (inclusive), as before.
3. The sum of a goal's entries on one day must not be above the template's maximum. Equal is allowed. An entry that would go above it is refused and stores nothing.
4. A day is met when the sum of its entries reaches the goal's daily target.
5. The daily target rule does not change: above the template's minimum and not above its maximum (SRS A-4, ADR 0054).
6. Entries still cannot be edited or deleted. That is FR-17 (Sprint 2).

Items 3 and 5 were chosen by projectnewy from the options below. Error code, list order, the day-total display and negative values are proposals in F-08 (OP-08.9 to OP-08.12).

## Why

With one entry per day (ADR 0008), a Participant who records an amount in the morning cannot record the rest later that day, and because Sprint 1 has no edit, the day stays at the first value (SRS A-11). This is the change request of CPE 334 Lab 7: behaviour that was correct under ADR 0008 changes because the requirement changes.

## Options considered

- Day total: **not above the template maximum (chosen)**; or no limit on the total. The limit keeps a day's value inside the range the Manager defined (for example, sleep cannot add up to more than the maximum of 24 hours).
- Daily target: **keep "not above the maximum" (chosen)**; or allow a higher target, which could never be met with a capped total.

## Consequences

- `max_value` now limits both one entry and one day's total.
- The unique index on `Entry (goal_id, entry_date)` is dropped. The database no longer settles two requests at once, so the service locks the goal row while it checks the total and inserts.
- A wrong entry still cannot be fixed, and a further entry makes the total larger.
- After the migration, an app rollback to `v1.4` would accept further same-day entries without checking the total, because that code relies on the unique index.
- Sprint 2 work must follow this rule: editing an entry (FR-17) must keep the day total within the maximum, and the side panel of FR-15 (one number box per goal) has to allow several entries.
