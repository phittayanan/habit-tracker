# Template kind implementation evidence (Issue #168)

Contract: the Sprint 2 revisions of F-03, F-04, F-07 and F-08 (ADR 0064, ADR 0065). Run on Windows 11, Node.js 24.14.0, PostgreSQL 16 in a temporary Docker container, Chrome for the browser tests. Run by Claude Code; not yet run in CI.

## Before the change

- Existing server suite on `staging` (9d56635): 99 tests, 99 pass.
- New server tests (`server/test/template-kind.test.js`, TC-118, TC-127, TC-128, TC-129) against the unchanged code: 5 tests, 0 pass, 5 fail.
- New browser tests (`client/test/template-kind.spec.js`, TC-119 and TC-131) against the unchanged code, at 375 px and 1280 px: 6 failed.

## After the change

| Command | Result |
|---|---|
| `npm test` in `server/` | 104 tests, 104 pass, 0 fail, 0 skipped |
| `npm test` in `client/` (`PLAYWRIGHT_CHANNEL=chrome`) | 56 passed |

## Sprint 1 tests that changed

- Template objects now carry `kind` (F-03 section 7): the exact response shapes in `template.test.js`, `template-edit.test.js` and `goal.test.js` include it.
- TC-11: the Manager's table has the Kind column (AC-03.9).
- The two template TC-47 / TC-48 keyboard tests: one more Tab step for the Kind choice. The first run after the change failed these 4 cases (2 tests at 2 widths); what they check is unchanged.

## Choices the contracts do not spell out (accepted by projectnewy on 2026-11-27)

1. The Kind choice and the Kind column come right after Name.
2. A `TIME` template can be created without a `unit` in the request.
3. Choosing Count again on the form puts back the unit typed before Time.
4. The Participant's template table also shows a Time range in hours and minutes (ADR 0065 point 3, "every screen").
5. A goal's embedded template carries `kind` too, so the goals page can format Time values.

Not done: no deploy; the migration has not run on Cloud SQL; the screens were not checked by a person.
