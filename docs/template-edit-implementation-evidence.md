# Template edit implementation evidence (Issue #53)

F-04 Template edit, built from the merged `docs/sprints/sprint-1/F-04-template-edit.md`. Written with Claude Code for phittayanan (implementation owner). Implementation review: [https://github.com/phittayanan/habit-tracker/pull/54](https://github.com/phittayanan/habit-tracker/pull/54), targeting `staging`. The proposed reviewer is projectnewy. Teammate review and merge have not happened yet.

## History

| Step | Commit | Result |
|---|---|---|
| Spec | `14475ba` | The F-04 contract states the template row lock in sections 4 and 8 (as OP-04.4 decided), and TC-13 adds the edit-versus-goal race that F-07 OP-07.11 left for F-04. OP-04.9 lists three edit-page details as a proposal. Traceability rows link #53 |
| Failing tests | `e4fe33d` | Server: 79 tests, 70 passed, 9 failed. Browser: 44 tests, 38 passed, 6 failed |
| Implementation | `3d1ccbb` | `PATCH /api/templates/:id`, the edit service, and the edit page. Server: 79 passed. Browser: 44 passed |

At the red commit the 9 server failures were TC-08 (the PATCH route was not in the audited list), TC-12, TC-13, both TC-13 race tests, TC-71, both TC-72 tests and TC-18. The browser failures were TC-73, the direct-visit test and the edit-form TC-47/TC-48, each at 375 px and 1280 px. One new server test passed at red: a foreign `Origin` gets `403 ORIGIN_NOT_ALLOWED`. It passed because the F-01 Origin middleware already runs on every write method, so it checks existing behaviour and is not evidence that new code works.

## What was built

- `server/src/services/template.js`:
  - `parseTemplateEdit` checks the id (a positive whole number) and the body. The body may hold any non-empty subset of `name`, `unit`, `minValue` and `maxValue`, with the same field rules and messages as F-03. Unknown fields are stripped.
  - `mergedRangeAllowed` is the merged-range rule (TC-72 unit test).
  - `editTemplate` does all of its work in one transaction. It locks the template row with `SELECT ... FOR UPDATE`, then checks for a missing template (404), then counts Goal rows of any state (409 `TEMPLATE_IN_USE`), then checks the merged range (400 `MIN_NOT_BELOW_MAX`), then updates. A duplicate name comes back from the unique index as `409 TEMPLATE_NAME_EXISTS`.
  - An id above the PostgreSQL `integer` range gets 404 without a query.
- `server/src/routes/templates.js`: the route runs session, then Manager role, then validation, then the service, so the check order matches contract section 4. The route is registered for the TC-08 route audit.
- Goal creation (F-07) already took the same row lock before this Issue (`server/src/services/goal.js`, AC-07.10). It is unchanged.
- `client/src/templates.jsx`: Edit on each row opens `/templates/:id/edit`. That page reuses the F-03 form, filled from `GET /api/templates`. Save sends only the changed fields with `PATCH`. A refusal shows the API message and keeps the typed values, and Save is disabled while the request runs. `client/src/App.jsx` routes the page. The Participant role guard for this path existed already.
- No migration, no new table and no package change.

## Commands and results

Environment: macOS 27.2, Node.js 26.8.1, npm 11.19.0, PostgreSQL 16.15 (local, existing database-owner role, a separate disposable database for this Issue), Prisma 6.19.3, Playwright Chromium. The connection strings are not recorded here.

```text
client/: npm run build            # before server tests (the built-client test reads dist)
server/: npm test                 # on 3d1ccbb
ℹ tests 79
ℹ pass 79
ℹ fail 0
EXIT:0
client/: npm test                 # on 3d1ccbb, projects 375px and 1280px
44 passed (33.6s)
EXIT:0
server/: node --experimental-test-coverage --test --test-concurrency=1 test/template-edit.test.js test/template.test.js
ℹ tests 18, pass 18, fail 0
template.js | line 96.85 % | branch 87.93 % | funcs 88.24 %   (uncovered: the rethrow of non-duplicate database errors)
```

Lock counterfactual: the `FOR UPDATE` was removed from `editTemplate` by hand and only the two TC-13 race tests were run. Both failed: the edit returned `200` and changed the maximum while a goal was being created on that template. The change was then reverted, and it was never committed.

## Acceptance criteria

| AC | Tests | Result on `3d1ccbb` |
|---|---|---|
| AC-04.1 | TC-12 (`server/test/template-edit.test.js`) | pass |
| AC-04.2 | TC-13, TC-13 race (a) and (b) | pass |
| AC-04.3 | TC-72 unit and API | pass |
| AC-04.4 | TC-71 | pass |
| AC-04.5 | TC-13 (`minValue` 50 on a used template gets `409 TEMPLATE_IN_USE`) | pass |
| AC-04.6 | TC-73, edit-page direct visit (`client/test/templates.spec.js`), both widths | pass |
| AC-04.7 | TC-18; TC-08 Participant 403 on the PATCH route | pass |
| NFR-05, NFR-06 on the edit screen | TC-47 / TC-48 edit-form test, both widths | pass |

## Known limits

- TC-13 race (b) sends the edit and the goal at the same time, 10 rounds. Either order is valid, and the test does not force both orders to happen. Race (a) forces the order where the goal transaction holds the lock first, and checks in `pg_stat_activity` that the edit waits on the lock. F-07 TC-74 covers the other order (the goal waits for a lock).
- OP-04.9 is still a proposal. It covers the heading "Edit template", the empty-body message "Change at least one of name, unit, minimum or maximum." and the "Template not found." page for an unknown id. The reviewer should confirm or change it.
- The edit page reads the template from `GET /api/templates`, because the contract has no single-template endpoint.
- The run was on macOS only. Windows was not run.
- A Retired template that no goal uses (OP-04.8) cannot be reached in Sprint 1, so it was not tested.
