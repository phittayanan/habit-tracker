# Sprint 2 contracts

Deliverable 2 Part B. Each contract is written and reviewed before its code. The state of the build is in the Issues and `docs/traceability.md`.

| Contract | Requirements | Tests | Code Issue |
|---|---|---|---|
| [F-05 Template retire](F-05-template-retire.md) | FR-08, BR-08 | TC-14, TC-15, TC-19, TC-140 to TC-143 | #152 |
| [F-11 Month calendar and day box](F-11-month-calendar.md) | FR-15 | see the contract | #155 |
| [F-12 Calendar day colours](F-12-day-colours.md) | FR-16, BR-15 | see the contract | #156 |
| [F-13 Entry edit and delete](F-13-entry-edit-delete.md) | FR-17, BR-11 | TC-38, TC-144 to TC-151 | #154 |
| [F-14 Goal change](F-14-goal-change.md) | FR-18, BR-12 | TC-39, TC-152 to TC-159 | #153 |
| [F-15 Calendar and List](F-15-calendar-list.md) | FR-19 | see the contract | #156 |

The template kind (ADR 0064) revises F-03, F-04, F-07 and F-08 and is built in #168.

## Order

- F-05 and F-14 need only Sprint 1.
- F-13's goals-page controls need only Sprint 1; its day-box controls need F-11 (#155).
- F-12 needs F-11 and F-14.
