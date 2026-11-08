# Goal implementation evidence — Issue #40

Scope: F-07, FR-10, BR-05/06, AC-07.1 through AC-07.10. Part of #9. Implement only Goal creation and own-goal listing; entries, progress, template edit, calendar, release and submission stay outside this work.

## Authorization and contract checkpoint

Base: live `staging` at `e16289ceff8e9b252502565ffc8d25cf01ab4256`. Prerequisites verified merged: https://github.com/phittayanan/habit-tracker/pull/34, https://github.com/phittayanan/habit-tracker/pull/37 and https://github.com/phittayanan/habit-tracker/pull/39. No open PR duplicated this work at start.

Implementation owner: phittayanan. Proposed reviewer/merger: projectnewy; agreement to the changed ownership is unverified. Firstmate's 2026-11-08 steering confirms this session's approved Issue #40 includes camelCase JSON, newest `created_at` first and `400 TARGET_ABOVE_TEMPLATE_MAX`. This is owner-only approval for implementation, not a claim that projectnewy settled OP-07.3/4/6 or that earlier contract history changed. The existing F-07 API, acceptance criteria and tests specify those behaviors; this implementation follows them. The full edit/create race remains F-04 work (OP-07.11); TC-74 proves the required lock here.

## Test plan before implementation

- TC-20: exact API shape, session-owned row despite extra owner fields, persistence after a process restart and own-only newest-first list.
- TC-21 / TC-55: active and future-start duplicates refused, ended/different-template/different-owner allowed; simultaneous same-user requests store one row.
- TC-22: state before start, on start/end and after end, with explicit Bangkok today.
- TC-53 / TC-54: all template/target/date validation, real calendar dates, Decimal(10,2) boundaries, validation before range before duplicate; 401/403 before validation.
- TC-74: hold a real PostgreSQL template-row lock, start HTTP creation, assert pending after 500 ms, commit a lower maximum, then assert current-range refusal and no inserted goal.
- TC-60 / TC-47 / TC-48: real form/API creation, retained values and API message, disabled Save, active-only templates and Bangkok default, keyboard and no overflow at 375×900 and 1280×900.
- Extend TC-08 discovery/access checks for both Goal methods and run existing Auth/Template regressions, clean migration, repeat seed, builds and rule coverage. Planned checks are not passes.

Implementation and verification results will be recorded after execution. Human review is pending.
