# Template implementation evidence — Issue #36

Scope: F-03 and F-06 only. F-04 (the edit page, `PATCH /api/templates/:id`, and the in-use refusal) and the Sprint 2 retire refusal (TC-19) are not in this Issue. The Manager Edit control is visible because AC-03.6 requires it, and it does not start an edit flow. This records local checks. Teammate review and merge remain pending.

Implementation review: [https://github.com/phittayanan/habit-tracker/pull/37](https://github.com/phittayanan/habit-tracker/pull/37), targeting `staging`, reviewer projectnewy.

## Test-first record

- Red commit: `a19f025` (`test: specify template create and view before the routes exist`). The commit includes the additive `Template` migration because the new fixtures write template rows.
- Server command, from `server/`: `npm test`.
- Red server result: exit 1. `tests 30`, `pass 22`, `fail 8`. The eight failures are the new template tests (missing service module, `POST`/`GET /api/templates` 404, and demo seed not writing templates). The existing auth tests passed, including TC-44.
- Browser command, from `client/`: `npm test` (Playwright projects `375px` and `1280px`).
- Red browser result: exit 1. `8 failed`, `12 passed`. The failures are TC-11, TC-70, TC-16 and the template TC-47/TC-48 run, at both widths. The auth browser tests passed.

## Checks on the implementation commit

Environment: Node.js 26.8.1, npm 11.19.0, PostgreSQL 16.15, Prisma 6.19.3. API tests use a disposable database named for this task, contract fixtures, and passwords generated at runtime. The connection string is not recorded here.

Tested commit: `5435e89` (`feat: add manager template create and participant read-only view`).

```text
npm test
ℹ tests 31
ℹ pass 31
ℹ fail 0
EXIT:0
```

That server run was repeated on commit `5435e89`.

```text
npm test
20 passed
EXIT:0
```

The browser run covers both 375px and 1280px, including keyboard use on the template list and the new-template form (TC-47, TC-48). It passed on the tree committed as `5435e89`.

| Acceptance criteria | Tests | Result on `5435e89` |
|---|---|---|
| AC-03.1 | TC-09 | Passed |
| AC-03.2 | TC-10 | Passed |
| AC-03.3 | TC-68 | Passed |
| AC-03.4 | TC-69 | Passed |
| AC-03.5 | TC-68 | Passed |
| AC-03.6 | TC-11 | Passed |
| AC-03.7 | TC-70 | Passed |
| AC-06.1 | TC-16 | Passed |
| AC-06.2 | TC-16 | Passed |
| AC-06.3 | TC-17 | Passed |
| AC-02.2 for the new routes | TC-08 | Passed (`GET /api/templates`, `POST /api/templates`) |

Not run for this Issue: TC-12, TC-13, TC-18, TC-19, TC-71, TC-72, TC-73. Docker, CI and cloud setup were not run.

`SEED_DEMO_DATA=true` upserts `Reading`, `Walking` and `Water` by name and can run twice. The database check is `Template_min_below_max` (`min_value < max_value`), and `Template_name_key` is unique. The migration does not change `User` or `Session`.
