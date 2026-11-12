# Goal implementation evidence — Issue #40

Scope: F-07, FR-10, BR-05/06, AC-07.1 through AC-07.10. Part of #9. Implement only Goal creation and own-goal listing; entries, progress, template edit, calendar, release and submission stay outside this work.

## Authorization and contract checkpoint

Base: live `staging` at `e16289ceff8e9b252502565ffc8d25cf01ab4256`. Prerequisites verified merged: https://github.com/phittayanan/habit-tracker/pull/34, https://github.com/phittayanan/habit-tracker/pull/37 and https://github.com/phittayanan/habit-tracker/pull/39. No open PR duplicated this work at start.

Implementation owner: phittayanan. Reviewer/merger: projectnewy. On 2026-11-08 projectnewy accepted the ownership change (phittayanan built F-07, projectnewy reviews and merges) in a re-review comment on PR #41: https://github.com/phittayanan/habit-tracker/pull/41#issuecomment-6724823769. Firstmate's 2026-11-08 steering confirms this session's approved Issue #40 includes camelCase JSON, newest `created_at` first and `400 TARGET_ABOVE_TEMPLATE_MAX`. That steering is owner-only approval for implementation. projectnewy separately accepted OP-07.3, OP-07.4 and OP-07.6 in the same comment (https://github.com/phittayanan/habit-tracker/pull/41#issuecomment-6724823769); earlier contract history is unchanged. The existing F-07 API, acceptance criteria and tests specify those behaviors; this implementation follows them. The full edit/create race remains F-04 work (OP-07.11); TC-74 proves the required lock here.

## Test plan before implementation

- TC-20: exact API shape, session-owned row despite extra owner fields, persistence after a process restart and own-only newest-first list.
- TC-21 / TC-55: active and future-start duplicates refused, ended/different-template/different-owner allowed; simultaneous same-user requests store one row.
- TC-22: state before start, on start/end and after end, with explicit Bangkok today.
- TC-53 / TC-54: all template/target/date validation, real calendar dates, Decimal(10,2) boundaries, validation before range before duplicate; 401/403 before validation.
- TC-74: hold a real PostgreSQL template-row lock, start HTTP creation, assert pending after 500 ms, commit a lower maximum, then assert current-range refusal and no inserted goal.
- TC-60 / TC-47 / TC-48: real form/API creation, retained values and API message, disabled Save, active-only templates and Bangkok default, keyboard and no overflow at 375×900 and 1280×900.
- Extend TC-08 discovery/access checks for both Goal methods and run existing Auth/Template regressions, clean migration, repeat seed, builds and rule coverage. Planned checks are not passes.

Verification checkpoints and final results follow. Human review is pending.

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

## Final verification

Application/test revision: `370066f7c7bf665823a9ba3b670d295aaf8ea0e5`. Later commits change evidence and links only. Local environment: macOS, Node 26.8.1, npm 11.19.0, PostgreSQL 16.15, Prisma 6.19.3 and installed Chrome through Playwright. Tests use an explicitly named existing local database owner and a new task-only database. The connection URL is omitted from public evidence.

```text
server/: TEST_DATABASE_URL=<task-test-url> npm test
41 tests; 41 passed; 0 failed; 0 skipped
server/: npm run build
exit 0
client/: PLAYWRIGHT_CHANNEL=chrome TEST_DATABASE_URL=<task-test-url> npm test
26 passed (14.7s), 375×900 and 1280×900
client/: npm run build
exit 0
server/: DATABASE_URL=<task-test-url> node node_modules/prisma/build/index.js migrate status
3 migrations; database schema is up to date
server/: TEST_DATABASE_URL=<task-test-url> node --experimental-test-coverage --test test/goal-rules.test.js
2 passed; goal-rules.js 100% lines, branches and functions
```

The coverage command ran on `a2a7ce2`; only the expired-session browser fixture changed between that revision and `370066f`. The final server and browser suites ran sequentially on `370066f`. Logs: `server-verified.log`, `server-build-verified.log`, `browser-verified.log`, `client-build-verified.log`, `coverage-final.log` under the task proof directory. These are local results. Application CI, Docker, deployment, Windows/Git Bash and timed clean-clone setup were not run. The pre-existing Prisma audit findings described in Auth evidence were not changed or re-audited here.

### Keyboard portability resolution

Firstmate authorized a minimal reproduction after the checkpoint blocker. `date-probe.mjs` and `date-probe.log` compare the same input in default and explicit `en-US` contexts, retaining `America/Los_Angeles`. Mouse/form `fill('2026-11-08')` succeeds in both contexts. Keyboard month/day/year gives `2026-08-11`; changing only the sequence to day/month/year gives `2026-11-08`. Pinning the locale does not control native segment order on this Chrome/OS combination.

