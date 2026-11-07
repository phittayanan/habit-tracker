# F-01 Login, logout and session

Sprint 1 contract (Part E, Issue #30). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-01 Login, logout and session |
| Sprint | 1 |
| Requirements | FR-01, FR-02, FR-03, FR-04; NFR-01, NFR-04 |
| Related | SDS section 6 (authentication and session lifecycle), SDS S-10, S-11, S-12 (decided on PR #23); SRS A-9 (seeded account names, open) |
| Depends on | none |
| Needed by | every other feature (F-02 to F-10 read the session user) |
| Author / reviewer | phittayanan / projectnewy |
| Status | Merged contract; implementation review corrections specified |

## 2. Behaviour and workflow

1. Accounts are seeded; there is no self-registration and no password recovery (ADR 0004). The seed creates one Manager and at least two Participants (SDS 3.6).
2. A user opens the login screen, types a username and a password and presses "Log in".
3. The API compares the password with the stored bcrypt hash (ADR 0029). On success it stores a Session row with a random ID and `expires_at` = login time plus 8 hours (ADR 0027, ADR 0028), sets an HTTP-only cookie holding that ID, and returns the user. The browser then opens the role's first page (F-02).
4. Every protected request reads the cookie and loads the Session row. A missing, unknown or expired session is refused with 401 (SDS 6.4). An expired row is deleted when the API finds it (SDS S-11).
5. "Log out" deletes the Session row and clears the cookie. The old cookie value no longer gives access, even if it is replayed (SDS 6.6).
6. The 8 hours run from login and are not extended by activity (ADR 0028; SDS 3.2, 6.4).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| Login | A valid username and password create one Session row and set the cookie. An invalid login creates no session | SRS FR-01; ADR 0027 |
| Same answer | An unknown username and a wrong password get the same status, code and message | SDS 4.3, 6.2 |
| Logout | Logout deletes the Session row at once; the old cookie then gets 401 | SRS FR-02, NFR-04; ADR 0027 |
| Who am I | A logged-in user can read their name and role | SRS FR-03; SDS 6.5 |
| Expiry | A session is valid while the current instant is before `expires_at` (login plus 8 hours); from `expires_at` on it is refused with 401 (OP-01.6) | SRS FR-04, NFR-04; ADR 0028 |
| Cookie | HTTP-only, `SameSite=Lax`, path `/`, `Secure` in production, and it holds only the session ID | SRS NFR-04; SDS 6.3, S-10 |
| Session ID | Random, at least 128 bits, not guessable | SDS 3.2 |
| Passwords | Stored only as bcrypt hashes (`bcryptjs`). No plaintext password in code, Git, logs, screens or any response | SRS NFR-01; ADR 0029; SDS 6.1 |
| Cross-site | A state-changing request whose parsed `Origin` host differs from the `Host` header (OP-01.2) is refused (OP-01.2). Bodies are JSON only | SDS 6.8, S-12 |

## 4. Validation and failure cases

Login is the only Sprint 1 endpoint that needs no session. On every state-changing request (`POST`, `PATCH`, `PUT`, `DELETE`), including login and logout, the Origin check runs first (OP-01.2). Then the steps of SDS 2.2 follow: session (401), role (403), validation (400). For login: Origin (403), validation (400), credentials (401).

| Order | Case | Result | Error code | Message (OP-01.9) |
|---|---|---|---|---|
| 1 | State-changing request with a malformed `Origin` or a parsed Origin host that differs from the `Host` header (OP-01.2) | 403 | `ORIGIN_NOT_ALLOWED` | "This request is not allowed from another site." |
| 2 | Protected request with no cookie, an unknown session ID, a deleted session, or a session at or past `expires_at` | 401 | `UNAUTHENTICATED` | "Please log in." |
| 3 | Login body not JSON; `username` or `password` missing, not a string, or empty after trimming the username | 400 | `VALIDATION_ERROR` | "Enter your username and password." |
| 4 | Login with an unknown username, or a known username and a wrong password | 401 | `INVALID_CREDENTIALS` | "Username or password is incorrect." (the same for both) |

When a request breaks more than one row, the lowest order wins. Examples: a cross-site login with an empty body gets `403 ORIGIN_NOT_ALLOWED`; a login with no password and an unknown username gets `400 VALIDATION_ERROR`.

Unknown body fields (for example `role`) are stripped and do not cause an error (decided on PR #29, OP-07.7).

Boundaries: a session used at login plus 7:59:59 is accepted; at login plus 8:00:00 it is refused. A request with no `Origin` header is not refused by the Origin check (OP-01.2).

## 5. Permissions

| Caller | Log in | Log out | Who am I |
|---|---|---|---|
| Anonymous | allowed | 401 | 401 |
| Participant | allowed | allowed, own session | allowed, own account |
| Manager | allowed | allowed, own session | allowed, own account |

The acting user always comes from the Session row named by the cookie, never from the request body or URL (SDS 2.2).

## 6. UI behaviour

- **Login screen** (SDS 4.1): username box, password box (masked), "Log in" button. No sign-up and no "forgot password" link (ADR 0004).
- On success the browser opens the role's first page (F-02, OP-02.1).
- A rejected login shows the API `message` above the form, keeps the typed username and clears the password box. While the request runs the button is disabled (SDS 4.2).
- **Log out** is in the top bar on every page (ADR 0026; F-02). After logout the browser shows the login screen.
- Any API answer of 401 returns the user to the login screen (SDS 4.2; tested in F-02, TC-67).
- The form works with the keyboard alone: Tab between boxes, Enter submits (NFR-06; TC-48 covers Sprint 1 screens).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025). Field names are camelCase in the API (OP-07.3). Bodies are JSON (`Content-Type: application/json`).

**`POST /api/auth/login`** (anyone)

Request (the password value comes from the seed environment variable; it is never written in the repository):
```json
{ "username": "participant1", "password": "<value of SEED_PARTICIPANT_PASSWORD>" }
```
Response 200, with the header `Set-Cookie: sid=<random ID>; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800` (plus `Secure` in production):
```json
{ "user": { "id": 2, "username": "participant1", "displayName": "Participant One", "role": "PARTICIPANT" } }
```
Errors: 400, 401, 403 as in section 4.

**`POST /api/auth/logout`** (logged in): no body. Response 204 with `Set-Cookie: sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`. Errors: 401, 403 (Origin).

**`GET /api/auth/me`** (logged in): response 200 in the same `{ "user": { ... } }` shape as login. Errors: 401.

No response carries `password`, `passwordHash` or the session ID in the body.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `User` | `id` integer primary key; `username` text unique not null; `display_name` text not null; `role` enum `PARTICIPANT` or `MANAGER` not null; `password_hash` text not null; `created_at` timestamp not null (SDS 3.2) |
| Table `Session` | `id` text primary key (random, at least 128 bits; OP-01.5); `user_id` not null, reference to User, on delete cascade; `created_at` timestamp not null; `expires_at` timestamp not null = `created_at` plus 8 hours (SDS 3.2) |
| Migration | One additive Prisma migration that creates `User` and `Session` (the first migration; no existing table changes) |
| Seed | `npm run prisma:seed`, safe to run twice: upserts one Manager and two Participants by `username` (names: SRS A-9, OP-01.7). Passwords come from `SEED_MANAGER_PASSWORD` and `SEED_PARTICIPANT_PASSWORD` and are stored as bcrypt hashes (SDS 3.6, 7.1). If a variable is missing the seed stops with an error and creates no account (OP-01.8) |
| Expired rows | Deleted when the API finds them on a request (SDS S-11); there is no scheduled clean-up |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-01.1 | A valid login gets 200 with the user's `id`, `username`, `displayName` and `role`, and a `Set-Cookie` with the session ID that is `HttpOnly`, `SameSite=Lax` and `Path=/`; sending that cookie to `GET /api/auth/me` then gets 200 |
| AC-01.2 | An unknown username and a wrong password each get `401 INVALID_CREDENTIALS` with the same message, no `Set-Cookie`, and no new session |
| AC-01.3 | A login body that is not JSON, or has a missing, empty or non-string `username` or `password`, gets `400 VALIDATION_ERROR` and no cookie |
| AC-01.4 | Logout gets 204 and clears the cookie; the old cookie value then gets `401 UNAUTHENTICATED` on `GET /api/auth/me`; logout with no session gets `401 UNAUTHENTICATED` |
| AC-01.5 | `GET /api/auth/me` returns the display name and role of the session user, for a Manager and for a Participant. No auth response contains a password, a password hash or the session ID in the body |
| AC-01.6 | A protected request with no cookie, an unknown session ID, or the ID of a deleted session gets `401 UNAUTHENTICATED` |
| AC-01.7 | A session is accepted up to login plus 7:59:59 and refused with `401 UNAUTHENTICATED` from login plus 8:00:00; requests in between do not move the expiry |
| AC-01.8 | Every stored password is a bcrypt hash, and a search of the repository finds none of the seed password values |
| AC-01.9 | A login or logout request with a foreign `Origin` gets `403 ORIGIN_NOT_ALLOWED`: the login sets no cookie and creates no session, and the logout leaves the session working |
| AC-01.10 | In the browser, a valid login opens the role's first page; a wrong password shows the API message, keeps the username and clears the password; "Log out" returns to the login screen |

## 10. Test specification

Fixtures: each test starts from its own data with one Manager and Participants A and B, created with test-only passwords from the test environment (never from the repository). Clock: unit tests of the session rule pass the current instant as an argument (decided on PR #29, OP-07.9); API tests age a session by moving its `created_at` and `expires_at` back in the test database, so the server needs no clock hook.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-01 | AC-01.1 | API | Participant A exists; no session rows | `POST /api/auth/login` with A's username and password; then `GET /api/auth/me` with the returned cookie | 200 with A's user; one Session row for A with `expires_at` = `created_at` + 8 h; `me` gets 200 |
| TC-02 | AC-01.2 | API | A exists; no user named `nobody` | Log in as `nobody` with any password; log in as A with a wrong password | Both get `401 INVALID_CREDENTIALS` with identical bodies; no `Set-Cookie`; Session table still empty. A call-through spy verifies one real cost-10 bcrypt comparison per invalid attempt, including the unknown username |
| TC-03 | AC-01.4 | API | A logged in; cookie saved | `POST /api/auth/logout`; replay the saved cookie on `GET /api/auth/me`; call logout again with no cookie | 204 and a clearing `Set-Cookie`; A's session row is gone; the replay gets `401 UNAUTHENTICATED`; the cookieless logout gets `401 UNAUTHENTICATED` |
| TC-04 | AC-01.5 | API | Manager and A logged in | `GET /api/auth/me` as each | 200 with `displayName` and role `MANAGER`, then `PARTICIPANT`; no `password`, `passwordHash` or session ID in either body (also checked on the login body) |
| TC-05 | AC-01.6 | API | A logged in, then A's session row deleted in the test database | `GET /api/auth/me` with no cookie, with `sid=abc`, and with A's deleted session ID | Each gets `401 UNAUTHENTICATED` |
| TC-06 | AC-01.7 | API | A logged in; A makes one request and the test reads `expires_at` | Move A's session `created_at` and `expires_at` back by 8 hours in the test database; `GET /api/auth/me` | `expires_at` did not change after the first request; the aged session gets `401 UNAUTHENTICATED`; the row is deleted |
| TC-62 | AC-01.3 | API | A exists | Log in with: a form-encoded body; `{}`; no `password`; `"password": 123`; `"password": ""`; `"username": "   "` | Each gets `400 VALIDATION_ERROR`; no `Set-Cookie`; no Session row |
| TC-63 | AC-01.7 | Unit | Session created at 2026-11-10T01:00:00Z; the instant is passed as an argument | Check the session at 08:59:59Z and at 09:00:00Z | Valid at 08:59:59Z; expired at 09:00:00Z |
| TC-64 | AC-01.9 | API | A exists; A logged in on a second client; request `Host: app.example` | Log in as A with `Origin: https://evil.example`; log out the second client with the same Origin; log in with `Origin: https://app.example`; log in with no Origin. On an HTTP connection to Express repeat the matching-host login with `Origin: https://app.example` and `X-Forwarded-Proto: https`, then repeat with the foreign Origin and that forwarded header | Foreign requests get `403 ORIGIN_NOT_ALLOWED`; they add no session and the second client still gets 200 on `me`. Matching-host and no-Origin logins get 200, including the HTTP upstream / HTTPS forwarded case; the forwarded header does not allow the foreign Origin |
| TC-44 | AC-01.8 | API | Seed run with test passwords | Read every `password_hash` in the user table | Each matches the bcrypt format and verifies with `bcryptjs` against its test password; none equals the plaintext |
| TC-45 | AC-01.8 | Script | Seed password values from the environment | Search the Git-tracked files for each value | No match |
| TC-46 | AC-01.1 | API and unit | A exists | Log in; read `Set-Cookie`. Unit: build the cookie options with `NODE_ENV=production` and with `test` | `HttpOnly`, `SameSite=Lax`, `Path=/` present; `Secure` only in production |
| TC-65 | AC-01.10 | Browser | Seeded test Manager and A; app started on the test database | Log in as A with a wrong password; then with the right one; press "Log out". Log in as the Manager | Wrong password: the API message is shown, the username kept, the password box empty. Right one: A's first page opens. Log out: the login screen. Manager: the Manager's first page |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The migration is additive and applies on a clean database; the seed runs twice without error and stops with an error when a seed password variable is missing.
- The session rule takes the current instant as an argument (TC-63), and the 401 path is one middleware used by every protected route.
- No password, hash or session ID is logged (NFR-01; SDS 4.3).
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup (seed variables in `.env.example` with fake values) are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-01.1 | Code for a failed login. SDS 6.2 fixes 401 and one message for both cases, not the code | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `401 INVALID_CREDENTIALS`, kept apart from `UNAUTHENTICATED` so the UI can tell "wrong password" from "session ended" |
| OP-01.2 | The exact Origin check (SDS 6.8 leaves it to this contract) | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1), host-only option: on `POST`, `PATCH`, `PUT` and `DELETE`, parse a present `Origin` as a URL and compare its host (including any port) against the `Host` header. A malformed or non-matching Origin gets `403 ORIGIN_NOT_ALLOWED`; no Origin passes. Runs before the session check. Compare hosts without the scheme because Cloud Run terminates HTTPS before Express, which may see HTTP; `X-Forwarded-Proto` does not change this comparison. No new environment variable |
| OP-01.3 | A non-JSON body | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `400 VALIDATION_ERROR`, so every Sprint 1 error stays inside the SDS 4.3 status list (no 415) |
| OP-01.4 | Logging in while already logged in | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): a new session is created and the cookie replaced; the session named by an incoming cookie, if any, is deleted |
| OP-01.5 | Session ID format and cookie name | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): 32 random bytes from Node `crypto`, base64url; cookie name `sid`; `Max-Age=28800` (SDS 6.3 allows no more than 8 hours) |
| OP-01.6 | Expiry boundary: is a session at exactly `expires_at` still valid | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): no; valid only while now is before `expires_at` (TC-63) |
| OP-01.7 | Seeded account names (SRS A-9) | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `manager1`, `participant1`, `participant2`, with display names "Manager One", "Participant One", "Participant Two". Passwords are shared privately (SDS 7.2) |
| OP-01.8 | Seed when a password variable is missing; second seed run | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): stop with an error and create nothing (no default password); a second run upserts by `username` and sets the hash from the current variable |
| OP-01.9 | Message wording (SDS 4.2 leaves it to each contract) | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): the texts in section 4 |
| OP-01.10 | bcrypt cost factor | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): 10 |
| OP-01.11 | Limiting repeated failed logins. No SRS line or ADR asks for it | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): not built in Sprint 1; listed here so the choice is visible |
| OP-01.12 | Unknown username can return faster than a wrong password | Decided for this implementation round by [current teammate review](https://github.com/phittayanan/habit-tracker/pull/34#pullrequestreview-5810651960) and the owner-authorized 2026-11-07 review-fix brief: compare the supplied password against a precomputed dummy bcrypt hash at cost 10 when the username is unknown, then return the same `401 INVALID_CREDENTIALS` body and no session. TC-02 spies on the real bcrypt comparison for both invalid cases and verifies its cost. This adds comparable bcrypt work without promising identical response times. The earlier discussion on https://github.com/phittayanan/habit-tracker/pull/31 introduced the proposal; its empty approval did not explicitly name OP-01.12. See ADR 0051 |
| OP-07.7 | Unknown body fields | Decided on PR #29 (Q3): stripped, the request is accepted. Applies to every Sprint 1 contract |
| OP-07.9 | How tests fix "today" and the clock | Decided on PR #29 (Q2): unit tests pass the instant as an argument; tests through the server need no clock hook |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #30) | pending |
| 2026-11-07 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): TC-05 uses auth only; host-only Origin check and forwarded HTTPS case in TC-64; login timing proposal OP-01.12; record partner agreement on existing proposals | pending (partner re-check) |

