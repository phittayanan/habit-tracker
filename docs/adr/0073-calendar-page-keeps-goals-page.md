# 0073. The calendar is a new first page; the Sprint 1 goals page stays

Status: chosen by phittayanan on 2026-11-27 (R1), answering projectnewy's blocking finding 1 in the [review of d4c72cb](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087108343) of PR #167 ([Issue #151](https://github.com/phittayanan/habit-tracker/issues/151)). Point 4 chosen by phittayanan on 2026-11-27 (R4), answering projectnewy's blocking finding 1 in the [review of 2a4b0e5](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087213487); point 2's wording follows suggestion 2 of that review.

## Decision

1. The month calendar (F-11) is a new page, `/calendar`, and the Participant's first page after login.
2. The Sprint 1 goals page stays at `/goals`, unchanged except the display and input of Time values (ADR 0065 points 3 and 4; F-07 AC-07.13, F-08 AC-08.21): days-met progress (FR-12), the entry list with day totals (F-08 AC-08.17) and the record form with a date box.
3. The Participant's menu is "Calendar", "Goals", "Templates". The Manager's menu does not change; a Manager who opens `/calendar` sees "This page is not available for your role." (F-02 OP-02.2).
4. Sprint 1 browser tests change only in the steps that lead to the goals page; every check on the goals page itself (days met, the entry list, "Day total", the record form) stays as it is. The steps that may change:
   - after a Participant logs in, the expected address is `/calendar`, not `/goals` (the login helpers in the auth, entries, goals, progress and templates specs, and TC-65);
   - a test that checks the goals page first opens it with the menu item "Goals" (TC-32, TC-61, TC-86, the journey TC-59 and the goals and entries TC-47/TC-48);
   - TC-07: the Participant's menu is exactly "Calendar", "Goals", "Templates";
   - the auth TC-47/TC-48: after login, Tab reaches "Calendar", then "Goals", then "Templates".

## Options considered

- **A. Keep both (chosen).**
- B. Replace the goals page with the calendar. Rejected: every Sprint 1 browser test of that page would be rewritten, and the Sprint 1 journey (D2 Part A) would change.
- C. One page with the calendar on top and the list under it.

## Why

The Sprint 1 journey and what its tests check on the goals page (TC-32, TC-59, TC-61, TC-86) stay the same; only the way into that page changes, because the first page after login is now the calendar. The first wording of this ADR said those tests pass unchanged; they cannot, since their login steps expect `/goals` (projectnewy, [review of 2a4b0e5](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087213487)), so point 4 names the steps that change.