Commit `a2a7ce2` adds a keyboard-only probe in a minimal page, derives the observed order, enters the real form by keyboard and asserts its ISO value before Save. Focus rings, tab traversal, form submission/cancel, Bangkok default and the non-Bangkok timezone remain tested. The focused rerun passed 2/2 after waiting for the template option to load. A subsequent full run passed 25/26 and exposed a separate expired-session fixture race. Commit `370066f` fills the loaded form before deleting its session, then submits to exercise the intended API 401 redirect. That focused check passed 2/2, followed by the final 26/26 full run above. No input is assigned through DOM evaluation in the keyboard journey.

### Acceptance evidence

| AC | Verified by |
|---|---|
| AC-07.1, AC-07.2 | TC-20: exact response, stripped owner fields, stored session owner, child-process restart, own-only newest-first listing |
| AC-07.3 | TC-21: future-start/active duplicate refusal and simultaneous same-user creation producing one 201, one 409 and one stored row |
| AC-07.4 | TC-55: earlier Ended goal, different template and another Participant's active goal; body owner cannot override session |
| AC-07.5 | TC-22: before start, on start/end and after end; fixed Bangkok midnight unit cases |
| AC-07.6, AC-07.8 | TC-53 and TC-08: validation cases, Manager 403 and anonymous 401 on both endpoints, validation before business rules |
| AC-07.7 | TC-54: max equality, above-max refusal, Decimal boundary and combined-failure precedence |
| AC-07.9 | TC-60: real API create, disabled Save, duplicate API message and all typed values retained |
| AC-07.10 | TC-74: request remains pending at 500 ms while the real row lock is held; after committing max 10, target 20 is refused and no Goal is stored |
| NFR-05/06 on Goal screens | TC-47/48: exact 375px and 1280px widths, no horizontal overflow, keyboard-only create/cancel, visible focus and control heights |

### Before/after comparison

Local artifact: `/Users/phittayanan/dev/agentic-workflow/data/habit-goal-build/compare/index.html`. Eight pairs cover Goals empty/populated and form idle/rejected at 1280×900 and 375×900. `manifest.json` records both source revisions, filenames, dimensions and SHA-256 values. The comparison index links to https://github.com/phittayanan/habit-tracker/pull/41.

Base `e16289c` has a Goals heading and no `/goals/new` route. Captions disclose that populated/form states do not exist on base; the actual heading/404 is shown. For exact base recapture, the three changed existing UI/route files were temporarily loaded from base, the base client was built, and all three head source files were restored byte-for-byte from task-owned backups and rebuilt. No alternate worktree was created. Head captures use the built app and synthetic task fixtures. Browser assertions check the Bangkok default, actual API save, duplicate message/retained target and no overflow.

The first screenshot pass used CLI resize, which Chrome clamped to 500px. Those images were replaced using explicit viewport emulation. Every final PNG was checked for its signature and exact expected dimensions. The screenshot CLI reported a saved-path parser error after writing the PNGs; acceptance rests on the verified files and browser viewport assertions. No screenshot was visually inspected and no preview was published. The temporary app processes were stopped.

`bash .github/scripts/test-check-pr-issue-link.sh` also passed all existing metadata-check regression cases; `git diff --check` passed. Live staging remained `e16289c` and no other open PR was found when the busy schema, route index and package manifests were rechecked. Package manifests are unchanged.

Human review/merge is pending. The implementation leaves F-04 template edit and its two-request race, entries, progress, calendar, broader F-10 work, release and assessment submission for their own tasks. The measured 100% applies to this Goal rule module, not all future BR-01 to BR-07 code or CI coverage.

Implementation review: https://github.com/phittayanan/habit-tracker/pull/41, base `staging`, non-draft. A substantive review was requested from projectnewy under the explicit team-workflow submission authorization.

### Review round 1

projectnewy review 5818758376 asked TC-20 to spawn its child with `fileURLToPath`, because `new URL(...).pathname` is not a Windows filesystem path. `server/test/goal.test.js` now passes `fileURLToPath(new URL('./goal-process.js', import.meta.url))`. On macOS, `server/` `TEST_DATABASE_URL=<disposable-test-url> npm test` passed 41/41, including TC-20, after applying the three migrations to a new empty database. Windows and Git Bash were not run. The template-row lock question and OP-07.3/4/6 agreement were not changed.

## Issue #62: template select keyboard step on Linux and Windows

