# Lab 7 implementation: several entries per day

Lab 7 Part B, [Issue #140](https://github.com/phittayanan/habit-tracker/issues/140). Owner: phittayanan. Reviewer and merger: projectnewy. The contract is [change-request.md](change-request.md) and ADR 0061, merged in PR #143 before any test or code.

## 1. Commits, in order

| Step | Commit | What |
|---|---|---|
| Contract follow-up | `2c78509` | TC-61 names the unit (hours); the re-check of PR #143 is linked (asked in that re-check) |
| Tests (RED) | `761d87e` | TC-29 and TC-61 revised; TC-82 to TC-90 added; the schema test revised under TC-89 |
| Implementation (GREEN) | `bbf12a2` | migration, day-total rule under a goal-row lock, progress by day total, list order, day total on the goals page |

Pre-change code: `staging` `c4ba749`, which has the same `server` and `client` code as `v1.4` (`056ee5c`).

## 2. RED: the new tests on the old code (`761d87e`)

Run on 2026-11-27 with the commands of section 4.

- Server: 99 tests, 84 passed, **15 failed**, 0 skipped. Each failing test is new or revised for Lab 7:
  - TC-82, TC-83, TC-85, TC-90 (unit): the old `checkEntryRules` has no day-total rule, so it returns no error where `DAILY_TOTAL_ABOVE_MAX` is expected.
  - TC-87 (unit): the old `computeProgress` compares each entry with the target, so 10 + 20 does not meet 30.
  - TC-29, TC-82, TC-83, TC-85, TC-90 (API): a second entry for a day gets `409 ENTRY_ALREADY_EXISTS` (for example TC-82 `actual: ENTRY_ALREADY_EXISTS`, `expected: DAILY_TOTAL_ABOVE_MAX`).
  - TC-84 (a): `[409, 409]` where `[201, 409]` is expected.
  - TC-84 (b): the request finished during the held goal-row lock (`the request must wait for the goal-row lock`).
  - TC-89 (migration): the rows are identical, then the check fails on `CREATE UNIQUE INDEX "Entry_goal_id_entry_date_key"`.
  - TC-89 (schema) and the entry-list order test: the old unique index refuses the second row of a day that these tests store. This is the old rule itself, not a broken fixture.
- Browser: 50 tests, 44 passed, **6 failed** (TC-61, TC-86, TC-88, each at 375 px and 1280 px). TC-61: `Expected: "Only 16.5 hours left for today."`, `Received: "An entry already exists for this day."`. TC-86 and TC-88: the second entry and "Day total" are not shown.

## 3. GREEN and regression (`bbf12a2`)

| Suite | Why it is relevant | Result |
|---|---|---|
| Server, `npm test` (all 16 files) | Entry, progress, goal, privacy and schema tests guard the unchanged behaviour of [change-request.md section 4](change-request.md#4-behaviour-that-must-not-change-and-what-protects-it) | 99 tests, **99 passed**, 0 failed, 0 skipped |
| Browser, `npx playwright test` (all 5 files, 375 px and 1280 px) | The goals page, entry form, progress, restart journey (TC-59) and privacy (TC-35) | 50 tests, **50 passed**, 0 failed, 0 skipped |
| `prisma migrate diff --from-migrations ... --to-schema-datamodel ... --exit-code` | The schema and the migrations agree | "No difference detected", exit 0 |

The browser run first failed TC-86 on the implementation: the list sort compared equal dates as "less", so two entries of one day could swap. The comparator now returns 0 for equal dates, and the sort keeps the new entry first. This is in `bbf12a2`.

No old test was deleted, skipped or weakened. The expected results that change are those listed in [change-request.md](change-request.md#old-expectations-that-change).

## 4. How it was run

Local, macOS, 2026-11-27: Node 26.8.1, PostgreSQL 16.15 (Homebrew), Prisma 6.19.3, Playwright 1.65.0 with Google Chrome 158 (`PLAYWRIGHT_CHANNEL=chrome`). Two fresh local databases (application and test), both migrated with `npx prisma migrate deploy`; the client built with `npm run build` before the server suite.

```
cd server && npm test
cd client && npx playwright test
```

CI runs the same suites on the PR. Not run: the Docker image and a deployment (Issue #141).

## 5. Acceptance criteria and their tests

| AC | Test (file) |
|---|---|
| AC-08.7 | TC-29 (`server/test/entry.test.js`) |
| AC-08.10 | TC-61 (`client/test/entries.spec.js`) |
| AC-08.13 | TC-82 (`server/test/entry-rules.test.js`, `server/test/entry.test.js`) |
| AC-08.14 | TC-83 (both server files above) |
| AC-08.15 | TC-84 (a) and (b) (`server/test/entry.test.js`) |
| AC-08.16 | TC-85 (both server files above) |
| AC-08.17 | TC-86 (`client/test/entries.spec.js`); list order in "Entry list is newest date first and only for the owner" (`server/test/entry.test.js`) |
| AC-08.18 | TC-89 (`server/test/entry-migration.test.js`; schema part in `server/test/entry.test.js`) |
| AC-08.19 | TC-90 (both server files above) |
| AC-09.1, AC-09.2, AC-09.9 | TC-87 (`server/test/progress-rules.test.js`); TC-31 unchanged |
| AC-09.6, AC-09.10 | TC-88 (`client/test/progress.spec.js`, with a real restart); TC-59 unchanged |

## 6. Notes for the reviewer

- `server/src/services/goal.js` is in the impact table but did not change. It still turns each value into a JavaScript number; `computeProgress` adds whole hundredths (`Math.round(value * 100)`), which is exact for values with at most 2 decimal places. TC-87 (0.7 + 0.1 against 0.8) checks this.
- The day total is summed in the database (`SUM(value)` on `Decimal(10, 2)`) inside the transaction, after `SELECT ... FOR UPDATE` on the goal row. Date, range and validation errors are answered before the transaction, so they take no lock.
- Rollback risk for Issue #141: unchanged from [change-request.md](change-request.md) section 3.
