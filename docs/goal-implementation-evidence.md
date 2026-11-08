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

## Implementation checkpoint (validation incomplete)

Spec/test-plan commit: `3c188a1`. Tests-first commit: `35d82b4`, including the additive Goal schema/migration so fixtures can use the real table.

At `35d82b4`, from `server/`, `DATABASE_URL=<task-test-url> npm run prisma:generate` and `npm run prisma:migrate` succeeded on a newly created, isolated PostgreSQL database. All three migrations applied. No existing grants or shared services changed.

Red runs on `35d82b4`:

- `server/`: `TEST_DATABASE_URL=<task-test-url> npm test`: 39 tests, 31 passed, 8 failed. Seven Goal cases failed on missing endpoints/rule module or absent lock waiting; the eighth failure was `/goals/new` returning 404 in the production page test. The migration test passed.
- `client/`: `PLAYWRIGHT_CHANNEL=chrome TEST_DATABASE_URL=<task-test-url> npm test -- --grep 'TC-60|TC-47 / TC-48: goals|Goal screens' --timeout 5000`: all 6 Goal browser cases failed on the absent screens.

The implementation adds the Goal endpoints, session-owned creation/listing, exact decimal/calendar validation, computed Bangkok state, template-row transaction lock and same-user concurrency guard. The form follows the existing template-form style. TC-08 now chooses a genuinely wrong-role cookie for each endpoint. Existing test cleanup removes Goal rows before their referenced fixtures.

Checks on the implementation tree before this checkpoint commit:

- `server/`: `TEST_DATABASE_URL=<task-test-url> npm test`: **41 passed, 0 failed, 0 skipped**. Includes actual child-process restart, own-only newest listing, simultaneous requests, TC-74 held lock and committed-range check, and seed repeatability.
- `server/`: `TEST_DATABASE_URL=<task-test-url> node --experimental-test-coverage --test test/goal-rules.test.js`: **2 passed**; `goal-rules.js` **100% lines, branches and functions**. These additional rule unit tests were added during implementation; the initial API/browser tests precede it.
- `client/`: `PLAYWRIGHT_CHANNEL=chrome TEST_DATABASE_URL=<task-test-url> npm test`: **24 passed, 2 failed**. TC-60, timezone/default-date, expired-session, Manager restrictions, and existing Auth/Template browser cases passed. Both keyboard cases failed because their native date sequence left the end date empty.
- A focused rerun after resetting native segments still failed **2/2**: the test entered `2026-08-11` instead of `2026-11-08`, demonstrating that this Chrome uses day-first segments. This is a test portability blocker; no passing keyboard result is claimed. The task brief requires stopping after the same obstacle twice, so firstmate was notified before a third attempt.
- `npm run build` succeeded in both folders. `git diff --check` passed. The UI mechanical detector returned `[]`.

Logs: `/Users/phittayanan/dev/agentic-workflow/data/habit-goal-build/`, including `server-red.log`, `browser-red.log`, `server-first-green.log`, `server-green.log`, `coverage.log`, `browser-first-green.log`, `browser-green.log` and `keyboard.log`. The first implementation server run passed 36/39; its three failures identified TC-08's old single-role-cookie assumption, which was corrected before the 41/41 run. The first browser implementation run failed 6/6 because the implicit select label included option text in the exact label lookup; the form now uses an explicit label. The remaining failures above are recorded separately.

Baseline screenshots exist for empty/populated goals and idle/rejected form states at 375×900 and 1280×900. On base `e16289c`, Goals is a heading and `/goals/new` returns 404, so the base cannot express populated or form states. Eight PNG signatures were verified. Head screenshots and the comparison index remain pending. No PR has been opened, and no human review, merge, release, deployment or submission is claimed.
