# Auth implementation evidence — Issue #32

Scope: F-01/F-02 only, implementation Issue #32, Part of #9. The owner selected package A on 2026-11-07 through firstmate, recorded in ADR 0050. This records local implementation evidence; teammate re-review and merge remain pending.

Implementation review: [https://github.com/phittayanan/habit-tracker/pull/34](https://github.com/phittayanan/habit-tracker/pull/34), targeting `staging`, reviewer projectnewy.

## Test-first record

- Red commit: `e4ce130` (`test: specify auth API and session contracts before implementation`).
- Command from `server/`: `npm test`.
- Outcome before implementation: exit 1; two test files failed to import the absent implementation modules (`src/app.js`, `src/services/session.js`), 0 passed. The test bodies specify the API/data assertions before implementation; this run did not reach individual assertions. Browser tests have not been written/run yet.
- The first implementation validation hit Prisma P1010 with a URL that omitted the local role. Read-only diagnosis showed psql implicitly selected the local owner but Prisma needed its username explicitly. Adding the existing database owner to the task URL fixed this without altering roles, grants or services.

## Backend checks actually run

Environment: Node.js 26.8.1, npm 11.19.0, PostgreSQL 16.15, Prisma 6.19.3. Tests use a dedicated disposable PostgreSQL database with contract fixtures and generated test passwords; no server clock hook.

```text
DATABASE_URL=<disposable-test-database-url> npm run prisma:migrate
Applied 20261107000100_auth on a clean database; success.

TEST_DATABASE_URL=<disposable-test-database-url> npm test
tests 15; pass 15; fail 0; skipped 0

npm ci
Installed 123 packages; exit 0 (audit limitations below).
npm run prisma:generate
Generated Prisma Client 6.19.3; exit 0.
npm run build
Copied server source to dist; exit 0.
```

Tested backend commit: `88ce7eb` (`feat: implement database auth and shared role protection`). The full suite was rerun on that committed revision: 15 passed, 0 failed, 0 skipped. The connection URL is intentionally omitted here; local usernames and passwords are deployment configuration.

The built server was also started with `PORT=33132 DATABASE_URL=<disposable-test-database-url> npm start`. Assertions against that process returned `/api/health` 200, `/api/ready` 200, `/api/auth/me` 401, and `/api/test/manager/1` 404. The process was stopped after verification. These are backend HTTP assertions, not browser checks.

| Acceptance criteria | Implemented tests | Status at backend checkpoint |
|---|---|---|
| AC-01.1 | TC-01, TC-46 | API and unit passed |
| AC-01.2 | TC-02 | Passed |
| AC-01.3 | TC-62 | Passed, including malformed JSON |
| AC-01.4 | TC-03 | Passed, logout replay rejected |
| AC-01.5 | TC-04 | Passed for both roles, exact public-user shape |
| AC-01.6 | TC-05 | Passed, missing/unknown/deleted/malformed cookie |
| AC-01.7 | TC-06, TC-63 | Passed, fixed expiry and exact boundary |
| AC-01.8 | TC-44, TC-45 | Passed, seed/hash checks and tracked-file scan |
| AC-01.9 | TC-64 | Passed, Origin precedence, port and forwarded HTTPS cases |
| AC-01.10 | TC-65 | Playwright passed at 375px and 1280px |
| AC-02.1 | TC-07 | Playwright passed for both roles on the test-only protected page |
| AC-02.2 | TC-08 | Passed for implemented Auth routes and test-only Manager route; future domain routes deferred |
| AC-02.3, AC-02.4 | TC-66 | Passed, validator/existence/handler spies untouched on rejection; next request reads changed DB role |
| AC-02.5 | TC-67 | Playwright passed: no session and deleted database session |
| NFR-05, NFR-06 | TC-47, TC-48 | Playwright passed: real 375px/1280px viewports, no overflow, Tab/Enter form/menu/logout, masked password, focus outline and control heights |

Additional tests cover successful login replacing an incoming session, stripped extra fields, trimmed username, standard unknown-API 404, and absence of the test-only Manager route in the production app. The seed test checks three users after two runs, hashes against current environment values, and failure without creating users for each missing password variable. Production startup never injects test routes; build copies only `src/`.

## Client and production-serving test-first record

- Spec commit `10c25f6`: records the owner's complete package A answer without deciding an open contract proposal.
- Browser red commit `2c5f60d`: six browser cases and test harness, before client source. From `client/`, `TEST_DATABASE_URL=<test-url> npm test -- --grep TC-65 --project 375px --timeout 5000 --max-failures 1` failed 1/1 at `page.goto('/login')` with `ERR_HTTP_RESPONSE_CODE_FAILURE`. The absent screen failed before form assertions; the remaining cases were not claimed as individually red.
- Client implementation `30b0a53`: `npm test` ran all 12 cases (six at each width), 12 passed, 0 failed. It uses the real API and dedicated PostgreSQL fixtures for successful login, logout, identity and session deletion. Only the held loading/500 case intercepts a request; contract API errors are separately tested against PostgreSQL.
- The built-process check found `/login` returned 500 although Vite tests passed. Red regression commit `d61c85d`: `node --test test/client.test.js` failed 1/1 (`500 !== 200`). The isolated checkout's hidden `.treehouse` ancestor was rejected by absolute `sendFile`. Fix `f803b89` uses `sendFile('index.html', { root: clientDir })`; the same regression passed 1/1 and confirms all five contracted addresses serve HTML while `/test/protected` remains 404.
- At `f803b89`, after both builds: server `TEST_DATABASE_URL=<test-url> npm test`: **16 passed, 0 failed, 0 skipped**. Client: **12 passed, 0 failed**, 375×900 and 1280×900, Chrome through Playwright. The later browser-channel environment option was rerun with `PLAYWRIGHT_CHANNEL=chrome TEST_DATABASE_URL=<test-url> npm test`: 12 passed. Final documentation/PR metadata commits do not alter application code.
- `npm ci`, `npm run build` succeeded in both folders; `npm run prisma:generate` succeeded with Prisma 6.19.3. Client audit: zero vulnerabilities. Node 26.8.1, npm 11.19.0, PostgreSQL 16.15, React 19.3.1, Vite 8.3.6, Playwright 1.65.0.

The production server ran with `PORT=33134 DATABASE_URL=<test-url> npm start`; the browser comparison used this built app, not the Vite test app. All role destinations are headings only. Test-only page registration/entry stays in `client/test/`, test route injection stays in tests, and neither is bundled or registered by production startup.

Initial-build tested revision: `2e2c4d2` (includes configurable Playwright channel and setup documentation). On that committed revision the server suite passed 16/16 and `PLAYWRIGHT_CHANNEL=chrome TEST_DATABASE_URL=<test-url> npm test` in `client/` passed 12/12. Subsequent initial-build commits add only review links and factual evidence; the current review round below adds bounded test and code corrections.

## Before/after comparison

Local artifact: `/Users/phittayanan/dev/agentic-workflow/data/habit-auth-build/compare/index.html`. Its manifest records base `1c72dbf` and application head `f803b89`. There are 16 rows / 32 PNGs: idle, rejected and loading login; Manager Templates; Participant Goals and Templates; each role's wrong-role screen; each at 375×900 and 1280×900.

The base has no app or server. Its screenshots honestly show static-server 404s at the same addresses in an archive of `origin/staging`; no prior UI was fabricated. Captions disclose that matching authenticated/loading states cannot exist on that base. Head screenshots use the real built app and synthetic accounts. Browser assertions checked actual width, no overflow, expected text, exact menus, form width, cleared password and disabled loading submit. No screenshot was visually inspected. The screenshot CLI reported a success-text parser error after MCP had saved files; capture accepted only newly written PNGs with valid signatures and expected dimensions. The comparison artifact is local proof, not shipped app content.

## Prisma audit investigation

`npm audit --json` reports three high findings from **one** advisory, [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx): installed `deepmerge-ts@7.1.5`, `@prisma/config@6.19.3`, and `prisma@6.19.3`. The advisory affects deepmerge-ts `<8.0.0`, fixed in `8.0.0`, when both merged object graphs contain recursive self-references. Plain JSON cannot create that condition.

Reachability inspection: `@prisma/config/dist/index.js` imports `deepmerge` inside `loadConfigTsOrJs` and passes it to c12 as the configuration merger. Auth imports generated Prisma Client and never accepts a Prisma configuration file or calls this merger from a request. This repository has no `prisma.config.ts/js`; schema and CLI environment configuration are local/trusted. No Auth request path to attacker-controlled recursive configuration was found. This is a source inspection, not a claim that the installed package is invulnerable: `npm audit --omit=dev` still reports all three because Prisma is also an optional peer of the client in this installation.

Registry checks found latest Prisma 6 is 6.19.3; its config package pins deepmerge-ts exactly to 7.1.5. Audit's offered fix is Prisma **7.10.1**, a major upgrade. A deepmerge-ts 8 override would cross that pinned major and is not a verified compatible maintenance fix. No safe compatible published fix was found; no major upgrade, downgrade or override was applied. The three findings remain disclosed for reviewer follow-up.

## Remaining limits and open decisions

- OP-01.12 is implemented in the current review round using a cost-10 dummy bcrypt comparison, authorized by the current review and owner brief (ADR 0051). This is comparable bcrypt work, not a guarantee of identical response times. OP-01.11 still excludes failed-login limiting in Sprint 1.
- OP-10.1 stays open; this Issue does not decide later privacy test duplication.
- Generic 404 uses “Not found.”; its contracted envelope/code are fixed, but the contract does not prescribe the message text.
- Local Docker daemon was unavailable; PostgreSQL 16 was already running locally and was used directly. No shared service was started, stopped or reconfigured.
- The Prisma audit findings remain as investigated above.
- Docker, deployment, application CI and timed clean-clone TC-50 were not run in this task. Wider TC-47/48 screen coverage and later endpoint rows of TC-08 belong to their feature Issues. Teammate review/merge is not claimed.
- Historical branch failure: run [42315501649](https://github.com/phittayanan/habit-tracker/actions/runs/42315501649) used `feature/32-habit-auth-build` at `8a374d078e088762e7bfe871b791612866727eae`; its branch-name rejection was on the superseded branch, not the canonical PR's own run. The old implementation PR https://github.com/phittayanan/habit-tracker/pull/33 is intentionally retained here as history only. Canonical https://github.com/phittayanan/habit-tracker/pull/34 uses `feat/32-habit-auth-build`. Its own run [42334588859](https://github.com/phittayanan/habit-tracker/actions/runs/42334588859) passed at `e25f30f39c1cf720a307adb45056d17a262ba720`; GitHub's run metadata associates it with this PR. Two older failing check objects at that same SHA came from the superseded `feature/` ref (runs `42315692160`, `42315694172`); an aggregate of three check objects is not three runs on the canonical PR. Fresh post-push run/head evidence is recorded in the PR body.

## Current implementation review round — 2026-11-07

Source: projectnewy's [changes-requested review](https://github.com/phittayanan/habit-tracker/pull/34#pullrequestreview-5810651960), full Issue #32, the preceding https://github.com/phittayanan/habit-tracker/pull/31 discussion, and the owner-authorized current review-fix brief. Package A is unchanged. ADR 0050 records owner approval with teammate agreement pending; no separate teammate layout comment was present when checked. ADR 0051 records current authorization for OP-01.12. The earlier corrected contract review proposed OP-01.12 as an open point and its later approval body was empty; this round does not invent explicit historical approval.

### Red/green evidence

All commands below run from `server/` with `TEST_DATABASE_URL=<disposable-test-url>`. Logs are task-owned proof outside Git at `/Users/phittayanan/dev/agentic-workflow/data/habit-auth-build/review-fixes/`.

| Finding | Red evidence | Green evidence |
|---|---|---|
| TC-44/45 launcher portability | `5e3e02c`: `node --test --test-name-pattern=TC-44 test/auth.test.js` fails 1/1, `spawnSync npm ENOENT`, with empty PATH and a different temporary cwd | `22de689`: same command passes 1/1 using `process.execPath` and the actual absolute seed path. The real seed runs twice, checks all three hashes and scans tracked files for generated password values; each missing-password invocation fails with no accounts created. This proves independence from npm lookup/cwd on macOS, not Windows execution |
| TC-08 independent discovery | `584dacd`: `node --test --test-name-pattern=TC-08 test/auth.test.js` has 1 pass / 1 fail, “Missing expected rejection”: a nested route missing both middleware and coverage entry escaped the old audit | `7a43461`: same command passes 4/4. Discovery walks the real Express tree; test setup records mount paths because Express 5 keeps matchers in closures. Exact public method/path exceptions, nested routers, GET/PATCH and implicit HEAD, path-array mounts, an omitted method, registration without protection, and protected/registered fixtures are exercised. No future domain route was added |
| TC-02 / OP-01.12 | `eae5319`: `node --test --test-name-pattern=TC-02 test/auth.test.js` fails 1/1: real bcrypt compare count `1 !== 2` | `502789f`: same command passes 2/2. A call-through bcrypt spy verifies both real comparisons use cost 10, and identical 401 bodies, no cookie and no session remain. A separate regression refuses an unknown username even if its dummy comparison reports a match |
| TC-04 request identity | The initial runs at `135e35f` and `9ea4356` both failed before assertions because Node's mock API could not spy on Prisma's proxy; these are **instrumentation failures, not red evidence**. After steering 005, the repaired observer at `7cc6bfa` was run against a bounded counterfactual: replace only `server/src/middleware/auth.js` with `git show 502789f:server/src/middleware/auth.js`, then `node --test '--test-name-pattern=TC-04 regression' test/auth.test.js`. It fails 1/1 on extra `createdAt` and `passwordHash` keys | The committed selected-field middleware was restored byte for byte in a `finally` block. `node --test '--test-name-pattern=TC-04\|TC-05\|TC-66' test/auth.test.js` passes 4/4 at `7cc6bfa`. The real middleware/real PostgreSQL observer checks exact `req.user` and related user fields, excludes hashes, and is never reached for absent/unknown sessions. Role-order checks still pass. Source inspection confirms Prisma selects only `id`, `username`, `displayName`, `role` |
| TC-62 shared JSON parser errors | `00c6c55`: `node --test '--test-name-pattern=TC-62 regression' test/auth.test.js` fails 1/1, `500 !== 400` on the existing test-only Manager route | `31746a3`: `node --test '--test-name-pattern=TC-62\|TC-64' test/auth.test.js` passes 3/3. Malformed and oversized JSON outside login get safe `400 VALIDATION_ERROR`; login retains its exact message; Origin/session/role precedence remains. This is shared-handler coverage, not execution of future TC-53/56 domain endpoints |

### Full validation

Application and test revision: `31746a38d475888804702206570196128630e463`. Subsequent evidence edits are documentation only. macOS 27.2, Node.js 26.8.1, npm 11.19.0, Prisma 6.19.3, existing disposable PostgreSQL 16 database; Chrome via Playwright. Windows/Git Bash execution is unavailable and was not claimed. The README explains Git Bash shell syntax and a writable Windows artifact path.

```text
client/: npm ci; npm run build
22 packages installed; audit 0 vulnerabilities; build exit 0
server/: npm ci; npm run prisma:generate; npm run build
123 packages installed; Prisma Client 6.19.3 generated; build exit 0
server/: DATABASE_URL=<disposable-test-url> npm run prisma:migrate
1 migration found; no pending migrations
server/: DATABASE_URL=<disposable-test-url> node node_modules/prisma/build/index.js migrate status
Database schema is up to date
server/: TEST_DATABASE_URL=<disposable-test-url> npm test
tests 22; pass 22; fail 0; skipped 0
client/: PLAYWRIGHT_CHANNEL=chrome TEST_DATABASE_URL=<disposable-test-url> npm test
12 passed (6 cases each at 375x900 and 1280x900)
```

The existing task database and permissions were reused; no shared service or permission changed. Schema/migration/seed production code was unchanged in this review round. The full server suite actually invokes the seed against PostgreSQL. The initial clean-database migration evidence remains above; this round reran deploy/status on the existing disposable database.

A built production process (`NODE_ENV=production PORT=33134 DATABASE_URL=<test-url> node dist/index.js`) returned health/ready 200, auth/me 401 with the exact envelope, and 404 for `/api/test/manager/1`, `/api/test/identity`, `/api/test/audit/nested/probe/1` and `/test/protected`. Built login/goals/templates pages returned 200 HTML. The process was stopped after checking. Build output scans found no test API/page/entry markers. Tracked-file checks found no `.env` credential file, personal `.Codex/settings.local.json`, or private-key markers; TC-45 also scanned for each generated seed value without printing it.

Clean installs retain the three high Prisma/deepmerge-ts findings investigated above; the client audit is clean. No stack, dependency or workflow change was made. Browser journeys reran successfully; no visible UI redesign or screenshot recreation was needed. Teammate re-review and merge remain pending, and this round does not dismiss the changes-requested review.