## 14. Implementation evidence

Issue #32 implements this contract. [Local red/green evidence](../../auth-implementation-evidence.md) maps all AC and test IDs to actual results. The owner's package A UI answer is recorded in [ADR 0050](../../adr/0050-auth-layout.md). OP-01.12 is implemented under current review-round authorization (ADR 0051); failed-login limiting remains excluded by OP-01.11. Implementation re-review and merge remain pending.

## 15. Current review regression requirements

For TC-44/45, invoke the actual seed file with the current Node executable, independent of npm executable lookup and working directory. Prove this by running the seed against the disposable database with no npm on PATH and from another directory; keep the existing hash, idempotence and missing-variable checks.

The shared session middleware selects only the public user fields (`id`, `username`, `displayName`, `role`); neither `req.user` nor the related session user carries `passwordHash` or `createdAt`. Inspect the actual identity downstream of the real middleware with seeded PostgreSQL fixtures; missing and unknown sessions must not reach the observer. Source inspection verifies the explicit Prisma user field selection. Steering message 005 replaces the unsupported Prisma proxy spy; its two instrumentation errors are not red evidence.

Malformed or oversized JSON parsed under `/api` gets `400 VALIDATION_ERROR`; retain the exact login message. Outside login use “Invalid JSON body.” for these parser errors. The SDS fixes the 400 status and safe error envelope, but does not prescribe parser message wording. The protected test-only Manager route exercises parser failures after Origin, session and role checks, without adding domain endpoints. This is shared error-handler evidence, not execution of future TC-53/56 domain tests.
