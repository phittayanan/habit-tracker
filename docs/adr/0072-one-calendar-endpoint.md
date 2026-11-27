# 0072. One month endpoint for the calendar, the day box and the List

Status: drafted by Claude Code and accepted as drafted by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q11). To be agreed by projectnewy in the review of the #151 PR.

## Decision

1. `GET /api/calendar?month=YYYY-MM` (default: the current month in Asia/Bangkok) returns every day of the month with its state and, per goal active that day, the target, the total, whether it is met and the entries. The calendar, the day box and the List all read it.
2. The SDS endpoint `GET /api/entries?month=YYYY-MM` is dropped; the List reverses the days.
3. A month not in `YYYY-MM` form gets `400 VALIDATION_ERROR`; no session gets 401; a Manager gets 403; only the caller's own goals are included (NFR-03).
4. New test IDs for this work use the block TC-110 to TC-129, so they cannot clash with the IDs of Issue #150.

## Why

One response keeps the three views consistent and gives one place for the privacy tests.
