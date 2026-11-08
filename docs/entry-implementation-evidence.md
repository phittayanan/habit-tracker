# Entry implementation evidence (Issue #42)

F-08 Daily entry recording, built from the merged `docs/sprints/sprint-1/F-08-entry.md` (including the decimal revision merged in PR #39). Written by projectnewy with Claude Code. Review by phittayanan is pending.

## History

| Step | Commit | Result |
|---|---|---|
| Failing tests first | `d43f160` | `server/test/entry-rules.test.js` and `server/test/entry.test.js` only (11 tests): 0 passed, 11 failed (rule module and `Entry` model absent) |
| Implementation | `7d2979b` | Entry migration and model, rule module, service, two routes, entry form on the goals page, browser tests |

## What was built

- Additive migration `20261109000100_entry`: table `Entry` (`goal_id` restrict, `entry_date` date, `value` Decimal(10,2), `created_at`) and a unique index on goal and day. No existing table changes.
- `server/src/services/entry-rules.js`: `parseEntryCreate`, `checkEntryRules(entry, goal, template, now)`, `defaultEntryDate(now)`. The instant is an argument, so the rules do not depend on the real date or the machine time zone.
- `server/src/services/entry.js` and `server/src/routes/entries.js`: `POST` and `GET /api/goals/:id/entries`. Check order: session, role, ownership (404 `GOAL_NOT_FOUND` for unknown and other users' goals), validation, then future, outside goal, out of range. A duplicate day is decided by the database unique constraint (409 `ENTRY_ALREADY_EXISTS`).
- `client/src/goals.jsx`: each goal row has a date box (default: Bangkok today), a value box with the template unit, Save entry (disabled while saving), the API message with the typed value kept, and the saved entries list ("No entries yet" when empty).
- Existing tests that clear tables now delete entries before goals, because of the new foreign key.

## Commands and results

Environment: Windows 11, Node.js 24.14.0, PostgreSQL 16 in Docker (port 5433, disposable `habit_tracker_test` database), Prisma 6.19.3, Playwright Chromium headless shell.

```text
server/: npm test (TEST_DATABASE_URL set)
55 tests; 55 passed; 0 failed; 0 skipped
server/: node --experimental-test-coverage --test test/entry-rules.test.js
4 passed; entry-rules.js 100% lines, branches and functions
server/: npm run build, client/: npm run build   exit 0
client/: npx playwright test (PLAYWRIGHT_OUTPUT_DIR set)
28 passed, 2 failed at 375px and 1280px
```

The 2 Playwright failures are `goals.spec.js` TC-47 / TC-48 (Goal create form, keyboard test), at both widths. They fail at the select keyboard step (`Daily target` not focused after Tab). They fail the same way on `staging` without this change (checked by stashing the change and running that test alone), so they are not caused by Issue #42. They look like a Windows Chromium difference in keyboard handling of the native select, and are not investigated here.

## AC to test

| AC | Verified by |
|---|---|
| AC-08.1 | TC-23 (API, shape, ownership from the goal, list) and TC-58 (new process after restart); browser: value and unit shown after reload |
| AC-08.2 | TC-24 (API and unit): future date, also when outside the goal |
| AC-08.3, AC-08.11 | TC-25 and TC-30: outside the period rejected, inside an ended goal accepted |
| AC-08.4 | TC-26: start date and today (end date) accepted |
| AC-08.5, AC-08.12 | TC-27: unit test with `TZ=UTC` at 16:59:59Z and 17:00:00Z; browser: the default date box equals the Bangkok date with the browser set to America/Los_Angeles |
| AC-08.6 | TC-28: limits accepted, outside rejected |
| AC-08.7 | TC-29: second entry 409, first value unchanged, two simultaneous requests give one 201 and one 409 |
| AC-08.8, AC-08.9 | TC-56: bad bodies 400, Manager 403, anonymous 401, other user's or unknown goal 404; both endpoints |
| AC-08.10 | TC-61 (browser): API message shown, typed value kept, Save disabled while the request is held |
| NFR-05/06 on the entry form | TC-47 / TC-48 (new, `entries.spec.js`): no horizontal overflow, controls at least 44px, keyboard-only Save, visible focus |

## Limits

- Nothing was run on macOS, with Chrome stable, or in CI. Only the Windows run above.
- The unrelated TC-47 / TC-48 Goal failures above stay open.
- Entry edit and delete (FR-17) and progress (F-09) are out of scope. A wrong same-day entry cannot be fixed yet (SRS A-11).
- Screenshots were not taken.
