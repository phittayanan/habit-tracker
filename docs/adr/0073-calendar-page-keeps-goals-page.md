# 0073. The calendar is a new first page; the Sprint 1 goals page stays

Status: chosen by phittayanan on 2026-11-27 (R1), answering projectnewy's blocking finding 1 in the [review of d4c72cb](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087108343) of PR #167 ([Issue #151](https://github.com/phittayanan/habit-tracker/issues/151)).

## Decision

1. The month calendar (F-11) is a new page, `/calendar`, and the Participant's first page after login.
2. The Sprint 1 goals page stays at `/goals`, unchanged: days-met progress (FR-12), the entry list with day totals (F-08 AC-08.17) and the record form with a date box.
3. The Participant's menu is "Calendar", "Goals", "Templates". The Manager's menu does not change; a Manager who opens `/calendar` sees "This page is not available for your role." (F-02 OP-02.2).

## Options considered

- **A. Keep both (chosen).**
- B. Replace the goals page with the calendar. Rejected: every Sprint 1 browser test of that page would be rewritten, and the Sprint 1 journey (D2 Part A) would change.
- C. One page with the calendar on top and the list under it.

## Why

The Sprint 1 journey and its tests (TC-32, TC-59, TC-61, TC-86) keep working unchanged; only the first page after login changes.