TC-47 / TC-48 (`client/test/goals.spec.js`, "goals screens fit and keyboard alone opens, submits and cancels form") failed on Windows (Issue #62) and on the Linux CI job of PR #71, at both widths. It passed on macOS.

- **Expected:** after `ArrowDown`, `s`, `Enter` on the focused Template select, the value is the Sleep template and one `Tab` focuses Daily target.
- **Observed on Linux, staging `8d69138`:** the value is right (line 98 passes), but `Tab` leaves focus on the select. Line 99 fails with `toBeFocused`, "Received: inactive", at 375 px and 1280 px: 2 failed.

A diagnostic test (not committed) recorded, after each key, the focused element, the select value, whether the select matched `:open`, and which `keydown`, `change` and `focusin` events reached the page. Results, Chromium 158.0.8127.18 at 1280 px:

| Keys after the select has focus | Linux | macOS |
|---|---|---|
| `ArrowDown` | value changes, picker stays closed | picker opens, value unchanged |
| `s` | no further change | value changes |
| `Enter` | **picker opens** | no change; the picker stays marked open |
| `Tab` | **no page event; picker closes; focus stays on the select** | `keydown Tab` reaches the page; Daily target gets focus |
| `Enter`, `Tab` only | picker opens, then Tab only closes it | Tab moves focus |
| `ArrowDown`, `s`, `Tab` (no `Enter`) | Tab moves focus | Tab moves focus |
| `ArrowDown`, `s`, `Enter`, `Escape`, `Tab` | Escape closes the picker, Tab moves focus | Tab moves focus |
| `ArrowDown`, `s`, `Enter`, `Tab`, `Tab` | the second Tab moves focus | the first Tab already moves focus |
| `s`, `Tab` | value changes with the picker closed; Tab moves focus | same |

- **Trigger:** the test presses `Enter` on a closed select.
- **Masking condition:** the browser's select behaviour per platform. On Linux, Enter opens the picker and the open picker consumes the next Tab to close itself. On macOS, Enter does not do this, so the same keys pass. Issue #62 reports the same symptom on Windows; Windows was not run in this task.
- **Visible symptom:** line 99, Daily target not focused after Tab.
- **Smallest counterfactual:** removing only `Enter` makes Tab move focus on Linux. Adding `Escape` after `Enter` does too.
- **What would have disproved it:** Tab reaching the page (`keydown Tab`) with focus still on the select, the select not matching `:open` after Enter, or the failure remaining without Enter. None happened. The app form is keyboard reachable on Linux: once the picker is closed, Tab moves on. So the cause is the test's key sequence, not the app; no app code changed.

Fix (`50d09c2`): the test chooses the template by typing its first letter, `s`, on the closed select, then asserts the value and that Tab focuses Daily target. Typing a letter selects an option without opening the picker on both platforms tested. The rest of the journey (Tab order, focus outline, dates, Save, Cancel, no overflow, 44 px controls) is unchanged. The TC-48 procedure in `docs/sprints/sprint-1/README.md` lists Tab, Shift+Tab, Enter and Space; choosing an option still needs one more key (the old test used `ArrowDown` and `s`, the new one `s`). Its wording is unchanged.

Runs (the diagnostic test and logs are kept outside the repository):

| Environment | Test or suite | `8d69138` (before) | `50d09c2` (after) |
|---|---|---|---|
| Linux aarch64 container, Playwright 1.65.0, Chromium 158 | TC-47 / TC-48, both widths | 2 failed | 2 passed |
| same | whole client suite | — | 44 passed |
| same | server suite | — | 82 of 82 |
| Linux x86-64 container, Google Chrome 157.0.8103.78 (`PLAYWRIGHT_CHANNEL=chrome`, as in the PR #71 CI job) | TC-47 / TC-48, both widths | 2 failed | 2 passed |
| same | whole client suite | — | 44 passed |
| same | server suite | — | 82 of 82 |
| macOS 27.2.1, Node.js 26.8.1, Chromium 158 | whole client suite | — | 44 passed |
| same | server suite | — | 82 of 82 |
| macOS, Google Chrome 157.0.8103.51 | `goals.spec.js` | — | 6 passed |

Commands: from `server/`, `npm test`; from `client/`, `npx playwright test`. Both used a disposable PostgreSQL 16 test database in Docker. In the Linux containers the source copy was made a Git snapshot so that TC-44 / TC-45's `git grep` scan of tracked files can run; without it that test exits 128 (one run, kept). Not run: Windows. The single macOS failure at 1280 px on 2026-11-10 (Issue #62) was not reproduced or investigated here.
