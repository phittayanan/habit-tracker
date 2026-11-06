# Auth implementation evidence — Issue #32

Scope: F-01/F-02 only. This records a backend checkpoint, not completion of the Issue. UI, Playwright and comparison screenshots remain pending design agreement through firstmate. No implementation PR has been opened yet.

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
| AC-01.10 | TC-65 | Pending UI design and Playwright |
| AC-02.1 | TC-07 | Pending UI design and Playwright |
| AC-02.2 | TC-08 | Passed for implemented Auth routes and test-only Manager route; future domain routes deferred |
| AC-02.3, AC-02.4 | TC-66 | Passed, validator/existence/handler spies untouched on rejection; next request reads changed DB role |
| AC-02.5 | TC-67 | Pending UI design and Playwright |
| NFR-05, NFR-06 | TC-47, TC-48 | Pending UI and keyboard/375px/1280px checks |

Additional tests cover successful login replacing an incoming session, stripped extra fields, trimmed username, standard unknown-API 404, and absence of the test-only Manager route in the production app. The seed test checks three users after two runs, hashes against current environment values, and failure without creating users for each missing password variable. Production startup never injects test routes; build copies only `src/`.

## Remaining limits and open decisions

- OP-01.12 stays open: no dummy bcrypt comparison; unknown usernames may return faster. OP-01.11 excludes failed-login limiting in Sprint 1.
- OP-10.1 stays open; this Issue does not decide later privacy test duplication.
- Generic 404 uses “Not found.”; its contracted envelope/code are fixed, but the contract does not prescribe the message text.
- Local Docker daemon was unavailable; PostgreSQL 16 was already running locally and was used directly. No shared service was started, stopped or reconfigured.
- npm audit reported three high-severity findings in the Prisma CLI/config dependency chain (`deepmerge-ts`, advisory GHSA-ggr8-5vv4-36mx). No automatic major upgrade or unverified override was applied at this checkpoint.
- No client, complete acceptance result, screenshot comparison, deployment, CI or teammate review is claimed. These remain required before delivery.
