# Progress and privacy implementation evidence (Issue #44)

F-09 Progress (days met) and F-10 Participant data privacy, built from the merged `docs/sprints/sprint-1/F-09-progress.md` and `F-10-privacy.md`. Written by projectnewy with Claude Code. Review by phittayanan is pending.

## History

| Step | Commit | Result |
|---|---|---|
| Failing tests first | `af813de` | Server: `progress-rules.test.js`, `progress.test.js`, `privacy.test.js` run serially: 10 reported, 4 passed, 6 failed (the rule module is absent, so its file fails as one). Browser: `progress.spec.js`, 6 failed (3 tests at 2 widths) |
| Implementation | `df8f61b` | `computeProgress`, progress in the goal list, "N of M days met" on the goals page |

The 4 server tests that passed at the red commit are TC-33, TC-34, TC-57 and the Manager/anonymous check of AC-09.8. F-10 asks for rules that the F-07 and F-08 endpoints already enforce (ownership 404, Manager 403, anonymous 401, stripped owner fields), so those tests pass without new code: they are the access-restriction evidence, not a fix. Only the progress parts were red.

## What was built

- `server/src/services/progress-rules.js`: pure `computeProgress(goal, entries, today)`. `today` is an argument (an Asia/Bangkok date), so the rule does not depend on the real date or the machine time zone. Nothing is stored; a test checks that no progress or days column exists.
- `server/src/services/goal.js`: `listGoals` reads the entries of the caller's goals in one query and adds `progress: { daysMet, daysSoFar }`. `POST /api/goals` keeps its F-07 response without `progress` (the contract adds it to `GET /api/goals` only).
- `client/src/goals.jsx`: each goal shows "N of M days met"; the list reloads after an entry is saved, so the text changes without a page reload.
- No new endpoint, table or migration (F-09 section 8).
- One existing test changed: TC-20 in `goal.test.js` compares the listed goal with the created one, so it now expects the added `progress` field (`{ daysMet: 0, daysSoFar: 1 }`).

## Commands and results

Environment: Windows 11, Node.js 24.14.0, PostgreSQL 16 in Docker (disposable test database), Prisma 6.19.3, Playwright Chromium headless shell.

```text
server/: npm test
68 tests; 68 passed; 0 failed; 0 skipped
server/: node --experimental-test-coverage --test test/progress-rules.test.js
4 passed; progress-rules.js 100% lines, branches and functions
server/: npm run build, client/: npm run build   exit 0
client/: npx playwright test
36 passed, 2 failed at 375px and 1280px
```

The 2 failures are the existing `goals.spec.js` TC-47 / TC-48 (Goal create form keyboard step) on Windows. They also fail on `staging` without this change and are recorded as a known limitation (see PR #43); they are unrelated to Issue #44.

## AC to test

| AC | Verified by |
|---|---|
| AC-09.1, AC-09.2, AC-09.3 | TC-31 (unit: met, missed, empty days, today counts) and the API test with 30 / 29.9 / 45 giving 2 of 10 |
| AC-09.4, AC-09.5 | TC-31 (unit: not started 0 of 0, Ended goal stops at its end date) and the same cases over the API |
| AC-09.6 | API test: `daysMet` rises after a saved entry and is the same from a new app process |
| AC-09.7 | TC-32 (browser: "2 of 10 days met"), and TC-59 shows "0 of 1", then "1 of 1" without a reload |
| AC-09.8 | Anonymous 401 and Manager 403 on `GET /api/goals` (TC-59, TC-34) |
| AC-10.1, AC-10.2, AC-10.6 | TC-33 |
| AC-10.3, AC-10.4 | TC-34 (every goal and entry endpoint, read and write; the stored rows are compared before and after) |
| AC-10.5 | TC-57 (same status and same body for another user's goal and an unknown id, on GET and POST) |
| AC-10.7 | TC-35 (API and browser: each Participant sees only own goals, entries and progress) |
| NFR-05/06 | TC-32 checks no horizontal overflow at both widths; the existing TC-47/48 cover the form |

## Limits

- TC-59 is the full journey in the browser, but the app restart in it is replaced by logging out and back in (a new session reads the saved result). The real restart (new process and connection) is in the server test for AC-09.6.
- Only the Windows run above. Nothing was run on macOS, Chrome stable or CI.
- The progress rule is covered at 100%; coverage of the whole Sprint 1 rule code (AC-SYS.4) is not claimed.
- Screenshots were not taken.
