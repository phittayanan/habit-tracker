<!-- Deliverable 1 rewrite, Part E opening (Issue #11). New text; DoD and system checks checked against tag v1.0 (64831f7). AC text and test design live only in Part E. -->

# Part E. Sprint 1 engineering contracts {#part-e}

A contract is the agreed design of one feature before it is built: its behaviour, rules, failure cases, permissions, interface, data, acceptance criteria (AC) and test specification. Each Sprint 1 contract was written and reviewed in a pull request before its feature was built, and every later change is visible in its version history.

This Part is the only place where AC text and test designs are written out. Rule text is in Part A, and the data model, API conventions, role matrix and session design are in Part C; the contracts refer to them and add only what is specific to the feature. Part F gives the result of every test.

## E.0 Sprint 1 as a whole {#e-0}

### Contracts in this Part

| Section | Feature | AC | Tests |
|---|---|---|---|
| E.1 | F-01 Login, logout and session | AC-01.1 to AC-01.10 | see E.1 |
| E.2 | F-02 Role layout and endpoint protection | AC-02.1 to AC-02.5 | see E.2 |
| E.3 | F-03 Template creation and Manager list | AC-03.1 to AC-03.7 | see E.3 |
| E.4 | F-04 Template edit | AC-04.1 to AC-04.7 | see E.4 |
| E.5 | F-06 Participant template view and write refusal | AC-06.1 to AC-06.3 | see E.5 |
| E.6 | F-07 Goal creation | AC-07.1 to AC-07.10 | see E.6 |
| E.7 | F-08 Daily entry recording | AC-08.1 to AC-08.12 | see E.7 |
| E.8 | F-09 Progress (days met) | AC-09.1 to AC-09.8 | see E.8 |
| E.9 | F-10 Participant data privacy | AC-10.1 to AC-10.7 | see E.9 |
| E.0 | System checks for NFR-05 to NFR-09 | AC-SYS.1 to AC-SYS.5 | TC-47, TC-48, TC-50, TC-51, TC-52 |

There is no F-05 in Sprint 1: retire is a Sprint 2 feature (Part D).

**Test levels** (ADR 0035): *Unit* tests call rule functions directly. *API* tests send real HTTP requests to the Express app, which uses a real PostgreSQL test database. *Browser* tests drive the built app in Chromium with Playwright, against the same test database.

### Product Definition of Done {#product-dod}

The Sprint 1 release counts as done only when each line below is shown by evidence from commands that were actually run. A statement by an AI tool is not evidence.

| # | Done when | Shown by |
|---|---|---|
| 1 | The required behaviour is built | Every Sprint 1 feature is merged and released on `main`; the full journey works through the screens, the API and the database (Part F.2) |
| 2 | The planned verification was run | Every test in this Part and the five system checks were run on the released commit; the command, the counts of passed, failed and skipped tests and the commit are recorded (Part F.3) |
| 3 | The tests are meaningful and pass | No required test was switched off or weakened; any failed or skipped test is reported; rule tests were seen failing before the code and passing after (Part F.4) |
| 4 | Review and integration are complete | Each build Issue has its own branch and a pull request into `staging` reviewed by the other student; the release pull request from `staging` into `main` is reviewed; `main` is tagged `v1.0`; the board shows the Issues as Done (Part F.5) |
| 5 | Setup and documents match the release | The README setup, `.env.example` (fake values only), the contracts and the traceability match the released code; seed passwords are shared privately, never in Git |
| 6 | Unfinished work is stated | Known limits and any failed or skipped tests are listed (Part F.6) |
| 7 | AI use is declared | `docs/ai-use.md` and each pull request say what the AI did and what a human checked or changed (Part F.6) |

### System checks {#e-sys}

NFR-05 to NFR-09 apply to the whole Sprint 1 build rather than to one feature, so their acceptance criteria are written here.

| AC | NFR | Observable outcome in Sprint 1 |
|---|---|---|
| AC-SYS.1 | NFR-05 | On every Sprint 1 screen (login, the Manager's template table and forms, the Participant's template list, the goals page with its new-goal form and value boxes) nothing scrolls sideways and every control works, at 375 px and at 1280 px wide |
| AC-SYS.2 | NFR-06 | Every Sprint 1 action can be completed with the keyboard alone; the focused control is visibly outlined; no state is shown by colour alone |
| AC-SYS.3 | NFR-07 | The README gives the exact commands to install, migrate, seed, build, start and test, and names every environment variable with a fake example value. The timed clean-clone run (15 minutes or less) is done in Lab 5 |
| AC-SYS.4 | NFR-08 | Each rule BR-01 to BR-07 has at least one unit test, and a coverage report shows at least 80% line coverage of the rule code |
| AC-SYS.5 | NFR-09 | One documented command per suite runs the unit, API and browser tests against a real PostgreSQL test database, and the results are kept. Running them on every pull request in CI starts in Lab 5 |

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-47 | AC-SYS.1 | Browser | Built app on the test database; one Manager and one Participant exist | Open each Sprint 1 screen at 375 px and at 1280 px and use each control | `document.documentElement.scrollWidth` is never greater than `window.innerWidth`; every control can be reached and works |
| TC-48 | AC-SYS.2 | Browser | Same as TC-47 | Complete each Sprint 1 action with Tab, Shift+Tab, Enter and Space only | Every action completes; the focused element shows an outline; no state relies on colour alone |
| TC-50 | AC-SYS.3 | Manual | A clean clone on a machine with the listed tools | Follow only the README; write down each step and the time taken | The app starts and a seeded user can log in; the steps and the time are recorded |
| TC-51 | AC-SYS.4 | Coverage report | The unit tests of the rule code | Run them with coverage switched on and read the report | Every rule BR-01 to BR-07 has a test; line coverage of the rule code is at least 80% |
| TC-52 | AC-SYS.5 | Test run | A migrated PostgreSQL test database | Run the server suite and the client suite with the documented commands | Both finish with exit code 0; the passed, failed and skipped counts are saved with the commit |

Three points about the system checks were proposed by the authors and applied in Sprint 1 without a separate decision: the `AC-SYS.<n>` naming; verifying NFR-07 in Sprint 1 by following the README once, with the 15-minute target binding in Lab 5; and measuring NFR-08 over the rule service files with the Node test runner's coverage option.

Nine smaller proposals inside the contracts (OP-04.9, OP-08.1, OP-08.2, OP-08.4, OP-08.7, OP-09.2, OP-09.3, OP-10.1, OP-10.2) were built and tested as proposed but never marked as decided in the contract files. They were confirmed as applied on 2026-11-13 (phittayanan), and the contracts below describe them as built.

## E.1 F-01 Login, logout and session {#e-f01}

**Links.** FR-01, FR-02, FR-03, FR-04; NFR-01, NFR-04 (Part A). **Depends on** no other feature (Part B.1). **Contract written** 2026-11-07, first version in commit `b99a6ca` (Issue #30, PR #31); **built** in Issue #32, PR #34 (merged 2026-11-08, `6721633`).

### Behaviour and workflow

1. Accounts exist only through the seed. There is no sign-up and no password reset (Part C.6).
2. The user opens `/login`, types a username and a password, and presses "Log in".
3. The server checks the Origin, then the body, then the credentials (order below).
4. On success the server deletes the session named by any cookie sent with the request, stores a new Session row that ends 8 hours after login, and sets the `sid` cookie. It answers with the public user.
5. The browser opens the role's first page: `/templates` for a Manager, `/goals` for a Participant (F-02).
6. Each protected request loads the Session row named by the cookie. A missing, unknown or expired session gets 401. An expired row is deleted at that moment.
7. "Log out" deletes the Session row and clears the cookie. The old cookie value then gets 401, even if it is sent again.
8. Use never extends the 8 hours.

### Rules

| Topic | Rule in this feature |
|---|---|
| Failed login | An unknown username and a wrong password get the same status, code and message. For an unknown username the server still runs one bcrypt comparison (cost 10) against a fixed dummy hash, so both cases do comparable work (ADR 0051). No session is created |
| Login twice | Logging in while a cookie is present replaces that session: the old row is deleted and a new cookie is set |
| Unknown fields | Extra body fields, such as `role`, are dropped; the role always comes from the `User` row |
| Username | Trimmed before lookup (`" participant1 "` logs in as `participant1`). The password is not trimmed |
| Expiry | Valid only while the current instant is before `expires_at`. At `expires_at` exactly, the session is refused |
| Session ID and cookie | 32 random bytes, base64url (43 characters). Cookie `sid`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`; `Secure` only when `NODE_ENV=production` |
| Origin check | Runs first on every `POST`, `PATCH`, `PUT` and `DELETE`. A present `Origin` is parsed as a URL and its host (with port) must equal the `Host` header. The scheme is ignored, so an HTTPS proxy in front of HTTP Express still matches. No `Origin` header passes |
| Passwords | Seed passwords come from `SEED_MANAGER_PASSWORD` and `SEED_PARTICIPANT_PASSWORD` and are stored as bcrypt hashes at cost 10. No log line, screen or response holds a password, hash or session ID |
| Failed-login limit | None in Sprint 1 (a recorded choice, not an omission) |

### Validation, failure and boundary cases

The first matching row wins.

| Case | Result (status and error code) |
|---|---|
| Login or logout with a malformed `Origin` (including `null`) or an `Origin` host or port that differs from `Host` | 403 `ORIGIN_NOT_ALLOWED`, "This request is not allowed from another site."; no cookie, no session change |
| Logout or `me` with no cookie, an unknown ID, a deleted session, an undecodable cookie (`sid=%ZZ`) or an expired session | 401 `UNAUTHENTICATED`, "Please log in." |
| Login body not JSON (wrong content type or broken JSON), `null`, an array, `{}`, `username` or `password` missing, not a string, or empty (username empty after trimming) | 400 `VALIDATION_ERROR`, "Enter your username and password."; no cookie |
| Login with an unknown username, or a known username and a wrong password | 401 `INVALID_CREDENTIALS`, "Username or password is incorrect." (same body for both); no cookie |
| Broken or oversized JSON on any other `/api` route, after the Origin, session and role checks | 400 `VALIDATION_ERROR`, "Invalid JSON body." |
| Session used at login + 7:59:59 | Accepted |
| Session used at login + 8:00:00 | 401 `UNAUTHENTICATED`; row deleted |
| State-changing request with no `Origin` header | Not refused by the Origin check |

### Permissions

Login needs no session; logout and "who am I" need any valid session and act only on the caller's own session and account (Part C.5).

### UI

- **Login screen** (`/login`): "Username" box, masked "Password" box, "Log in" button. No sign-up or reset link.
- **While the request runs**: the button is disabled and a status line reads "Logging in…".
- **Rejected login**: the API message appears in an alert above the boxes; the username stays and the password box is cleared.
- **Server or network error**: "Something went wrong. Please try again." (Part C.3).
- **Success**: the role's first page opens. **Log out** (top bar, F-02) returns to the login screen.
- Tab moves between the boxes and Enter submits.

### API

Status codes and the error body follow Part C.4.

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/auth/login` | JSON `{ "username", "password" }` | 200 `{ "user": { "id", "username", "displayName", "role" } }`; `Set-Cookie: sid=…; Max-Age=28800; Path=/; HttpOnly; SameSite=Lax` | 403 `ORIGIN_NOT_ALLOWED`; 400 `VALIDATION_ERROR`; 401 `INVALID_CREDENTIALS` |
| `POST /api/auth/logout` | No body; `sid` cookie | 204; `Set-Cookie: sid=; Max-Age=0` | 403 `ORIGIN_NOT_ALLOWED`; 401 `UNAUTHENTICATED` |
| `GET /api/auth/me` | `sid` cookie | 200, same `user` shape as login | 401 `UNAUTHENTICATED` |

No body contains `password`, `passwordHash` or the session ID. The session middleware loads only `id`, `username`, `displayName` and `role` of the user.

### Data

Migration `20261107000100_auth` (the first migration) creates the `Role` enum and the `User` and `Session` tables, with the unique `username` index and the cascading `user_id` foreign key (Part C.2). The seed upserts `manager1`, `participant1` and `participant2` by username; it stops with an error and writes nothing when either seed password variable is missing.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-01.1 | A correct login returns 200 with the user's `id`, `username`, `displayName` and `role`, and a `Set-Cookie` carrying the session ID with `HttpOnly`, `SameSite=Lax` and `Path=/`. That cookie then gets 200 from `GET /api/auth/me` |
| AC-01.2 | An unknown username and a wrong password each return `401 INVALID_CREDENTIALS` with the same message, set no cookie and create no session |
| AC-01.3 | A login body that is not JSON, or whose `username` or `password` is missing, empty or not a string, returns `400 VALIDATION_ERROR` and sets no cookie |
| AC-01.4 | Logout returns 204 and clears the cookie; the old cookie then gets `401 UNAUTHENTICATED` from `GET /api/auth/me`. Logout without a session gets `401 UNAUTHENTICATED` |
| AC-01.5 | `GET /api/auth/me` returns the session user's display name and role, for a Manager and for a Participant. No auth response body holds a password, a password hash or the session ID |
| AC-01.6 | A protected request with no cookie, an unknown session ID or the ID of a deleted session gets `401 UNAUTHENTICATED` |
| AC-01.7 | A session works up to login + 7:59:59 and gets `401 UNAUTHENTICATED` from login + 8:00:00; requests in between do not move the expiry |
| AC-01.8 | Every stored password is a bcrypt hash, and no seed password value appears in any tracked file |
| AC-01.9 | A login or logout carrying a foreign `Origin` gets `403 ORIGIN_NOT_ALLOWED`; the login sets no cookie and creates no session, and the logout leaves the session working |
| AC-01.10 | In the browser, a correct login opens the role's first page; a wrong password shows the API message, keeps the username and empties the password box; "Log out" returns to the login screen |

### Test specification

Each test creates its own Manager and Participants with a password generated at run time. API tests age a session by moving its timestamps back in the test database.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-01 | AC-01.1 | API | Participant A exists; no sessions | Log in as A; call `me` with the returned cookie | 200 with A's public user; one Session row for A with `expires_at` − `created_at` = 8 h; `me` returns 200 and the same user |
| TC-02 | AC-01.2 | API | A exists; no user `nobody`; `bcrypt.compare` wrapped by a spy that still calls it | Log in as `nobody`; log in as A with a wrong password | Both 401 `INVALID_CREDENTIALS` with identical bodies; no `Set-Cookie`; no Session row; exactly two real cost-10 comparisons, both false. A second case forces the dummy comparison to return true: still 401, no session |
| TC-03 | AC-01.4 | API | A logged in; cookie kept | Log out; send the old cookie to `me`; log out with no cookie | 204 with `sid=;` and `Max-Age=0`; no Session row; replay 401 `UNAUTHENTICATED`; cookieless logout 401 |
| TC-04 | AC-01.5 | API | Manager and A | Log in as each and call `me`. A test-only route behind the real session middleware records `req.user` | Login and `me` bodies equal the public user (role `MANAGER`, then `PARTICIPANT`) and contain neither hash nor session ID. The middleware passes only `id`, `username`, `displayName`, `role`; missing or unknown sessions never reach the route |
| TC-05 | AC-01.6 | API | A logged in, then all Session rows deleted | Call `me` with no cookie, `sid=abc`, A's deleted ID and `sid=%ZZ` | Each 401 `UNAUTHENTICATED` |
| TC-06 | AC-01.7 | API | A logged in; `expires_at` read | Call `me` once; move `created_at` and `expires_at` back 8 h; call `me` | `expires_at` unchanged after the first call; aged session 401 `UNAUTHENTICATED`; row deleted |
| TC-62 | AC-01.3 | API | A exists | Log in with `{}`, no password, `password` 123, `password` "", `username` "   ", `username` 123, `null`, `[]`, broken JSON, a form-encoded body. Then send broken and oversized JSON to a test-only Manager route as a Manager, anonymously and as A | Every login gets 400 `VALIDATION_ERROR` "Enter your username and password.", no cookie, no session. Manager route: 400 "Invalid JSON body." for the Manager; 401 anonymous; 403 for A; no handler runs |
| TC-63 | AC-01.7 | Unit | Session with `expires_at` 2026-11-10T09:00:00Z; the instant is an argument | Check at 08:59:59Z and at 09:00:00Z | Valid, then expired |
| TC-64 | AC-01.9 | API | A logged in; `Host: app.example`; `X-Forwarded-Proto: https` | Login and logout with `Origin` `https://evil.example`, `not a URL`, `null`, `https://app.example:8443`; then login with no Origin, `https://app.example` and `http://app.example` | Every foreign or malformed request 403 `ORIGIN_NOT_ALLOWED`, no cookie, still one session, and A's `me` still 200. The three matching or absent Origins log in with 200 |
| TC-44 | AC-01.8 | API | Seed run twice with `node` on run-time passwords, from another directory with an empty `PATH` | Read every `password_hash`; rerun the seed with each password variable missing | Three users; each hash matches `$2[aby]$10$` and verifies against its password; a missing variable exits non-zero, creates no user and prints no password |
| TC-45 | AC-01.8 | Script | Same seed passwords | `git grep` each value in tracked files | No match |
| TC-46 | AC-01.1 | API and unit | A exists | Log in and read `Set-Cookie`. Unit: build cookie options for `production` and `test` | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`, no `Secure` in test; `Secure` only for `production` |
| TC-65 | AC-01.10 | Browser | Manager and A in the test database | Log in as A with a wrong password; then correctly; press "Log out"; log in as the Manager | Alert "Username or password is incorrect.", username kept, password empty; A reaches `/goals`; logout reaches `/login`; Manager reaches `/templates` |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `b99a6ca` | First draft (Issue #30) |
| 2026-11-07 | `5e5c174` | Review round 1 on PR #31: host-only Origin check with the forwarded-HTTPS case in TC-64; TC-05 uses auth routes only; OP-01.1 to OP-01.11 decided; OP-01.12 (unknown-username timing) proposed |
| 2026-11-07 | `1c72dbf` | PR #31 merged into `staging`: contract approved |
| 2026-11-07 | `8a374d0` | Implementation evidence section added, linked to the tested revision (PR #34) |
| 2026-11-07 | `71e091e` | OP-01.12 decided: dummy bcrypt comparison for unknown usernames (ADR 0051); TC-02 checks the real comparisons; regression rules added for the seed run, public user fields and JSON parser errors |
| 2026-11-07 | `0a92f7b` | Parser error message outside login set to "Invalid JSON body."; middleware identity check clarified |
| 2026-11-07 | `a895122` | Evidence note updated after the review fixes |
| 2026-11-08 | `6721633` | PR #34 merged: F-01 built (Issue #32) |

## E.2 F-02 Role layout and endpoint protection {#e-f02}

**Links.** FR-22; NFR-02 (Part A); the role checks of BR-09 and BR-10 run through this feature. **Depends on** F-01 (Part B.1). **Contract written** 2026-11-07, first version in commit `b99a6ca` (Issue #30, PR #31); **built** in Issue #32, PR #34 (merged 2026-11-08, `6721633`).

### Behaviour and workflow

1. After login every page shows the same top bar: display name, the role's menu and "Log out".
2. The menu only hides what the role cannot use. The server checks every request on its own.
3. Each protected route runs two shared middleware functions before its own code: "require a session" (else 401), then "require role X" where the route is role-restricted (else 403).
4. The role is read from the `User` row loaded with the session on every request. A role change in the database applies to the next request on the same cookie.
5. Only after both checks pass do validation, existence, ownership and rules run.

### Rules

| Topic | Rule in this feature |
|---|---|
| Check order | Origin (403, F-01), session (401), role (403), then the route's own checks. A refused request never reaches validation, existence or the handler |
| Identity | A `role` in the body, a `role` in the query string and an `X-Role` header are ignored |
| Shared middleware | No route checks the role in its own code; every route uses `requireSession` and `requireRole` |
| Public routes | Exactly `POST /api/auth/login`, `GET /api/health` and `GET /api/ready` (and the HEAD that Express adds for each GET). Every other `/api` route must answer 401 without a session |
| Route audit | TC-08 walks the real Express route tree, including mounted routers and every method, and fails if a route is unprotected or missing from the coverage list. Each feature PR adds its routes |
| Unknown path | An unknown `/api` path gets 404 `NOT_FOUND`, "Not found.", with or without a session |

### Validation, failure and boundary cases

| Case | Result (status and error code) |
|---|---|
| State-changing request with a foreign `Origin` | 403 `ORIGIN_NOT_ALLOWED` (F-01) |
| Protected route, no valid session | 401 `UNAUTHENTICATED`, "Please log in." |
| Valid session, role not allowed | 403 `FORBIDDEN`, "You do not have permission to do this." |
| Anonymous request to a Manager-only route | 401, not 403 |
| Participant on a Manager-only route with an invalid body or an unknown id | 403; no 400 or 404 |
| Participant sends `"role": "MANAGER"`, `?role=MANAGER` or `X-Role: MANAGER` | 403; handler never runs |
| Unknown `/api` path | 404 `NOT_FOUND` |

### Permissions

This feature supplies the session and role checks that enforce the matrix in Part C.5; it adds no row of its own.

### UI

- **Top bar** on every page after login: display name, menu links, "Log out".
- **Menu**: Manager "Templates"; Participant "Goals", "Templates".
- **First page after login**: Manager `/templates`; Participant `/goals` (the calendar is Sprint 2). `/` also opens the first page.
- **No session**: any page shows the login screen. Any 401 from the API during use returns the user to `/login`.
- **Wrong-role page**: a Participant on `/templates/new` or `/templates/:id/edit`, and a Manager on `/goals` or `/goals/new`, see "This page is not available for your role." with the top bar; the address does not change.
- The top bar and menu work with the keyboard alone and fit 375 px and 1280 px (TC-47, TC-48 in E.0).

### API

No new endpoint. The feature adds the middleware `requireSession` and `requireRole(...roles)`, used by every protected route. Example: a Participant's `POST /api/templates` gets 403 with code `FORBIDDEN`.

| Method and path | Request | Success | Errors |
|---|---|---|---|
| Any protected route | `sid` cookie | Passes to the route | 401 `UNAUTHENTICATED`; 403 `FORBIDDEN` |
| Any unknown `/api` path | — | — | 404 `NOT_FOUND` |

### Data

No change. The role is `User.role` from F-01 (Part C.2); it is not cached in the cookie or in server memory.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-02.1 | A Manager and a Participant see the same top bar with the display name and "Log out"; the Manager's menu is exactly "Templates", the Participant's exactly "Goals", "Templates" |
| AC-02.2 | Every protected endpoint returns `401 UNAUTHENTICATED` with no session, and every role-restricted endpoint returns `403 FORBIDDEN` to the wrong role, with nothing stored or returned |
| AC-02.3 | On a Manager-only route, an anonymous request gets `401 UNAUTHENTICATED`, and a Participant gets `403 FORBIDDEN` even with an invalid body or an unknown id, before any validation or existence check |
| AC-02.4 | A Participant who adds `"role": "MANAGER"` to the body or an `X-Role: MANAGER` header on a Manager-only route still gets `403 FORBIDDEN`; the handler never runs and nothing is stored |
| AC-02.5 | In the browser, with no session every page shows the login screen; when the session ends during use, the next API call returns the user to the login screen |

### Test specification

A test-only route `POST /api/test/manager/:id` (real session and Manager middleware, then spies for validation, existence and handler) and a test-only page `/test/protected` exist only in the test app; the production app answers 404 for them.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-07 | AC-02.1 | Browser | Manager and A exist | Log in as the Manager, open `/test/protected`, read the bar, log out; repeat as A | Both bars show the display name and "Log out"; menu links exactly "Templates" for the Manager and "Goals", "Templates" for A |
| TC-08 | AC-02.2 | API | All implemented routes plus the test-only route | Walk the route tree; call each protected route with no cookie, then with the wrong role where one role is allowed. Regression cases add an unprotected nested route, an unregistered method and a non-exact public path | Every route 401 `UNAUTHENTICATED` without a session and 403 `FORBIDDEN` for the wrong role; no handler runs; session count unchanged. Each regression case fails the audit |
| TC-66 | AC-02.3, AC-02.4 | API | Test-only route; id 1 exists, 99999 does not | Anonymous POST to id 1; as A (with `?role=MANAGER`): `{}` on id 1, a valid body on 99999, a valid body plus `"role": "MANAGER"`, a valid body plus `X-Role: MANAGER`. Then set A's role to `MANAGER` in the database and repeat | Anonymous 401; all four calls by A 403 `FORBIDDEN`; no spy runs. After the role change the same cookie gets 204 and the spies run in order |
| TC-67 | AC-02.5 | Browser | A exists | Open `/test/protected`, `/templates/new` and `/goals` with no session; log in as A and open `/test/protected`; delete all Session rows; reload | Each visit without a session ends on `/login`; after the reload `GET /api/auth/me` answers 401 and the login screen shows |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `b99a6ca` | First draft (Issue #30) |
| 2026-11-07 | `5e5c174` | Review round 1 on PR #31: test-only route and page for TC-66 and TC-67; TC-08 grows with each implemented endpoint; OP-02.1 to OP-02.5 decided |
| 2026-11-07 | `1c72dbf` | PR #31 merged into `staging`: contract approved |
| 2026-11-07 | `8a374d0` | Implementation evidence section added (PR #34) |
| 2026-11-07 | `71e091e` | TC-08 must discover routes from the real Express tree, independent of the coverage list |
| 2026-11-07 | `a895122` | Status set to merged contract with review corrections |
| 2026-11-08 | `6721633` | PR #34 merged: F-02 built (Issue #32) |

## E.3 F-03 Template creation and Manager list {#e-f03}

**Links.** FR-05, FR-06; BR-03 (template range part) (Part A). **Depends on** F-01, F-02 (Part B.1). **Contract written** 2026-11-07, first version in commit `06e536b` (Issue #30, PR #31); **built** in Issue #36, PR #37 (merged 2026-11-08, `5a70424`).

### Behaviour and workflow

1. A Manager logs in and lands on the template table at `/templates`.
2. "New" opens `/templates/new`: Name, Unit, Minimum, Maximum.
3. On Save the browser sends `POST /api/templates`. The server checks the session, the role, the fields, then BR-03, then the unique name.
4. If all pass, one Template row is stored with state `ACTIVE` and `created_by` set to the session user. The browser returns to the table, which shows the new row.
5. Any Manager sees every template, including those made by another Manager (Part C.2, Ownership).
6. Each row has "Edit" (F-04). There is no Retire control in Sprint 1.

### Rules

| Topic | Rule in this feature |
|---|---|
| Range (BR-03) | `minValue` must be below `maxValue`; equal is refused. Negative values are allowed |
| Name | Trimmed, 1–100 characters; unique by exact match after trimming ("Sleep" and "sleep" are different) |
| Unit | Trimmed free text, 1–30 characters; spelling not checked |
| Numbers | JSON numbers, at most 2 decimal places, absolute value at most 99,999,999.99. Extra places are refused, never rounded |
| Order of checks | Session, role, fields (in the order name, unit, minimum, maximum; the first failing field's message is returned), BR-03, unique name. So a duplicate name with min 5, max 5 gets `MIN_NOT_BELOW_MAX` |
| Server-set fields | `state` is always `ACTIVE`; `created_by` is the session user. `state`, `createdBy` and `id` in the body are dropped |
| Concurrency | The database unique index decides: two creates with the same new name store one row and the other gets 409 |
| List | `GET /api/templates` is ordered by name A to Z. A Manager gets every state; a Participant gets `ACTIVE` only (F-06) |

### Validation, failure and boundary cases

| Case | Result (status and error code) |
|---|---|
| No valid session (create or list) | 401 `UNAUTHENTICATED` |
| Participant creates | 403 `FORBIDDEN` (tested in F-06, TC-17) |
| Broken JSON body | 400 `VALIDATION_ERROR`, "Invalid JSON body." |
| `name` missing, not a string, blank or over 100 characters | 400 `VALIDATION_ERROR`, "Name must be 1 to 100 characters." |
| `unit` missing, not a string, blank or over 30 characters | 400 `VALIDATION_ERROR`, "Unit must be 1 to 30 characters." |
| `minValue` missing, not a number, more than 2 decimals or beyond ±99,999,999.99 | 400 `VALIDATION_ERROR`, "Minimum must be a number with at most 2 decimal places." |
| `maxValue`, same cases | 400 `VALIDATION_ERROR`, "Maximum must be a number with at most 2 decimal places." |
| `minValue` ≥ `maxValue` | 400 `MIN_NOT_BELOW_MAX`, "Minimum must be below maximum." |
| Name already used | 409 `TEMPLATE_NAME_EXISTS`, "A template with this name already exists." |
| Min 0, max 0.01 | 201 (boundary accepted) |
| Min −1, max 8 | 201 |

Nothing is stored for any refused request.

### Permissions

Create is Manager-only; list is open to both roles, with a Participant seeing active templates only (Part C.5).

### UI

- **Template table** (`/templates`, Manager): heading "Templates", a "New" link-button above the table, and columns Name, Unit, Range (`min–max`), State ("Active" or "Retired", as words), Edit (an "Edit" button per row). No Retire control.
- **Loading**: "Loading…". **Empty**: "No templates yet", with "New" still shown.
- **New template form** (`/templates/new`): heading "New template"; Name, Unit, Minimum and Maximum (number boxes); "Save" and "Cancel". Focus starts in Name. The browser does not pre-check the range; the API decides.
- **While saving**: Save is disabled and "Saving…" shows.
- **Refused**: the API message appears in an alert at the top of the form; every typed value stays.
- **Success**: back to `/templates` with the new row.

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/templates` | JSON `{ "name", "unit", "minValue", "maxValue" }` | 201 `{ "template": { "id", "name", "unit", "minValue", "maxValue", "state": "ACTIVE" } }`, numbers as JSON numbers | 403 `ORIGIN_NOT_ALLOWED`; 401 `UNAUTHENTICATED`; 403 `FORBIDDEN`; 400 `VALIDATION_ERROR`; 400 `MIN_NOT_BELOW_MAX`; 409 `TEMPLATE_NAME_EXISTS` |
| `GET /api/templates` | `sid` cookie | 200 `{ "templates": [ … ] }` in the same shape, by name A to Z | 401 `UNAUTHENTICATED` |

### Data

Migration `20261108000100_template` creates the `TemplateState` enum and the `Template` table, the unique index `Template_name_key`, the `created_by` foreign key (delete restricted) and the check constraint `Template_min_below_max` (`min_value < max_value`). It changes no earlier table. Decimals are stored as `DECIMAL(10,2)` and returned as JSON numbers. With `SEED_DEMO_DATA=true` the seed upserts three demo templates by name. Full model: Part C.2.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-03.1 | A Manager's valid request gets 201 and a template in state `ACTIVE`; it then appears in the Manager's `GET /api/templates`, also after the app restarts. Unknown fields such as `"state": "RETIRED"` are dropped and the request succeeds |
| AC-03.2 | A minimum equal to or above the maximum gets `400 MIN_NOT_BELOW_MAX` and nothing is stored; a minimum just below the maximum is accepted |
| AC-03.3 | A missing, empty or non-string `name` or `unit`, a name or unit over its length limit, or a missing or non-numeric `minValue` or `maxValue`, or one with more than 2 decimal places, gets `400 VALIDATION_ERROR` and nothing is stored |
| AC-03.4 | A name already in use gets `409 TEMPLATE_NAME_EXISTS` and nothing is stored; if the same request also has a minimum not below the maximum, the answer is `400 MIN_NOT_BELOW_MAX` |
| AC-03.5 | An anonymous `POST /api/templates` or `GET /api/templates` gets `401 UNAUTHENTICATED` and nothing is stored |
| AC-03.6 | The Manager's template page lists every template, active and retired, with name, unit, range and the state in words, a "New" button and an "Edit" button per row, and no Retire control; with no templates it shows "No templates yet" and "New" |
| AC-03.7 | The New template form creates the template through the API; a refused request shows the API message and keeps the typed values |

### Test specification

Each test starts with an empty database and its own Manager and Participant A.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-09 | AC-03.1 | API | Manager logged in; no templates | POST "Reading", "pages", 0, 500 with extra `state: "RETIRED"` and `createdBy: 999`; build a new app instance on the same database and list; POST "  Water  ", " glasses ", −1, 8 | 201 with `state` `ACTIVE` and numeric 0 and 500; `created_by` is the Manager; listed by the new instance; the second create stores "Water", "glasses", −1 |
| TC-10 | AC-03.2 | Unit and API | Manager logged in; no templates | Unit: range rule on (5, 5), (6, 5), (0, 0.01), (−2, −1). API: POST "Water" with 5/5, 6/5, then 0/0.01 | Unit: refused, refused, accepted, accepted. API: two 400 `MIN_NOT_BELOW_MAX` with no row, then 201 |
| TC-68 | AC-03.3, AC-03.5 | API | Manager logged in | POST each bad body: no `name`; `name` "   "; `name` 7; 101-character name; no `unit`; `unit` "   "; 31-character unit; `minValue` "abc"; no `maxValue`; `maxValue` 10.555; `minValue` 100000000; `maxValue` −100000000. Then a valid POST and a GET with no session | Each bad body 400 `VALIDATION_ERROR` (10.555 gives the "Maximum must be…" message); both anonymous calls 401 `UNAUTHENTICATED`; template count stays 0 |
| TC-69 | AC-03.4 | API | "Walk" (0, 100) created | POST "Walk" 0/50; POST "Walk" 5/5; two POSTs of "Swim" at once | 409 `TEMPLATE_NAME_EXISTS`; 400 `MIN_NOT_BELOW_MAX`; "Swim" gives one 201 and one 409; rows are "Swim" and "Walk" only |
| TC-11 | AC-03.6 | Browser | Manager; no templates, then "Sleep" (active) and "Steps" (set `RETIRED` in the database) | Open the template page; add the rows; reload | First: "No templates yet", "New", no Retire. Then headers Name, Unit, Range, State, Edit; rows with name, unit, range, "Active" and "Retired"; two "Edit" buttons; "New" visible; no Retire |
| TC-70 | AC-03.7 | Browser | Manager logged in; no templates | Open "New"; enter "Stretching", "minutes", 10, 5; Save (response held); then set the minimum to 0 and Save | During the request Save is disabled and "Saving…" shows; then alert "Minimum must be below maximum." with all four values kept. Second Save: back on `/templates`, row "Stretching" with range 0–5 |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `06e536b` | First draft (Issue #30) |
| 2026-11-07 | `5e5c174` | Review round 1 on PR #31: OP-03.1 to OP-03.9 decided (exact-match unique name, length limits, refuse extra decimals, `DECIMAL(10,2)`, negatives allowed, messages, name order, error codes) |
| 2026-11-07 | `1c72dbf` | PR #31 merged into `staging`: contract approved |
| 2026-11-08 | `92066a0` | Implementation evidence for Issue #36 recorded; no decided point reopened |
| 2026-11-08 | `5a70424` | PR #37 merged: F-03 built (Issue #36) |

## E.4 F-04 Template edit {#e-f04}

**Links.** FR-07, FR-23; BR-08 (edit part), BR-03, BR-09; NFR-02, NFR-05, NFR-06 (Part A). **Depends on** F-03, F-07 (Part B.1). **Contract written** 2026-11-07, commit `06e536b` (Issue #30, PR #31); **built** in Issue #53, PR #54.

### Behaviour and workflow

1. A Manager presses Edit on a row of the template table. The edit page opens with the stored name, unit, minimum and maximum already filled in.
2. The Manager changes one or more fields and presses Save. The browser sends only the fields that differ from the stored values.
3. If no goal uses the template and the new values pass every check, the server saves them. The browser returns to the table, which shows the new values.
4. If any goal uses the template, the server refuses the edit and changes nothing. Such a template can later only be retired (Sprint 2).
5. Any Manager may edit any template, including one that another Manager created (Part C.2, Ownership).

### Rules

| Rule | What it means for this feature |
|---|---|
| BR-08 | A template is "used" when at least one goal row points to it. The owner of the goal does not matter, and an Ended goal still counts. |
| BR-03 | The stored values and the sent values are merged first. The merged minimum must be below the merged maximum. |
| Unique name | The new name must not belong to another template. Sending the template's own name is fine. |
| Fixed fields | `id`, `state` and `createdBy` cannot be changed. If they are sent, they are dropped like any unknown field. |
| Template lock | The edit locks the template row (`SELECT … FOR UPDATE`) inside one transaction, then counts goals, checks the range and writes. Goal creation takes the same lock (E.6), so a new goal cannot slip in between the check and the write. |

Because a used template can never be edited, an edit can never leave a goal's target above a new maximum or an entry outside a new range.

### Validation, failure and boundary cases

Checks run in the order of Part C.1. Inside the service the order is: the template exists, then BR-08, then BR-03, then the unique name. The first failed check decides the answer.

| Case | Result (status and error code) |
|---|---|
| No valid session | 401 `UNAUTHENTICATED` |
| Caller is a Participant (any id, any body) | 403 `FORBIDDEN` |
| `:id` is not a positive whole number (`abc`, `0`, `-1`, `1.5`, `1e3`) | 400 `VALIDATION_ERROR` |
| Body has none of `name`, `unit`, `minValue`, `maxValue` (including `{}` or only `state`) | 400 `VALIDATION_ERROR`, "Change at least one of name, unit, minimum or maximum." |
| A sent field is the wrong type, empty after trimming, too long (name over 100, unit over 30), has more than 2 decimal places, or is above 99,999,999.99 | 400 `VALIDATION_ERROR`, message names the field |
| Body is not valid JSON | 400 `VALIDATION_ERROR` |
| Unknown id with an invalid body | 400 `VALIDATION_ERROR` (validation comes before existence) |
| No template with this id (also an id above 2,147,483,647) | 404 `TEMPLATE_NOT_FOUND` |
| A goal uses the template, Active or Ended | 409 `TEMPLATE_IN_USE` |
| Used template and a broken range in the same request | 409 `TEMPLATE_IN_USE` |
| Merged minimum not below merged maximum | 400 `MIN_NOT_BELOW_MAX` |
| New name belongs to another template | 409 `TEMPLATE_NAME_EXISTS` |
| Duplicate name and broken range in the same request | 400 `MIN_NOT_BELOW_MAX` |
| Own current name sent again | 200 |
| Name with spaces around it | 200; the name is stored trimmed |
| An edit and a new goal on the same template at the same moment | One waits for the other. Either the goal is saved and the edit gets 409 `TEMPLATE_IN_USE`, or the edit is saved and the goal is checked against the new range. |

A refused edit changes nothing.

### Permissions

Part C.5 gives the full matrix. This feature adds: a Participant gets 403 even for an unknown id or an invalid body, because the role check runs before validation. A Participant who opens `/templates/:id/edit` directly sees "This page is not available for your role." and no form.

### UI

- Edit is a button on every row of the Manager's table, used or not. The API's answer explains a refusal.
- The edit page is `/templates/:id/edit`, headed "Edit template". It is the F-03 form, filled with the stored values, with Save and Cancel.
- Save sends only the changed fields. While the request runs, Save is disabled and "Saving…" is shown.
- On success the browser goes back to `/templates`. On a refusal the API message appears in an alert, and the typed values stay.
- A direct visit to the page for an id that does not exist shows "Template not found." with a Cancel link back to the list.
- The page is covered by the system checks TC-47 and TC-48 (E.0).

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `PATCH /api/templates/:id` (Manager) | Any non-empty subset of `name`, `unit`, `minValue`, `maxValue`, for example `{ "unit": "pages read", "maxValue": 300 }` | 200 `{ "template": { "id", "name", "unit", "minValue", "maxValue", "state" } }` with the stored values after the edit | 400 `VALIDATION_ERROR`, `MIN_NOT_BELOW_MAX`; 401; 403; 404 `TEMPLATE_NOT_FOUND`; 409 `TEMPLATE_IN_USE`, `TEMPLATE_NAME_EXISTS` |

The error body and status meanings are in Part C.4.

### Data

No new table or migration. The edit uses `Template` (F-03) and reads `Goal` (F-07); see Part C.2. The database checks `min_value < max_value` and the unique `name` stay as the last guard.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-04.1 | A Manager edits an unused template, changing any subset of name, unit, minimum and maximum. The answer is 200 with the new values, and `GET /api/templates` then lists them. |
| AC-04.2 | An edit of a template that any goal uses, Active or Ended, gets 409 `TEMPLATE_IN_USE`. The template does not change. |
| AC-04.3 | A merged minimum that is not below the maximum gets 400 `MIN_NOT_BELOW_MAX`. A name that belongs to another template gets 409 `TEMPLATE_NAME_EXISTS`. The template's own name is accepted. A refused edit changes nothing. |
| AC-04.4 | An empty body, a field of the wrong type or with more than 2 decimal places, and an id that is not a whole number get 400 `VALIDATION_ERROR`. An unknown id gets 404 `TEMPLATE_NOT_FOUND`. A caller with no session gets 401 `UNAUTHENTICATED`. Nothing changes. |
| AC-04.5 | An edit of a used template that also breaks the range rule gets 409 `TEMPLATE_IN_USE`. |
| AC-04.6 | In the browser, Edit opens the filled form; a valid change appears in the table; a refused change shows the API message and keeps what was typed. |
| AC-04.7 | A Participant's `PATCH /api/templates/:id` gets 403 `FORBIDDEN`, for an existing and for an unknown id. The template does not change. |

### Test specification

Each test builds its own data: one Manager and Participant A. Goals are made through `POST /api/goals` as A, with dates relative to D, today in Asia/Bangkok.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-12 | AC-04.1 | API | Unused template "Reading" (pages, 0 to 500) | `PATCH` `{ "unit": "pages read", "maxValue": 300 }` (with `state`, `createdBy` and `id` also sent); then `PATCH` `{ "name": "Reading time", "minValue": 1 }`; then `GET /api/templates` | Both edits 200. The list shows "Reading time", "pages read", 1 to 300, state ACTIVE. `createdBy` is still the Manager. |
| TC-13 | AC-04.2, AC-04.5 | API and database | "Sleep" (0 to 24) with A's Active goal (D to D+30); "Steps" with only A's Ended goal (D−10 to D−1); for the race, unused "Water" (0 to 24) | `PATCH` Sleep `{ "maxValue": 12 }`; `PATCH` Sleep `{ "minValue": 50 }`; `PATCH` Steps `{ "unit": "km" }`. Race (a): the test holds a lock on Water and inserts a goal, then sends `PATCH` Water `{ "maxValue": 10 }` and commits. Race (b): send that `PATCH` and A's goal (target 20) together, ten times. | All three edits get 409 `TEMPLATE_IN_USE`; Sleep and Steps are unchanged. (a) The edit waits on the lock, then gets 409; Water keeps max 24. (b) Either the goal is 201 and the edit 409 with max 24, or the edit is 200 and the goal 400 `TARGET_ABOVE_TEMPLATE_MAX` with no goal stored. Never both a goal and an edited range. |
| TC-71 | AC-04.4 | API | Unused template T; no template 99999 | `PATCH` T with `{}`, `{ "state": "RETIRED" }`, `{ "minValue": "abc" }`, `{ "maxValue": 10.555 }`, a blank or null name, a 31-character unit, `maxValue` 100000000, broken JSON; `PATCH` ids `abc`, `0`, `-1`, `1.5`, `1e3`; `PATCH` ids 99999 and 2147483648; `PATCH` 99999 with an invalid body; `PATCH` T with no session | Every bad body and bad id gets 400 `VALIDATION_ERROR`. 99999 and 2147483648 get 404 `TEMPLATE_NOT_FOUND`. 99999 with an invalid body gets 400. No session gets 401 `UNAUTHENTICATED`. T is unchanged. |
| TC-72 | AC-04.3 | Unit and API | Unused "Walk" (0 to 100) and "Swim" (0 to 50) | Unit: merge stored (0, 100) with sent `minValue` 100, and other mixes. API: `PATCH` Walk `{ "minValue": 100 }`; `{ "name": "Swim" }`; `{ "name": "Swim", "minValue": 100 }`; `{ "name": "Walk", "unit": "steps" }`; `{ "name": "  Walking  " }` | Unit: (0, 100) with minimum 100 is refused. API: 400 `MIN_NOT_BELOW_MAX`; 409 `TEMPLATE_NAME_EXISTS`; 400 `MIN_NOT_BELOW_MAX`; 200 with unit "steps"; 200 with name "Walking". Walk keeps 0 to 100 after the refused edits. |
| TC-73 | AC-04.6 | Browser | Manager; unused "Reading" (0 to 500); "Sleep" (0 to 24) with A's Active goal made through the API | Edit Reading: set maximum 300, Save. Edit Sleep: set maximum 12, Save. | The edit page is filled with the stored values. Only `{ "maxValue": 300 }` is sent, and Reading shows 0–300 in the table. For Sleep, Save is disabled while waiting, then the alert says "This template is used by a goal and cannot be edited." and 12 stays typed; the stored max is still 24. |
| TC-18 | AC-04.7 | API | A logged in; "Sleep" (0 to 24); no template 99999 | As A: `PATCH` Sleep `{ "maxValue": 12 }`; `PATCH` 99999 `{ "unit": "x" }`; `PATCH` `abc` `{}` | All get 403 `FORBIDDEN`. Sleep still has max 24. |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `06e536b` | First version (Issue #30, PR #31) |
| 2026-11-07 | `5e5c174` | Review round 1 in PR #31: the Participant edit refusal moves here as AC-04.7 and TC-18; the circular dependency is removed; partner agreement on the open points is recorded |
| 2026-11-10 | `14475ba` | Before the build (Issue #53, PR #54): the edit locks the template row; TC-13 gains the edit-versus-goal race; the edit-page details are listed as a proposal (OP-04.9) |

## E.5 F-06 Participant template view and write refusal {#e-f06}

**Links.** FR-09, FR-23; BR-09; NFR-02, NFR-05, NFR-06 (Part A). **Depends on** F-01, F-02, F-03 (Part B.1). **Contract written** 2026-11-07, commit `06e536b` (Issue #30, PR #31); **built** in Issue #36, PR #37.

### Behaviour and workflow

1. A logged-in Participant opens Templates. The page lists every active template with its name, unit and range. Nothing on it can be changed.
2. The page has no New, Edit or Retire control.
3. If a Participant sends a create or edit request to the API anyway, the server answers 403 and stores nothing. The edit refusal is part of F-04 (AC-04.7, TC-18). The retire refusal (TC-19) comes with retire in Sprint 2.
4. The new-goal form (E.6) fills its template list from the same request, so it offers active templates only.

### Rules

| Rule | What it means for this feature |
|---|---|
| FR-09 | A Participant sees every template whose state is `ACTIVE`, and no `RETIRED` template. |
| BR-09, FR-23 | Every Participant write to a template is refused with 403 and changes nothing. |
| Check order | The role check runs before validation and before the existence check, so a Participant always gets 403, whatever the body. |
| List order | Name, A to Z (the same order as the Manager's list in F-03). |

### Validation, failure and boundary cases

| Case | Result (status and error code) |
|---|---|
| No valid session on any template endpoint | 401 `UNAUTHENTICATED` |
| Participant `GET /api/templates` | 200, active templates only |
| Participant `GET /api/templates` when no template is active | 200 with an empty list |
| Participant `POST /api/templates` with a valid, an invalid or an empty body | 403 `FORBIDDEN`; nothing stored |
| Participant `PATCH /api/templates/:id` | 403 `FORBIDDEN` (F-04, TC-18) |

### Permissions

The template rows of Part C.5 apply. This feature adds no new endpoint; it fixes what a Participant may see (active only) and confirms the 403 on create.

### UI

- `/templates` for a Participant is a read-only table with the columns Name, Unit and Range (`min–max`). There is no State column, because every row is active.
- No New, Edit or Retire button or link is shown.
- With no active templates the page shows "No templates yet" and still no New button.
- The page is covered by the system checks TC-47 and TC-48 (E.0).

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/templates` (Participant) | none | 200 `{ "templates": [ { "id", "name", "unit", "minValue", "maxValue", "state": "ACTIVE" } ] }`, the same shape as the Manager's list | 401 |
| `POST /api/templates` (Participant) | any body | none | 401; 403 `FORBIDDEN` |

### Data

No new table or migration. For a Participant the template service filters on `state = ACTIVE`; for a Manager it does not filter (Part C.2).

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-06.1 | A Participant's `GET /api/templates` returns every active template with its name, unit, `minValue` and `maxValue`, and no retired template. |
| AC-06.2 | The Participant's templates page lists the active templates read-only, with no New, Edit or Retire control. With no active templates it shows "No templates yet" and no New button. |
| AC-06.3 | A Participant's `POST /api/templates` gets 403 `FORBIDDEN` with a valid, an invalid or an empty body, and no template is stored. |

### Test specification

Each test builds its own data. A retired template is made by writing `state = RETIRED` straight into the test database, because retire does not exist until Sprint 2.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-16 | AC-06.1, AC-06.2 | API and browser | Active "Sleep" (hours, 0 to 24) and "Reading" (pages, 0 to 500); "Steps" set to `RETIRED` | As participant A: `GET /api/templates`; open Templates. Then delete every template and reload the page. | The API returns Reading then Sleep, with units and ranges, and not Steps. The page has columns Name, Unit, Range, the same two rows, and no New, Edit or Retire control. With no templates: "No templates yet" and no New button. |
| TC-17 | AC-06.3 | API | A logged in; template count known | As A: `POST /api/templates` with `{ "name": "Yoga", "unit": "minutes", "minValue": 0, "maxValue": 120 }`, with `{ "name": "" }`, and with `{}` | Each gets 403 `FORBIDDEN`. The template count is unchanged and there is no "Yoga" row. |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `06e536b` | First version (Issue #30, PR #31) |
| 2026-11-07 | `5e5c174` | Review round 1 in PR #31: the Participant edit refusal (then AC-06.4 with TC-18) moves to F-04 as AC-04.7; partner agreement on the open points is recorded |
| 2026-11-08 | `92066a0` | Build evidence for Issue #36 recorded (PR #37); no decided point reopened |

## E.6 F-07 Goal creation {#e-f07}

**Links.** FR-10; BR-05, BR-06, BR-02; NFR-02, NFR-03, NFR-05, NFR-06, NFR-08 (Part A). **Depends on** F-03, F-06 (Part B.1). **Contract written** 2026-11-07, commit `db9efae` (Issue #28, PR #29), revised in Issue #38 (PR #39); **built** in Issue #40, PR #41.

### Behaviour and workflow

1. A logged-in Participant opens Goals and presses "+ New goal".
2. The form asks for a template, a daily target, a start date and an end date.
3. On Save the server checks the request. If it passes, the server stores one goal for the logged-in Participant. The browser returns to the goals page, which shows the new goal.
4. A goal has no stored state. Active or Ended is worked out from its end date each time it is read (BR-06).

### Rules

| Rule | What it means for this feature |
|---|---|
| BR-05 | The Participant may not already have a goal on this template whose end date is today or later. A goal that starts in the future therefore blocks a second one. |
| BR-06, BR-02 | State is `ACTIVE` while today (Asia/Bangkok) is on or before the end date, including days before the start date. It is `ENDED` from the day after the end date. |
| Daily target | Above 0; at most 2 decimal places; at most 99,999,999.99; not above the template's maximum. A target equal to the maximum is allowed. A value with more than 2 decimal places is refused, never rounded. |
| Dates | Real calendar dates in `YYYY-MM-DD` form. The end date may equal the start date (a one-day goal). An end date in the past is allowed; the goal is Ended at once. |
| Owner | The owner is always the session user. A user or participant ID in the body is dropped. |
| Template lock | Goal creation locks the template row (`SELECT … FOR UPDATE`) in one transaction. Only then does it read the maximum, check BR-05 and insert the goal. This works with F-04's lock (E.4) and also stops two identical requests from both succeeding. |

### Validation, failure and boundary cases

Checks run in the order of Part C.1. All input checks come before the rule checks, so a request that breaks both gets the input error.

| Case | Result (status and error code) |
|---|---|
| No valid session | 401 `UNAUTHENTICATED` |
| Caller is a Manager | 403 `FORBIDDEN` |
| `templateId` missing, not a whole number, or above 2,147,483,647 | 400 `VALIDATION_ERROR` |
| `dailyTarget` missing, not a number, 0 or less, more than 2 decimal places, or above 99,999,999.99 | 400 `VALIDATION_ERROR` |
| `startDate` or `endDate` missing, not `YYYY-MM-DD`, or not a real date (for example 2026-02-30) | 400 `VALIDATION_ERROR` |
| `endDate` before `startDate` | 400 `VALIDATION_ERROR` |
| Body is not valid JSON | 400 `VALIDATION_ERROR` |
| No template with this `templateId` | 400 `VALIDATION_ERROR` |
| `dailyTarget` above the template's maximum | 400 `TARGET_ABOVE_TEMPLATE_MAX` |
| A target above the maximum that also has 3 decimal places, or also lacks `startDate` | 400 `VALIDATION_ERROR` |
| The caller already has a goal on this template whose end date is today or later | 409 `ACTIVE_GOAL_EXISTS` |
| Target equal to the maximum; target 0.01; start equal to end; end date in the past with no active goal on the template | 201 |
| Two identical requests at the same moment | One 201, one 409 `ACTIVE_GOAL_EXISTS`; one goal stored |
| Another transaction holds the template lock | The request waits, then checks against the values committed by that transaction |

Nothing is stored when a request is refused.

### Permissions

Part C.5 gives the rows for `GET /api/goals` and `POST /api/goals`. This feature adds: the request carries no owner, so a Participant cannot create a goal for someone else (also checked across features by F-10). A Manager who opens `/goals/new` sees "This page is not available for your role." and no form.

### UI

- `/goals` lists the caller's goals (template name, daily target with unit, dates, Active or Ended) and has a "+ New goal" button. With no goals it shows "No goals yet", and the button stays visible.
- `/goals/new` has a Template list (first option "Choose a template", then the active templates), Daily target, Start date, End date, Save and Cancel. The chosen template's unit appears next to the target.
- The start date defaults to today in Asia/Bangkok, even when the browser is in another time zone.
- While the request runs, Save is disabled and "Saving…" is shown. A refusal shows the API message in an alert and keeps every typed value. If the session has ended, the browser goes to the login page.
- The goals screens are covered by the system checks TC-47 and TC-48 (E.0).

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/goals` (Participant) | `{ "templateId", "dailyTarget", "startDate", "endDate" }`, for example `{ "templateId": 3, "dailyTarget": 30, "startDate": "2026-11-10", "endDate": "2026-12-10" }` | 201 `{ "goal": { "id", "templateId", "dailyTarget", "startDate", "endDate", "state", "template": { "id", "name", "unit", "minValue", "maxValue" } } }` | 400 `VALIDATION_ERROR`, `TARGET_ABOVE_TEMPLATE_MAX`; 401; 403; 409 `ACTIVE_GOAL_EXISTS` |
| `GET /api/goals` (Participant) | none | 200 `{ "goals": [ … ] }`: the caller's own goals in the shape above, newest first. F-09 adds a `progress` object to each goal. | 401; 403 |

The error body and status meanings are in Part C.4.

### Data

One additive migration creates the `Goal` table described in Part C.2, with its checks `daily_target > 0` and `end_date >= start_date`. There is no state column. The rule "not above the template's maximum" spans two tables, so the service enforces it. Decimal values are stored with 2 decimal places and returned as JSON numbers.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-07.1 | A Participant who sends a valid request gets 201 and a goal with `state` `ACTIVE`. The goal then appears in `GET /api/goals`, also after the app is restarted. |
| AC-07.2 | The stored goal belongs to the session user. A user or participant ID in the body is dropped, and the request is still accepted. |
| AC-07.3 | A second request on the same template while the first goal is not Ended gets 409 `ACTIVE_GOAL_EXISTS`, and no second goal is stored. |
| AC-07.4 | A new goal is accepted when the earlier goal on the same template has Ended, when the template is different, and when another Participant has an active goal on the same template. |
| AC-07.5 | The state is `ACTIVE` before the start day, on the start day and on the end day. It is `ENDED` on the day after the end day. |
| AC-07.6 | A missing, non-integer or unknown `templateId`; a missing or non-numeric `dailyTarget`; a target of 0 or less, with more than 2 decimal places, or above 99,999,999.99; a missing or badly formed date; or an end date before the start date gets 400 `VALIDATION_ERROR`, and nothing is stored. |
| AC-07.7 | A target above the template's maximum gets 400 `TARGET_ABOVE_TEMPLATE_MAX`. A target equal to the maximum is accepted. |
| AC-07.8 | A Manager gets 403 `FORBIDDEN` and a caller with no session gets 401 `UNAUTHENTICATED`. Nothing is stored. |
| AC-07.9 | The "+ New goal" form creates the goal through the API. When a rule refuses it, the form shows the API message and keeps what was typed. |
| AC-07.10 | Goal creation locks the template row. While another transaction holds that lock, `POST /api/goals` waits. It finishes only after the lock is released, and it then uses the template's values as they are at that moment. |

### Test specification

D is today in Asia/Bangkok. Tests through the server use dates relative to D. Unit tests pass "today" as an argument. Each test builds its own data: Participants A and B, one Manager and template "Sleep" (hours, 0 to 24).

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-20 | AC-07.1, AC-07.2 | API | A logged in; Sleep; the body also carries B's ID as `participantId` and `userId` | `POST /api/goals` (target 20, D to D+30); start the app as a separate process, stop it, start it again; `GET /api/goals` | 201 with the full goal shape and `state` ACTIVE; the stored owner is A. After the restart A's list shows the goal (with F-09's `progress`), newest first. |
| TC-21 | AC-07.3 | API | A logged in; Sleep | Send the same future-start goal (D+10 to D+20) twice at once; then send a goal starting today | One 201 and one 409 `ACTIVE_GOAL_EXISTS`; one goal stored. The third request also gets 409 `ACTIVE_GOAL_EXISTS`. |
| TC-22 | AC-07.5 | Unit | Goal end date 2026-11-12 (start 2026-11-10); "today" passed in | Work out the state for 11-09, 11-10, 11-12 and 11-13; also check the Bangkok date at 16:59:59 and 17:00:00 UTC | ACTIVE, ACTIVE, ACTIVE, ENDED. The Bangkok day changes at 17:00 UTC. |
| TC-53 | AC-07.6, AC-07.8 | API | A logged in; Sleep | Send each bad body: no `templateId`; `templateId` "abc", 1.5, 2147483648, 999999; no `dailyTarget`; `dailyTarget` "abc", 0, −1, 10.555, 100000000, 1e-7; a missing start or end date; `11/10/2026`; 2026-02-30; 2026-13-01; end before start; broken JSON. Then call both goal endpoints as the Manager and with no session. | Every bad body gets 400 `VALIDATION_ERROR`. The Manager gets 403 `FORBIDDEN` and no session gets 401 `UNAUTHENTICATED` on both endpoints. No goal is stored. |
| TC-54 | AC-07.6, AC-07.7 | API and unit | Sleep (max 24) | Target 24; then 24.5; 30.555; 25 with no `startDate`; 25 on an unknown template. Then raise the maximum to 99,999,999.99 and send that target as B. | 24 gets 201. 24.5 gets 400 `TARGET_ABOVE_TEMPLATE_MAX`. The other three get 400 `VALIDATION_ERROR` and store nothing. 99,999,999.99 gets 201. |
| TC-55 | AC-07.2, AC-07.4 | API | A has an Ended goal on Sleep (D−10 to D−1); B has an active goal on Sleep | A creates a goal on Sleep with B's ID in the body; A creates a one-day goal (target 0.01) on a second template with B's ID in the body | Both of A's requests get 201; the one-day goal is ACTIVE. A owns three goals; none belongs to B. |
| TC-60 | AC-07.9 | Browser | participant1 logged in; Sleep exists | Open the form; check the template list and the default start date; save a valid goal; then save a second goal on Sleep (target 21) | The first goal appears on the goals page. For the second, Save is disabled while waiting, then the alert says "You already have an active goal for this template." and every typed value stays. One goal is stored. |
| TC-74 | AC-07.10 | API and database | A logged in; Sleep (0 to 24) | The test locks the Sleep row in an open transaction. Send `POST /api/goals` (target 20, D to D+30). After 500 ms check whether it has finished. Set the maximum to 10 in the open transaction and commit. | The request has not finished while the lock is held. After the commit it gets 400 `TARGET_ABOVE_TEMPLATE_MAX`. No goal is stored. |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `db9efae` | First version (Issue #28, PR #29) |
| 2026-11-07 | `b5304f0` | Review round 1 in PR #29: error codes in TC-53, an active goal for B in TC-55, test dates relative to the Bangkok today, unknown fields dropped, 2 decimal places, list order, decisions on future-start goals, past end dates and unknown templates |
| 2026-11-08 | `f2114c4` | Before the build (Issue #38, PR #39): template row lock (AC-07.10, TC-74); more than 2 decimal places or above 99,999,999.99 is a validation error |
| 2026-11-08 | `9982b62` | Review in PR #39: input checks come before rule checks, with a combined case in TC-54; both orders allowed in the later edit-versus-goal race |
| 2026-11-08 | `94385cf` | Build evidence for Issue #40 recorded (PR #41) |
| 2026-11-08 | `23e4570` | Link to the build review added (PR #41) |
| 2026-11-10 | `f8bb684` | The reviewer's acceptance of the field naming, list order and over-maximum code recorded (Issue #56, PR #57); behaviour unchanged |

## E.7 F-08 Daily entry recording {#e-f08}

**Links.** FR-11; BR-01, BR-02, BR-03, BR-04, BR-06; NFR-02, NFR-03, NFR-05, NFR-06, NFR-08; assumption A-11 (Part A). **Depends on** F-07 (Part B.1). **Contract written** 2026-11-07, commit `db9efae` (Issue #28, PR #29); revised 2026-11-08 for the decimal rules (Issue #38, PR #39); **built** in Issue #42, PR #43 (failing tests `d43f160`, then code `7d2979b`).

### Behaviour and workflow

1. On the goals page, each of the Participant's goals has a small entry form: a date, a value and a **Save entry** button. The value label shows the template's unit.
2. The Participant picks a day (today by default), types a number and saves.
3. The API checks the request in a fixed order (see the table below). If every check passes, it stores one entry for that goal and day and answers 201.
4. The new entry appears in the goal's entry list, and the goal's progress (E.8) is fetched again.
5. A saved entry cannot be changed or removed in Sprint 1. Editing arrives with F-13 in Sprint 2 (A-11).

### Rules

| Rule | What this feature does with it |
|---|---|
| BR-01 | The service refuses a date after today first, then a date outside the goal's start and end dates. Both ends of the goal are allowed. |
| BR-02 | "Today" is worked out on the server from the current instant in Asia/Bangkok, whatever time zone the server process uses. The date box in the browser uses the same zone. |
| BR-03 | The value is compared with the template's lowest and highest values; both limits are allowed. Before that, the value must fit `DECIMAL(10,2)` (Part C.2): more than two decimal places is refused, never rounded. |
| BR-04 | The database unique index on (goal, date) decides. The service turns a clash into 409, so two requests at the same moment give one row and one 409. |
| BR-06 | A goal that has ended still accepts an entry dated inside its period, because BR-01 allows it. A date after its end date is refused by BR-01. |
| Daily target | A value above the goal's daily target is allowed. Only the template range limits the value. |

### Validation, failure and boundary cases

The checks run in the order of the rows. The first check that fails gives the answer.

| Case | Result (status and error code) |
|---|---|
| A write from another site | 403 `ORIGIN_NOT_ALLOWED` (Part C.4) |
| No valid session | 401 `UNAUTHENTICATED` |
| Caller is a Manager | 403 `FORBIDDEN` |
| Body is not valid JSON | 400 `VALIDATION_ERROR` |
| Goal id is unknown, not a whole number, or belongs to another Participant | 404 `GOAL_NOT_FOUND`, the same body in each case. This check comes before the body check, so a bad body sent to such a goal still gets 404. |
| `entryDate` missing, not `YYYY-MM-DD`, or not a real calendar day (for example 2026-02-30) | 400 `VALIDATION_ERROR` |
| `value` missing, not a JSON number (a string such as `"7"` is refused), more than two decimal places, or beyond ±99,999,999.99 | 400 `VALIDATION_ERROR`, even if the value is also out of the template range (24.555 with a maximum of 24 gets this code) |
| `entryDate` after today in Asia/Bangkok | 400 `ENTRY_DATE_IN_FUTURE`, even if the date is also outside the goal |
| `entryDate` before the goal's start date or after its end date | 400 `ENTRY_DATE_OUTSIDE_GOAL` |
| `value` below the template's lowest or above its highest value | 400 `VALUE_OUT_OF_RANGE` |
| An entry already exists for this goal and day | 409 `ENTRY_ALREADY_EXISTS`; the stored value does not change |
| Boundaries that are accepted | A date equal to today, to the start date or to the end date; a value equal to either template limit |
| Unknown body fields, such as `goalId` or `participantId` | Dropped; the request is handled as if they were absent |

No failed request stores anything.

### Permissions

As in Part C.5 for `GET` and `POST /api/goals/:id/entries`. This feature adds only one point: an unknown goal id and another Participant's goal give the same 404 status and the same body.

### UI

- The entry form sits under each goal on `/goals`. The date box defaults to today in Asia/Bangkok, even when the browser is in another time zone. The Participant may choose another day.
- While a save is running, **Save entry** is disabled. Nothing is shown as saved until the API answers 201.
- After a 201 the value box is cleared, the entry is added to the list (newest date first) and the progress line is reloaded.
- A refused save shows the API message in an alert, for example "The value must be between 0 and 24." or "An entry already exists for this day.", and keeps the typed value.
- Each goal lists its entries as "`<date>`: `<value>` `<unit>`". With none, it shows "No entries yet". While the list loads it shows "Loading…".
- Width, keyboard use and focus outline follow the system checks in E.0 (TC-47, TC-48).

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/goals/:id/entries` | `{ "entryDate": "2026-11-10", "value": 7.5 }`; both fields required | 201 `{ "entry": { "id", "goalId", "entryDate", "value" } }`; `value` is a JSON number | 400 `VALIDATION_ERROR`, `ENTRY_DATE_IN_FUTURE`, `ENTRY_DATE_OUTSIDE_GOAL`, `VALUE_OUT_OF_RANGE`; 401; 403; 404 `GOAL_NOT_FOUND`; 409 `ENTRY_ALREADY_EXISTS` |
| `GET /api/goals/:id/entries` | none | 200 `{ "entries": [ … ] }`, same item shape, newest date first | 401; 403; 404 `GOAL_NOT_FOUND` |

### Data

The `Entry` table is described in Part C.2. This feature adds it with one migration, `20261109000100_entry`, which changes no other table. The database itself enforces the unique (goal, date) index and refuses to delete a goal that has entries. The value is stored with two decimal places, and the date is stored as a `DATE` holding the Bangkok day.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-08.1 | A valid request gets 201 with the entry. `GET /api/goals/:id/entries` then returns it, also after the app restarts, and the goals page shows the value with the template's unit. |
| AC-08.2 | A date after today (Asia/Bangkok) gets 400 `ENTRY_DATE_IN_FUTURE` and nothing is stored. This holds even when the date is also outside the goal, because this check comes first. |
| AC-08.3 | A date before the goal's start or after its end gets 400 `ENTRY_DATE_OUTSIDE_GOAL`. This includes a date after the end of an Ended goal. |
| AC-08.4 | Today, the start date and the end date are all accepted. |
| AC-08.5 | Today is the Bangkok date. At 23:59:59 Bangkok time on 2026-11-10, an entry for 2026-11-11 gets 400 `ENTRY_DATE_IN_FUTURE`; one second later, at 00:00:00 on 2026-11-11, the same entry is accepted. The server's own time zone makes no difference. |
| AC-08.6 | A value below the template's lowest or above its highest value gets 400 `VALUE_OUT_OF_RANGE`. A value equal to either limit is accepted. |
| AC-08.7 | A second entry for the same goal and day gets 409 `ENTRY_ALREADY_EXISTS`, and the first entry keeps its value. |
| AC-08.8 | A missing or badly formed date or value, a value with more than two decimal places, or a value outside `DECIMAL(10,2)` gets 400 `VALIDATION_ERROR` (also when it is out of the template range) and nothing is stored. |
| AC-08.9 | An anonymous caller gets 401 `UNAUTHENTICATED`, a Manager gets 403 `FORBIDDEN`, and another Participant's goal or an unknown goal gets 404 `GOAL_NOT_FOUND`. Nothing is stored. |
| AC-08.10 | In the browser, a refused entry shows the API message and the typed value stays in the box. |
| AC-08.11 | An entry dated inside the period of a goal that has already ended, and not in the future, is accepted. |
| AC-08.12 | The date box on the goals page starts at today's Bangkok date, whatever the browser's time zone. |

### Test specification

`D` is today's date in Asia/Bangkok. API and browser tests create their data with dates relative to `D`, so the server needs no fake clock. Unit tests pass the current instant to the rule function. Each test builds its own goals, so goal names (G, G2 …) do not carry over between tests.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-23 | AC-08.1 | API and browser | Participant A's goal G (`D-9` to `D+20`) on template T (0 to 24, hours) | `POST` 7.5 for `D` (the API test also sends unknown fields `goalId` and `participantId`); list the entries; save 7.5 on the goals page and reload | 201 with `{ entry: { id, goalId, entryDate, value: 7.5 } }`; the list holds exactly that entry; the page shows "`D`: 7.5 hours" before and after the reload |
| TC-24 | AC-08.2 | Unit and API | G as above; goal G2 (`D-9` to `D+5`) on another template | `POST` for `D+1` on G; `POST` for `D+10` on G2 | Both get 400 `ENTRY_DATE_IN_FUTURE` (G2's date is also outside the goal); no row stored |
| TC-25 | AC-08.3 | Unit and API | Goal G3 (`D-15` to `D+5`); Ended goal G4 (`D-15` to `D-5`) on another template | `POST` for `D-16` on G3; `POST` for `D-4` on G4 | Each gets 400 `ENTRY_DATE_OUTSIDE_GOAL`; no row stored |
| TC-26 | AC-08.4 | Unit and API | Goal G5 (`D-15` to `D`) | `POST` for `D-15` (start) and for `D` (today and end) | Both 201 |
| TC-27 | AC-08.5, AC-08.12 | Unit and browser | Unit: process zone `TZ=UTC`, goal 2026-11-01 to 2026-11-30, instant passed as an argument. Browser: fixed clock, browser zone America/Los_Angeles | Check an entry for 2026-11-11 and the date box default at 2026-11-10T16:59:59Z, then at 2026-11-10T17:00:00Z | First instant: today is 2026-11-10, the entry gets `ENTRY_DATE_IN_FUTURE`, the date box shows 2026-11-10. Second instant: today is 2026-11-11, the entry passes, the date box shows 2026-11-11. Code that used the machine's zone would fail the second check |
| TC-28 | AC-08.6 | Unit and API | Goal G6 (`D-15` to `D+5`) on T (0 to 24) | `POST` -0.5 and 24.5 for `D-15`; then 0 for `D-15` and 24 for `D-14` | -0.5 and 24.5 get 400 `VALUE_OUT_OF_RANGE` with no row stored; 0 and 24 get 201, each on its own day |
| TC-29 | AC-08.7 | API | An entry of 3 exists for G on `D` | `POST` 9 for `D`; then two requests at once for `D-1` | 409 `ENTRY_ALREADY_EXISTS` and the stored value stays 3; the pair gives one 201 and one 409, and one row for `D-1` |
| TC-30 | AC-08.3, AC-08.11 | Unit and API | Ended goal G4 (`D-15` to `D-5`) | `POST` for `D-4`; then `POST` for `D-10` | `D-4` gets 400 `ENTRY_DATE_OUTSIDE_GOAL`; `D-10` gets 201 |
| TC-56 | AC-08.8, AC-08.9 | Unit and API | A logged in; A's goal G; B's goal | To G: no date, date `11/05/2026`, no value, value `"abc"`, 7.555, 24.555, 100000000, an empty body, a body that is not JSON. A valid body as anonymous and as Manager, to G, by `GET` and `POST`. A valid body and bad bodies to B's goal and to goal 99999. `GET /api/goals/abc/entries` | Bad bodies to G get 400 `VALIDATION_ERROR`; anonymous 401 `UNAUTHENTICATED`; Manager 403 `FORBIDDEN`; B's goal, 99999 and `abc` get 404 `GOAL_NOT_FOUND`, also with a bad body; no row stored |
| TC-58 | AC-08.1 | API and database | A's goal G with one saved entry | Start a new app process with a new database connection; `GET /api/goals/:id/entries` from it | The same entry is returned |
| TC-61 | AC-08.10 | Browser | A logged in on the goals page; T is 0 to 24 | Type 30 and save; then type 7.5 and save; then type 6 and save again for the same day | 30 shows "The value must be between 0 and 24." and stays in the box, with no row stored; 7.5 saves; 6 shows "An entry already exists for this day." and stays in the box |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `db9efae` | First version (Issue #28, PR #29) |
| 2026-11-07 | `b5304f0` | Review round 1 on PR #29: each accepted value in TC-28 gets its own day; error codes in TC-56; test dates relative to the Bangkok today; AC-08.5 and TC-27 reworded; AC-08.11 and AC-08.12 added; order of rule checks; date box; two decimal places |
| 2026-11-07 | `9f2056b` | TC-27 wording: code that uses the machine's zone fails the second check, not the first |
| 2026-11-08 | `f2114c4` | Issue #38 (PR #39): more than two decimal places, or a value outside `DECIMAL(10,2)`, is 400 `VALIDATION_ERROR` and wins over `VALUE_OUT_OF_RANGE` |
| 2026-11-09 | `a0a271c` | Build evidence for Issue #42 recorded; no change to the requirements |

## E.8 F-09 Progress (days met) {#e-f09}

**Links.** FR-12; BR-07, BR-02, BR-04; NFR-05, NFR-06, NFR-08; assumption A-1 (Part A). **Depends on** F-08 (Part B.1). **Contract written** 2026-11-07, commit `db9efae` (Issue #28, PR #29); **built** in Issue #44, PR #51 (failing tests `af813de`, then code `df8f61b`).

### Behaviour and workflow

1. A Participant opens `/goals`. Each goal shows a line "N of M days met".
2. The API computes N and M from the goal and its entries on every request. Nothing about progress is stored.
3. After an entry is saved, the page fetches the goal list again, so the line updates at once.

### Rules

| Rule | What this feature does with it |
|---|---|
| BR-07 | `daysSoFar` counts the days from the start date up to the last counted day, both included. The last counted day is today or the end date, whichever is earlier. When the last counted day is before the start date, the result is 0 of 0. |
| BR-07, day met | A day counts in `daysMet` when its entry's value is greater than or equal to the goal's daily target. Decimal targets are compared exactly (7.49 does not meet 7.5). Entries outside the counted days are ignored. |
| BR-02 | "Today" is the Bangkok date of the current instant; the calculation does not use the machine's time zone. |
| BR-04 | A day has at most one entry, so a day's value is that entry's value. |
| Missed and empty days | A counted day with a value below the target, or with no entry, adds to `daysSoFar` only. Today counts even before it has an entry (A-1). |

Each goal's progress uses only that goal's entries, so two goals of one Participant with entries on the same day keep separate counts.

### Validation, failure and boundary cases

Reading progress takes no body, so it can only fail on access.

| Case | Result (status and error code) |
|---|---|
| No valid session | 401 `UNAUTHENTICATED` |
| Caller is a Manager | 403 `FORBIDDEN` |
| Goal with no entries | 200; `daysMet` 0, `daysSoFar` counts today |
| Goal that starts after today | 200; 0 of 0 |
| Goal that starts today | 200; 0 of 1, then 1 of 1 once today's entry meets the target |
| Ended goal | 200; `daysSoFar` is the full period and stops growing |

### Permissions

As in Part C.5 for `GET /api/goals`. A Participant gets progress only for their own goals; another Participant's goals never appear in the list (E.9).

### UI

- Each goal on `/goals` shows the template name, "Daily target: `<target>` `<unit>`", the start and end dates, "Active" or "Ended", and the line "N of M days met". Sprint 1 has no calendar and no colours.
- While the list loads the page shows "Loading…". With no goals it shows "No goals yet". A failed load shows the error message as in Part C.3.
- Width and keyboard use follow the system checks in E.0 (TC-47, TC-48).

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/goals` | none | 200 `{ "goals": [ … ] }`: the goal objects of E.6, each with an added `progress: { "daysMet": 4, "daysSoFar": 10 }`. Both are whole numbers and `daysMet` ≤ `daysSoFar` | 401 `UNAUTHENTICATED`; 403 `FORBIDDEN` |

No new path is added.

### Data

No table, column or migration. Progress is computed from `Goal` and `Entry` (Part C.2); an API test checks that no progress or day-count column exists.

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-09.1 | A day whose value equals or exceeds the daily target counts in both `daysMet` and `daysSoFar`. |
| AC-09.2 | A day whose value is below the target counts in `daysSoFar` only. |
| AC-09.3 | A day with no entry counts in `daysSoFar` only. |
| AC-09.4 | A goal that has not started shows `daysSoFar` 0 and `daysMet` 0. |
| AC-09.5 | For an Ended goal, `daysSoFar` covers the start date to the end date and does not grow after that. |
| AC-09.6 | After a new entry is saved, the next `GET /api/goals` shows the new numbers (an entry that meets the target raises `daysMet`). This is still true after the app restarts. |
| AC-09.7 | The goals page shows "N of M days met" for each goal, with the same numbers as the API. |
| AC-09.8 | On `GET /api/goals`, an anonymous caller gets 401 `UNAUTHENTICATED` and a Manager gets 403 `FORBIDDEN`. |

### Test specification

`D` is today's date in Asia/Bangkok. Browser and API tests seed or create data relative to `D`. The unit test passes `today` to the calculation as an argument and runs with `TZ=UTC`.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-31 | AC-09.1, AC-09.2, AC-09.3, AC-09.4, AC-09.5 | Unit (repeated over the API) | `today` = 2026-11-10; target 30; goal 2026-11-01 to 2026-11-30; entries 11-01 = 30 (met), 11-02 = 29.9 (missed), 11-03 none (empty), 11-04 = 45 (met) | Compute progress; then for a goal starting 2026-11-20; then for a goal 2026-11-01 to 2026-11-05, with `today` 2026-11-10 and 2026-12-31 | 2 of 10; then 0 of 0; then 2 of 5 for both values of `today` |
| TC-32 | AC-09.7 | Browser | A logged in; goal `D-9` to `D+20`, target 30; entries `D-9` = 30, `D-8` = 29.9, `D-6` = 45 | Open the goals page | The page shows "2 of 10 days met" and does not scroll sideways |
| TC-59 | AC-09.6, AC-09.7, AC-09.8 | Browser and API | Seeded Manager and Participants A and B; no template "Sleep"; A has no goal; the app runs as its own process | The Manager creates template "Sleep" (0 to 24, hours) on screen. A creates a goal on it from `D` to `D`, target 8, and reads the page. A saves 8 for `D` and reads the page. Stop the app, start it again, reload, log out and in. Call `GET /api/goals` with no session and as the Manager | The page shows "0 of 1 days met", then "1 of 1 days met", and still "1 of 1 days met" with the entry "`D`: 8 hours" after the restart; no session gets 401 `UNAUTHENTICATED`; the Manager gets 403 `FORBIDDEN` |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `db9efae` | First version (Issue #28, PR #29) |
| 2026-11-07 | `b5304f0` | Review round 1 on PR #29: test dates relative to the Bangkok today (TC-32, TC-59); in TC-59 the Manager creates the template on screen and the page is read before and after the entry; "days so far" includes today (decision Q5) |
| 2026-11-10 | `d24d766` | Build evidence for Issue #44 recorded; no change to the requirements |

## E.9 F-10 Participant data privacy {#e-f10}

**Links.** FR-13, FR-14; BR-10; NFR-03, NFR-02 (Part A). **Depends on** F-01, F-07, F-08 (Part B.1). **Contract written** 2026-11-07, commit `db9efae` (Issue #28, PR #29); **built** in Issue #44, PR #51 (failing tests `af813de`; the checks themselves came with F-07 and F-08, see the notes).

### Behaviour and workflow

F-10 adds no screen and no endpoint. It is a property of the goal and entry endpoints of E.6 to E.8:

1. A Participant reads and writes only goals and entries whose owner is the session user.
2. Another Participant's goal is answered exactly like a goal that does not exist, so a caller cannot learn which ids are in use.
3. A Manager is refused on every goal and entry endpoint by the role check.
4. The owner always comes from the session. A `participantId` or `userId` in a request body is dropped.

### Rules

| Rule | What this feature does with it |
|---|---|
| BR-10 | `GET /api/goals` selects goals by the session user's id only. The entry endpoints load the goal by id **and** the session user's id; no match gives 404. |
| NFR-03 | With Participants A and B and one Manager, no attempt to read or change another account's goals or entries succeeds; the test compares the stored goals and entries before and after. |
| Order | Session (401), then role (403), then ownership (404), as in Part C.1. |

### Validation, failure and boundary cases

| Case | Result (status and error code) |
|---|---|
| Anonymous on `GET` or `POST /api/goals`, or `GET` or `POST /api/goals/:id/entries` | 401 `UNAUTHENTICATED`; nothing stored or returned |
| Manager on any of those four | 403 `FORBIDDEN`; nothing stored or returned |
| B's `GET /api/goals` | 200 with B's goals only |
| B's `GET` or `POST` on A's goal entries | 404 `GOAL_NOT_FOUND`; nothing stored or returned |
| B's request for goal id 99999 (does not exist) | 404 `GOAL_NOT_FOUND` with the same body as for A's goal |
| B's `POST /api/goals` with A's id in `participantId` or `userId` | 201; the goal belongs to B; A's goals are unchanged |

### Permissions

The rows for goals and entries in Part C.5 are this feature. It adds only the rule that "not yours" and "does not exist" give an identical answer.

### UI

No new screen. `/goals` lists only what the API returns, so it shows only the signed-in Participant's goals, entries and progress. The role menus and the "not available for your role" page are in Part C.3; hiding a menu item is not the protection.

### API

| Method and path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/goals` | none | 200, caller's goals only | 401; 403 |
| `POST /api/goals` | as E.6; owner fields dropped | 201, owner = session user | 401; 403; others as E.6 |
| `GET /api/goals/:id/entries` | none | 200, own goal only | 401; 403; 404 `GOAL_NOT_FOUND` (not yours or unknown, same body) |
| `POST /api/goals/:id/entries` | as E.7 | 201, own goal only | 401; 403; 404 `GOAL_NOT_FOUND` (not yours or unknown, same body); others as E.7 |

No endpoint reads or changes a single goal by id in Sprint 1.

### Data

No table or migration. Ownership is `Goal.participant_id`, and an entry is owned through its goal (Part C.2).

### Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-10.1 | Participant B's `GET /api/goals` holds none of A's goals, and A's holds none of B's. |
| AC-10.2 | B's `POST` or `GET` on the entries of A's goal gets 404 `GOAL_NOT_FOUND`; no entry is stored or returned. |
| AC-10.3 | A Manager's `GET /api/goals`, `POST /api/goals`, and `POST` or `GET` on entries each get 403 `FORBIDDEN`; nothing is stored or returned. |
| AC-10.4 | An anonymous caller gets 401 `UNAUTHENTICATED` on every goal and entry endpoint; nothing is stored or returned. |
| AC-10.5 | A request for another Participant's goal and a request for an unknown goal id get the same status and the same body. |
| AC-10.6 | A goal that B creates with A's id in the body belongs to B (the field is dropped and the request succeeds), and A's data does not change. |
| AC-10.7 | The goals page shows only the signed-in Participant's goals and progress. |

### Test specification

`D` is today's date in Asia/Bangkok. Each test creates Participants A and B and one Manager with passwords made at run time. A has goal GA (`D-5` to `D+20`) with one entry; B has goal GB.

| Test | AC | Level | Precondition or input | Action | Expected result |
|---|---|---|---|---|---|
| TC-33 | AC-10.1, AC-10.2, AC-10.6 | API | GA with an entry; GB | As B: `GET /api/goals`; `GET` and `POST /api/goals/GA/entries`; `POST /api/goals` with `participantId` and `userId` set to A | B's list holds only GB; both entry calls get 404 `GOAL_NOT_FOUND` and the stored data is unchanged; the new goal gets 201 and belongs to B; A still has one goal |
| TC-34 | AC-10.3, AC-10.4 | API | Same data | As anonymous and as Manager: `GET` and `POST /api/goals`, `GET` and `POST /api/goals/GA/entries` | Anonymous gets 401 `UNAUTHENTICATED` and the Manager 403 `FORBIDDEN` on all four; no answer contains A's data; the stored data is unchanged |
| TC-35 | AC-10.7 | API and browser | A and B each with a goal on a different template and with entries | API: `GET /api/goals` as A and as B. Browser: open `/goals` as A, log out, open it as B | Each sees only their own goal, entries and progress (A: "1 of 2 days met", no "Reading" and no B value; B: "2 of 2 days met", no "Sleep") |
| TC-57 | AC-10.5 | API | GA exists; no goal 99999 | As B: `GET` and `POST` to `/api/goals/GA/entries` and to `/api/goals/99999/entries` | All four get 404; for each method the two status codes and bodies are identical |

### Version history

| Date | Commit | Change |
|---|---|---|
| 2026-11-07 | `db9efae` | First version (Issue #28, PR #29) |
| 2026-11-07 | `b5304f0` | Review round 1 on PR #29: an error code in every expected result; unknown fields "stripped" (decision Q3); menu wording corrected |
| 2026-11-10 | `d24d766` | Build evidence for Issue #44 recorded; no change to the requirements |
