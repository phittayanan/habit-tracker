# Sprint 1

Part E of Deliverable 1 (Issue #8): the Sprint 1 engineering contracts and how they fit together. The contracts are the nine files `F-01-login.md` to `F-10-privacy.md` in this folder (there is no F-05 in Sprint 1: Retire is Sprint 2). Each was written and reviewed before its feature was built, and later changes stay visible in its revision history (handout D1 §3.5, GWS §8.2).

This overview adds no feature, requirement or rule. It indexes the contracts, collects their tests into one specification, records the Product Definition of Done and states what is still open. It is built only from the merged `docs/srs.md`, `docs/features.md`, `docs/traceability.md`, `docs/system-sds.md`, `docs/sprints/plan.md`, the ADRs and the nine contracts. Facts that were generated from the contract files (sections "Contracts", "Software Test Specification" and "Contract Revision History") were produced by a script that reads those files, so they match them as of the date below.

State of this overview: 2026-11-08.

## Goal

The handout's example only: a Manager defines a template; a Participant selects it, sets a goal, records daily activity and sees computed progress, with the entry rules and access restrictions enforced. Login, logout, two roles and backend permissions come with it (ADR 0020; SRS 1.2; `docs/sprints/plan.md`).

## Scope

- **In:** the nine features F-01, F-02, F-03, F-04, F-06, F-07, F-08, F-09 and F-10, and NFR-05 to NFR-09 as they apply to the Sprint 1 screens and the local setup (the system checks below). Sprint 1 has a plain goals page and no calendar (SRS A-3, SDS 4.1).
- **Out of Sprint 1:** the Retire control and FR-08 (features O-4), entry edit and delete (FR-17), so a wrong same-day entry cannot be fixed yet (SRS A-11); Docker, CI and GCP (Lab 5, not Deliverable 1; `docs/assignment.md` 4.2).
- **Out of the project:** the exclusions in SRS 1.3 and ADR 0004.
- **Cut line** (plan.md, "Feasibility"): if the team is behind, cut F-04 first, then show F-09 as a plain number. Login, the two roles, the tested rules and a finished journey are always kept. A cut is recorded in "Approved Changes" in `docs/traceability.md`.

## Contracts

Every contract has the same 13 sections: identity and links, behaviour and workflow, business rules, validation and failure cases (with the order that decides which code wins), permissions, UI behaviour, API, data, acceptance criteria (AC), test specification, definition of done, open points and decisions, and revision history. F-01 and F-02 also have a 14th section, "Implementation evidence", added when they were built (PR #34).

| Feature | Contract | Requirements | AC | Tests | Contract Issue / PR | Build Issue / PR |
|---|---|---|---|---|---|---|
| F-01 Login, logout and session | [`F-01-login.md`](F-01-login.md) | FR-01, FR-02, FR-03, FR-04; NFR-01, NFR-04 | AC-01.1 to AC-01.10 (10) | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-62, TC-63, TC-64, TC-44, TC-45, TC-46, TC-65 | #30 / PR #31 | #32 / PR #34 |
| F-02 Role layout and endpoint protection | [`F-02-roles.md`](F-02-roles.md) | FR-22; NFR-02 | AC-02.1 to AC-02.5 (5) | TC-07, TC-08, TC-66, TC-67 | #30 / PR #31 | #32 / PR #34 |
| F-03 Template creation and Manager list | [`F-03-template-create.md`](F-03-template-create.md) | FR-05, FR-06; BR-03 (minimum below maximum) | AC-03.1 to AC-03.7 (7) | TC-09, TC-10, TC-68, TC-69, TC-11, TC-70 | #30 / PR #31 | #36 / PR #37 |
| F-04 Template edit | [`F-04-template-edit.md`](F-04-template-edit.md) | FR-07, FR-23; BR-08 (edit part), BR-09 (edit refusal) | AC-04.1 to AC-04.7 (7) | TC-12, TC-13, TC-71, TC-72, TC-73, TC-18 | #30 / PR #31 | #53 / PR #54 |
| F-06 Participant template view and write refusal | [`F-06-template-view.md`](F-06-template-view.md) | FR-09, FR-23; BR-09 | AC-06.1 to AC-06.3 (3) | TC-16, TC-17 | #30 / PR #31 | #36 / PR #37 |
| F-07 Goal creation | [`F-07-goal.md`](F-07-goal.md) | FR-10; BR-05, BR-06 | AC-07.1 to AC-07.10 (10) | TC-20, TC-21, TC-22, TC-53, TC-54, TC-55, TC-60, TC-74 | #28 / PR #29, #38 / PR #39 | #40 / PR #41 |
| F-08 Daily entry recording | [`F-08-entry.md`](F-08-entry.md) | FR-11; BR-01, BR-02, BR-03, BR-04, BR-06 | AC-08.1 to AC-08.12 (12) | TC-23, TC-24, TC-25, TC-26, TC-27, TC-28, TC-29, TC-30, TC-56, TC-58, TC-61 | #28 / PR #29, #38 / PR #39 | #42 / PR #43 |
| F-09 Progress (days met) | [`F-09-progress.md`](F-09-progress.md) | FR-12; BR-07 | AC-09.1 to AC-09.8 (8) | TC-31, TC-32, TC-59 | #28 / PR #29 | #44 / PR #51 |
| F-10 Participant data privacy | [`F-10-privacy.md`](F-10-privacy.md) | FR-13, FR-14; BR-10; NFR-03 | AC-10.1 to AC-10.7 (7) | TC-33, TC-34, TC-35, TC-57 | #28 / PR #29 | #44 / PR #51 |

Contract Issues and PRs: #30 and PR #31 for F-01 to F-06, #28 and PR #29 for F-07 to F-10. Build Issues follow the five groups in `docs/sprints/plan.md` ("Feasibility"): Auth, Template, Goal, Entry, and Progress with privacy.

### Interface Contracts

All Sprint 1 endpoints, taken from the contracts (the paths and roles also appear in SDS 4.4 and 5.1). Exact request and response bodies are in the contract named in the last column.

| Method and path | Who may call it | Success | Contract |
|---|---|---|---|
| `GET /api/health`, `GET /api/ready` | anyone (kit smoke test) | 200; `ready` answers 503 when the database does not | F-02 section 5 |
| `POST /api/auth/login` | anyone | 200, sets the `sid` cookie | F-01 |
| `POST /api/auth/logout` | logged in | 204, clears the cookie | F-01 |
| `GET /api/auth/me` | logged in | 200 | F-01 |
| `GET /api/templates` | Manager (all templates), Participant (active only) | 200 | F-03, F-06 |
| `POST /api/templates` | Manager | 201 | F-03 |
| `PATCH /api/templates/:id` | Manager, while no goal uses the template | 200 | F-04 |
| `GET /api/goals` | Participant (own goals, with progress) | 200 | F-07, F-09 |
| `POST /api/goals` | Participant | 201 | F-07 |
| `POST /api/goals/:id/entries` | Participant (own goal) | 201 | F-08 |
| `GET /api/goals/:id/entries` | Participant (own goal) | 200 | F-08 |

Conventions that every contract shares (SDS 2.2, 4.3; ADR 0025):

- Errors use the body `{ "error": { "code": "...", "message": "..." } }`. Unknown body fields are stripped, not refused (decided on PR #29, OP-07.7). Decimal values are JSON numbers with 2 decimal places.
- Checks run in this order: Origin (403), session (401), role (403), ownership (404), validation (400), then the rules. When a request breaks several rules the first one in the contract's table is returned.
- A Participant's request for another Participant's goal and a request for an unknown goal id give the same 404 (SDS S-7).

| Code | Status | Meaning | Defined in |
|---|---|---|---|
| `ORIGIN_NOT_ALLOWED` | 403 | The `Origin` host differs from the `Host` header on a state-changing request | F-01 |
| `UNAUTHENTICATED` | 401 | No valid session | F-01 |
| `INVALID_CREDENTIALS` | 401 | Unknown username or wrong password (same answer) | F-01 |
| `FORBIDDEN` | 403 | Valid session, role not allowed | F-02 |
| `VALIDATION_ERROR` | 400 | A field is missing, malformed or out of range | F-01, F-03, F-04, F-07, F-08 |
| `NOT_FOUND` | 404 | Unknown `/api` path | F-02 |
| `MIN_NOT_BELOW_MAX` | 400 | Template minimum is not below the maximum | F-03, F-04 |
| `TEMPLATE_NAME_EXISTS` | 409 | Another template has the name | F-03, F-04 |
| `TEMPLATE_NOT_FOUND` | 404 | No template with the id | F-04 |
| `TEMPLATE_IN_USE` | 409 | A goal uses the template, so it cannot be edited | F-04 |
| `TARGET_ABOVE_TEMPLATE_MAX` | 400 | Daily target above the template maximum | F-07 |
| `ACTIVE_GOAL_EXISTS` | 409 | A goal on this template is not Ended | F-07 |
| `GOAL_NOT_FOUND` | 404 | No such goal, or it belongs to another Participant | F-08, F-10 |
| `ENTRY_DATE_IN_FUTURE` | 400 | Entry date after today (Asia/Bangkok) | F-08 |
| `ENTRY_DATE_OUTSIDE_GOAL` | 400 | Entry date before the goal's start or after its end | F-08 |
| `VALUE_OUT_OF_RANGE` | 400 | Value outside the template's minimum and maximum | F-08 |
| `ENTRY_ALREADY_EXISTS` | 409 | An entry already exists for this goal and day | F-08 |

### Data Contracts

All migrations are additive (SDS 3.6). The `Role` enum has `PARTICIPANT` and `MANAGER`. The four decimal columns use `Decimal(10, 2)`.

| Table | Created by | Key constraints |
|---|---|---|
| `User` | F-01 | unique `username`; `role`; `password_hash` is a bcrypt hash |
| `Session` | F-01 | random text id; `user_id` reference, on delete cascade; `expires_at` = `created_at` plus 8 hours |
| `Template` | F-03 | unique `name`; check `min_value < max_value`; `state` `ACTIVE` or `RETIRED`; `created_by` reference to `User` |
| `Goal` | F-07 | `participant_id` and `template_id` references; check `daily_target > 0`; check `end_date >= start_date`; the state is computed from the dates, not stored |
| `Entry` | F-08 | `goal_id` reference, on delete restrict; unique (`goal_id`, `entry_date`) |

`Goal` and `Entry` carry the ownership link: an Entry belongs to a Participant through its Goal. The seed creates `manager1`, `participant1` and `participant2` from environment variables, never from code (F-01). `docs/system-sds.md` section 3 has the full model.

### Per-Feature Contracts

One file per feature, listed in the index above. A change to a contract after its feature is being built is added to that file's revision history and to the table below.

## Software Test Specification

Every test of the nine contracts in one table (handout D1 §3.5: "Map all Sprint 1 AC to suitable verification"). Test IDs are the planned names in `docs/traceability.md`; the description is its planned-test name, and the type is the level given in the contract. The precondition, input, action and expected result of each test are in the contract's section 10.

#### F-01 Login, logout and session

| Test | AC | Description | Type |
|---|---|---|---|
| TC-01 | AC-01.1 | Valid login creates a session row and an HTTP-only cookie | API |
| TC-02 | AC-01.2 | Unknown username and wrong password: identical errors, real cost-10 bcrypt comparisons, no cookie or session | API |
| TC-03 | AC-01.4 | Logout deletes the session; the cookie no longer gives access | API |
| TC-04 | AC-01.5 | Current user returns public identity; real session middleware excludes hash and unrelated user fields | API |
| TC-05 | AC-01.6 | Protected path with no valid session returns 401 | API |
| TC-06 | AC-01.7 | Session older than 8 hours returns 401 | API |
| TC-62 | AC-01.3 | Login input validation: non-JSON, missing, empty or non-string credentials; no cookie or session. Shared API malformed/oversized JSON returns 400 after auth checks | API |
| TC-63 | AC-01.7 | Session expiry with the instant passed in: valid at login plus 7:59:59, expired at plus 8:00:00 | Unit |
| TC-64 | AC-01.9 | Origin check: login and logout with a foreign `Origin` refused with 403 and change nothing; matching-host and no-Origin login accepted, including HTTP upstream with `X-Forwarded-Proto: https` | API |
| TC-44 | AC-01.8 | Passwords in the user table are bcrypt hashes | API |
| TC-45 | AC-01.8 | Repository search finds no seed passwords | Script |
| TC-46 | AC-01.1 | Session cookie is HTTP-only, `SameSite=Lax`, `Path=/`, and `Secure` only in production | API and unit |
| TC-65 | AC-01.10 | Login screen: wrong password message, username kept; login opens the role's first page; logout shows the login screen | Browser |

#### F-02 Role layout and endpoint protection

| Test | AC | Description | Type |
|---|---|---|---|
| TC-07 | AC-02.1 | Menu items change with role; layout is the same | Browser |
| TC-08 | AC-02.2 | Independent Express route audit and role matrix grow with each implemented endpoint: exact public allowlist, missing registration detected, 401 without a session and 403 for the wrong role | API |
| TC-66 | AC-02.3, AC-02.4 | Check order and identity: anonymous gets 401 before 403; a Participant's invalid or unknown-id request to a test-only Manager route gets 403; a role in the body or a header changes nothing | API |
| TC-67 | AC-02.5 | No session shows the login screen; a 401 during use returns to the login screen | Browser |

#### F-03 Template creation and Manager list

| Test | AC | Description | Type |
|---|---|---|---|
| TC-09 | AC-03.1 | Manager creates a template | API |
| TC-10 | AC-03.2 | Minimum not below maximum is rejected | Unit and API |
| TC-68 | AC-03.3, AC-03.5 | Template input validation (name, unit, numbers, 2 decimal places) and anonymous create and list refused; nothing stored | API |
| TC-69 | AC-03.4 | Duplicate template name returns 409; a range error wins over a duplicate name; two creates at once store one | API |
| TC-11 | AC-03.6 | Manager table shows name, unit, range, state, with actions | Browser |
| TC-70 | AC-03.7 | New template form creates a template and shows the API message for a rejected range, keeping the typed values | Browser |

#### F-04 Template edit

| Test | AC | Description | Type |
|---|---|---|---|
| TC-12 | AC-04.1 | Edit of an unused template succeeds | API |
| TC-13 | AC-04.2, AC-04.5 | Edit of a used template refused | API |
| TC-71 | AC-04.4 | Template edit validation, unknown id 404 and anonymous 401; nothing changes | API |
| TC-72 | AC-04.3 | Template edit: merged range below, duplicate name 409, own name accepted | Unit and API |
| TC-73 | AC-04.6 | Template edit form: a valid change shows in the table; an edit of a used template shows the API message | Browser |
| TC-18 | AC-04.7 | F-04 (AC-04.7): Participant edit-template request returns 403, nothing changes | API |

#### F-06 Participant template view and write refusal

| Test | AC | Description | Type |
|---|---|---|---|
| TC-16 | AC-06.1, AC-06.2 | Participant sees active templates read-only | API and browser |
| TC-17 | AC-06.3 | Participant create-template request returns 403, nothing changes | API |

#### F-07 Goal creation

| Test | AC | Description | Type |
|---|---|---|---|
| TC-20 | AC-07.1, AC-07.2 | Participant creates a goal | API |
| TC-21 | AC-07.3 | Second active goal on the same template rejected | API |
| TC-22 | AC-07.5 | Goal state on start day, end day and the day after | Unit |
| TC-53 | AC-07.6, AC-07.8 | Goal input validation: missing field, bad date, end before start, target 0 or negative, target with more than 2 decimal places or above 99,999,999.99, Manager and anonymous refused; nothing stored | API |
| TC-54 | AC-07.6, AC-07.7 | Daily target equal to the template maximum accepted; above it rejected; a target above it with more than 2 decimal places gets `VALIDATION_ERROR` (validation wins); a target above it with no `startDate` also gets `VALIDATION_ERROR` | API and unit |
| TC-55 | AC-07.2, AC-07.4 | An ended goal does not block a new goal on the same template; another template or another Participant allowed; the owner is the session user | API |
| TC-60 | AC-07.9 | New goal form creates a goal and shows the API message for a rule failure | Browser |
| TC-74 | AC-07.10 | Goal creation locks the template row: while another transaction holds a `FOR UPDATE` lock on the template, `POST /api/goals` waits, then reads the template as committed | API and database |

#### F-08 Daily entry recording

| Test | AC | Description | Type |
|---|---|---|---|
| TC-23 | AC-08.1 | Valid entry accepted, unit shown | API and browser |
| TC-24 | AC-08.2 | Future-dated entry rejected | Unit and API |
| TC-25 | AC-08.3 | Entry before start or after end rejected | Unit and API |
| TC-26 | AC-08.4 | Entry on today and on boundary days accepted | Unit and API |
| TC-27 | AC-08.5, AC-08.12 | "Today" is the Bangkok date at 23:59:59 and 00:00:00 (process run with `TZ=UTC`), for the future-date check and the UI's default date | Unit |
| TC-28 | AC-08.6 | Value below, at and above each limit | Unit and API |
| TC-29 | AC-08.7 | Second entry for the same day returns 409 | API |
| TC-30 | AC-08.3, AC-08.11 | Ended goal: an entry dated after its end is rejected; an entry dated inside its period is accepted | Unit and API |
| TC-56 | AC-08.8, AC-08.9 | Entry input validation and access: missing or malformed date or value, value with more than 2 decimal places or outside `Decimal(10, 2)`; Manager, anonymous, another Participant's goal and unknown goal refused | API |
| TC-58 | AC-08.1 | A saved entry is returned after the app restarts | API and database |
| TC-61 | AC-08.10 | Entry form shows the API message for a rejected value and keeps the typed value | Browser |

#### F-09 Progress (days met)

| Test | AC | Description | Type |
|---|---|---|---|
| TC-31 | AC-09.1, AC-09.2, AC-09.3, AC-09.4, AC-09.5 | Days met counts for met, missed and empty days | Unit |
| TC-32 | AC-09.7 | Progress shown on the goals page | Browser |
| TC-59 | AC-09.6, AC-09.7, AC-09.8 | Journey: a Manager creates a template through the UI; a Participant creates a goal, reads "0 of 1", records a value, reads "1 of 1", restarts, reads again; Manager and anonymous refused | Browser and API |

#### F-10 Participant data privacy

| Test | AC | Description | Type |
|---|---|---|---|
| TC-33 | AC-10.1, AC-10.2, AC-10.6 | Participant B's read and write of Participant A's goals and entries refused | API |
| TC-34 | AC-10.3, AC-10.4 | Manager read and write of goals and entries refused | API |
| TC-35 | AC-10.7 | Participant sees only own goals, entries and progress | API and browser |
| TC-57 | AC-10.5 | Another Participant's goal and an unknown goal id give the same 404 status and body | API |

A script checked that every AC of every contract appears in at least one test row of its own contract, and that every test cited exists in `docs/traceability.md`. The system checks below add five more Sprint 1 tests.

### System checks

NFR-05 to NFR-09 apply to the whole Sprint 1 build, not to one feature. Their requirement text and sprints are in `docs/srs.md` section 5 and `docs/traceability.md`; the criteria below say what is observable in Sprint 1. The new AC IDs use the scheme `AC-SYS.<n>` (OP-S.1).

| AC | Requirement | Observable outcome in Sprint 1 | Test | Type |
|---|---|---|---|---|
| AC-SYS.1 | NFR-05 | On every Sprint 1 screen (login, template list and forms, the Participant's template list, the goals page with the new-goal form and the entry controls) there is no horizontal scroll and every control works at 375 px and at 1280 px wide | TC-47 | Browser |
| AC-SYS.2 | NFR-06 | Every Sprint 1 action can be done with the keyboard alone, the focus is visible, and a state (for example Active or Retired) is never shown by colour alone | TC-48 | Browser |
| AC-SYS.3 | NFR-07 | The README lists the exact commands to install, build, migrate, seed, start and test, and the environment variable names with fake example values. The timed run of 15 minutes or less from a clean clone is recorded in Lab 5 (OP-S.2) | TC-50 | Manual, timed |
| AC-SYS.4 | NFR-08 | Each of BR-01 to BR-07 has at least one unit test, and a coverage report shows at least 80% line coverage of the rule code (OP-S.3) | TC-51 | Coverage report |
| AC-SYS.5 | NFR-09 | One documented command per suite runs the unit, API and browser tests against a real PostgreSQL test database; the results are kept. Running them on every PR in CI starts in Lab 5 | TC-52 | Local run (CI from Lab 5) |

Test specification of the system checks:

| Test | AC | Precondition / input | Action | Expected result |
|---|---|---|---|---|
| TC-47 | AC-SYS.1 | Built app on the test database; a Manager and a Participant exist | Playwright opens each Sprint 1 screen at 375 px and at 1280 px and uses each control | `document.documentElement.scrollWidth` is not greater than `window.innerWidth`; every control is reachable and works |
| TC-48 | AC-SYS.2 | Same | Playwright drives each Sprint 1 action with Tab, Shift+Tab, Enter and Space only | Every action completes; the focused element shows an outline; no state is shown by colour alone |
| TC-50 | AC-SYS.3 | A clean clone and a machine with the listed tools | Follow only the README and write down each step and the time | The app starts and a seeded user logs in; steps and time are recorded (the 15-minute target is checked in Lab 5) |
| TC-51 | AC-SYS.4 | Unit tests of the rule code run with coverage on | Run the unit suite with the coverage option and read the report | Every rule BR-01 to BR-07 has a test; line coverage of the rule code is at least 80% |
| TC-52 | AC-SYS.5 | A real PostgreSQL test database, migrated | Run the server suite and the client suite with the documented commands | Both exit 0; the counts of passed, failed and skipped tests are saved with the commit |

## Contract Revision History

Collected from section 13 of each contract. The rule: a contract is changed by a commit on a branch with its own Issue, the change is added to the revision history of the file and to this table, and a change made after the feature is being built says so.

| Date | Contract | Change | Approved by |
|---|---|---|---|
| 2026-11-07 | F-01 | First draft (Issue #30) | pending |
| 2026-11-07 | F-01 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): TC-05 uses auth only; host-only Origin check and forwarded HTTPS case in TC-64; login timing proposal OP-01.12; record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-07 | F-02 | First draft (Issue #30) | pending |
| 2026-11-07 | F-02 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): test-only protected route and page for TC-66/67; TC-08 grows with implemented endpoints; record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-07 | F-03 | First draft (Issue #30) | pending |
| 2026-11-07 | F-03 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-08 | F-03 | Issue #36 implementation evidence recorded in `docs/template-implementation-evidence.md`. No decided point was reopened. | pending review |
| 2026-11-07 | F-04 | First draft (Issue #30) | pending |
| 2026-11-07 | F-04 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): own Participant edit refusal as AC-04.7 / TC-18; remove circular dependency; record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-07 | F-06 | First draft (Issue #30) | pending |
| 2026-11-07 | F-06 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): move AC-06.4 / TC-18 to F-04 as AC-04.7 / TC-18; record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-08 | F-06 | Issue #36 implementation evidence recorded in `docs/template-implementation-evidence.md`. No decided point was reopened. Edit refusal stays in F-04. | pending review |
| 2026-11-07 | F-07 | First draft (Issue #28) | pending |
| 2026-11-07 | F-07 | Review round 1 (PR #29): codes in TC-53, active B goal in TC-55, test dates relative to the Bangkok today, S-16 note and OP-07.6, unknown fields stripped (OP-07.7), decimal scale (OP-07.8), order of the goals list, decisions Q4, Q6, Q7 recorded | pending (partner re-check) |
| 2026-11-08 | F-07 | Revision for Issue #38 (before the code is built): template row lock in goal creation (AC-07.10, TC-74, OP-07.10, OP-07.11); `dailyTarget` with more than 2 decimal places or outside `Decimal(10, 2)` is `400 VALIDATION_ERROR` (sections 3, 4, 8, AC-07.6, TC-53, TC-54, OP-07.8); validation wins over `TARGET_ABOVE_TEMPLATE_MAX` ; review round 1: validation rows before rule rows with a combined case in TC-54, OP-07.11 allows both serial orders | pending (partner review of the Issue #38 PR) |
| 2026-11-08 | F-07 | Issue #40 implementation evidence: owner-confirmed existing API behaviors, Goal tests-first history, local validation and remaining human review recorded in section 14; requirements unchanged | phittayanan (owner-only implementation authorization); teammate implementation review pending |
| 2026-11-07 | F-08 | First draft (Issue #28) | pending |
| 2026-11-07 | F-08 | Review round 1 (PR #29): TC-28 gives each accepted value its own day; codes in TC-56; test dates relative to the Bangkok today; AC-08.5 and TC-27 reworded (TZ=UTC, goal period); AC-08.11 and AC-08.12 added; order of rule checks; date box named; decimal scale; decisions Q1, Q8, Q9 recorded | pending (partner re-check) |
| 2026-11-07 | F-08 | Wording fix in TC-27: a local-zone implementation fails the second check, not the first (partner's note on PR #29) | pending |
| 2026-11-08 | F-08 | Revision for Issue #38 (before the code is built): a `value` with more than 2 decimal places or outside `Decimal(10, 2)` is `400 VALIDATION_ERROR`, and validation wins over `VALUE_OUT_OF_RANGE` (sections 3, 4, 8, AC-08.8, TC-56, OP-08.5) | pending (partner review of the Issue #38 PR) |
| 2026-11-09 | F-08 | Issue #42 implementation evidence recorded in section 14 and `docs/entry-implementation-evidence.md`; requirements unchanged | projectnewy (author); teammate review pending |
| 2026-11-07 | F-09 | First draft (Issue #28) | pending |
| 2026-11-07 | F-09 | Review round 1 (PR #29): fixed-clock citation dropped and test dates made relative to the Bangkok today (TC-32, TC-59); TC-59 has the Manager create the template through the UI and reads the page before and after the entry; OP-09.1 decided (Q5) | pending (partner re-check) |
| 2026-11-10 | F-09 | Issue #44 implementation evidence recorded in section 14 and `docs/progress-privacy-implementation-evidence.md`; requirements unchanged | projectnewy (author); teammate review pending |
| 2026-11-07 | F-10 | First draft (Issue #28) | pending |
| 2026-11-07 | F-10 | Review round 1 (PR #29): error codes added to every expected result, "ignored" changed to "stripped" with OP-10.3, menu wording corrected | pending (partner re-check) |
| 2026-11-10 | F-10 | Issue #44 implementation evidence recorded in section 14 and `docs/progress-privacy-implementation-evidence.md`; requirements unchanged | projectnewy (author); teammate review pending |

"Pending" in the last column is what the contract files say: they were not edited again after their PR was approved. The approval of each contract is the merged and approved PR: #31 for F-01 to F-06 and #29 for F-07 to F-10. The files get their approvers when the next revision touches them (OP-S.4).

## Definition of Done

The Product Definition of Done comes from handout D1 §3.5 and GWS §8.2. Each line says what shows it is true. Completion is shown by evidence from commands that were run, not by a statement of an AI agent.

| # | Item | Evidence |
|---|---|---|
| 1 | The required behaviour is implemented on `main` | Each Sprint 1 feature is merged; the journey in `docs/sprints/plan.md` ("Completion outcome") works through the UI, the API and the database; any feature that is cut is in "Approved Changes" |
| 2 | The planned verification was executed | Every test in the table above, and the five system checks, was run on the released commit; Part F has the command, the counts of passed, failed and skipped tests, and the commit |
| 3 | The tests are meaningful and pass | No required test is disabled or weakened to pass; failed and skipped tests are reported; the rule tests were seen failing before the code and passing after (red commit before the feature commit) |
| 4 | Review and integration are complete | Each agreed build group (Auth, Template, Goal, Entry, and Progress with privacy) has its own Issue, branch and teammate-reviewed PR into `staging`; Auth is Issue #32 and PR #34. Every included feature and acceptance criterion is traceable to its tests and implementation. The release PR from `staging` into `main` is reviewed, `main` is tagged `v1.0`, and the board shows Done |
| 5 | Setup and documents are current | README setup, `.env.example` (fake values only), the contracts, `docs/traceability.md` (AC, Test ID, Issue and PR) and this overview match the released code; seeded passwords are shared privately, never in Git |
| 6 | Incomplete work is disclosed | Part F lists the known limits: no failed-login limiting (OP-01.11), no way to fix a wrong same-day entry (SRS A-11), no Retire (Sprint 2), the timed clean-clone run, CI, Docker and GCP (Lab 5), and any test that failed or was skipped |
| 7 | The AI use is declared | `docs/ai-use.md` is current and each PR says what the human checked or changed |

Each contract also has its own definition of done (its section 11); this table applies to the whole Sprint 1 release.

## Implementation status

As of 2026-11-08. This table is a snapshot; the board and `docs/traceability.md` are the live record.

| Group | Features | Build Issue | Status |
|---|---|---|---|
| Auth | F-01, F-02 | #32 | Merged (PR #34). Evidence: `docs/auth-implementation-evidence.md` |
| Template | F-03, F-04, F-06 | #36 (F-03, F-06); F-04 not opened | F-03 and F-06 merged (PR #37). Evidence: `docs/template-implementation-evidence.md`. F-04 not started (needs F-07) |
| Goal | F-07 | #40 | Merged (PR #41). Evidence: `docs/goal-implementation-evidence.md` |
| Entry | F-08 | #42 | Merged (PR #43). Evidence: `docs/entry-implementation-evidence.md` |
| Progress and privacy | F-09, F-10 | #44 | Implemented and tested, PR in review. Evidence: `docs/progress-privacy-implementation-evidence.md` |

The checklist item in Issue #8 ("each Sprint 1 feature gets its own Feature Issue after this") are the follow-on step: the build Issues still marked "not opened" above are opened one by one, each after the contract it builds is in its final form.

## Open points

| ID | Point | Status |
|---|---|---|
| OP-S.1 | The scheme for the system-check criteria, `AC-SYS.<n>`, and their wording (the requirement text is in the SRS, the Sprint 1 reading is new) | Open (proposal): as in the table above |
| OP-S.2 | How NFR-07 is verified in Sprint 1. The traceability matrix says "documented; timed in Lab 5" | Open (proposal): the README is followed once on a clean clone and the steps and time are recorded; the 15-minute target binds in Lab 5 |
| OP-S.3 | Which files count as "rule code" for NFR-08 and which tool measures coverage | Open (proposal): the service files that hold BR-01 to BR-07, measured with the Node test runner's coverage option |
| OP-S.4 | The contracts F-07 and F-08 do not yet say three things that F-03 and F-04 decided: goal creation locks the template row (OP-04.4); a number with more than 2 decimal places is refused with `400 VALIDATION_ERROR` for `dailyTarget` and `value` (OP-03.3); precision `Decimal(10, 2)` (OP-03.4) | Resolved by Issue #38: F-07 (AC-07.10, TC-74, OP-07.10, OP-07.11) and F-08 (AC-08.8, OP-08.5) now say all three, before those features are built |
| OP-S.5 | The Product Definition of Done above restates the handout. The thresholds (80% coverage, 15 minutes) come from the SRS | Open (proposal): confirm that both students accept this wording |

## Revision history of this overview

| Date | Change | Approved by |
|---|---|---|
| 2026-11-08 | First draft (Issue #8) | pending |
| 2026-11-08 | Review round 1 (PR #35): the contract index no longer has carriage returns in its titles, so it renders as nine rows of seven cells (checked in GitHub's rendered view); Product Definition of Done item 4 follows the five agreed build groups; TC-47 uses `document.documentElement.scrollWidth` and `window.innerWidth` | pending (partner re-check) |
