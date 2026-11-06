# Traceability

## BR -> FR

| BR | FR |
|---|---|
| BR-01 | FR-11 |
| BR-02 | FR-11 |
| BR-03 | FR-05, FR-11 |
| BR-04 | FR-11 |
| BR-05 | FR-10 |
| BR-06 | FR-10, FR-11 |
| BR-07 | FR-12 |
| BR-08 | FR-06, FR-07, FR-08 |
| BR-09 | FR-09, FR-23 |
| BR-10 | FR-13, FR-14 |
| BR-11 | FR-17 |
| BR-12 | FR-18 |
| BR-13 | FR-20 |
| BR-14 | FR-21 |
| BR-15 | FR-16 |

## FR -> Feature -> Acceptance Criteria -> Test

Test IDs (`TC-nn`) are provisional planned-test names; the list is below. No test code exists yet. AC are set in each Sprint 1 feature contract (Part E); later-sprint rows need none now. Issue #9 is the Sprint 1 build Issue; no PR exists yet. The AC for F-07 to F-10 are written in `docs/sprints/sprint-1/` (contract Issue #28), and the AC for F-01 to F-04 and F-06 in the same folder (contract Issue #30). TC-53 to TC-61 are new planned tests added by the first four contracts, and TC-62 to TC-73 by the other five.

| BR | FR | Feature | AC | Test ID | Sprint | Issue / PR |
|---|---|---|---|---|---|---|
| none | FR-01 | F-01 | AC-01.1 to AC-01.3, AC-01.9, AC-01.10 | TC-01, TC-02, TC-46, TC-62, TC-64, TC-65 | 1 | #30, #9 |
| none | FR-02 | F-01 | AC-01.4 | TC-03 | 1 | #30, #9 |
| none | FR-03 | F-01 | AC-01.5, AC-01.6 | TC-04, TC-05 | 1 | #30, #9 |
| none | FR-04 | F-01 | AC-01.7 | TC-06, TC-63 | 1 | #30, #9 |
| BR-03 | FR-05 | F-03 | AC-03.1 to AC-03.5, AC-03.7 | TC-09, TC-10, TC-68, TC-69, TC-70 | 1 | #30, #9 |
| BR-08 | FR-06 | F-03 | AC-03.6 | TC-11 | 1 | #30, #9 |
| BR-08 | FR-07 | F-04 | AC-04.1 to AC-04.6 | TC-12, TC-13, TC-71, TC-72, TC-73 | 1 | #30, #9 |
| BR-08 | FR-08 | F-05 | later | TC-14, TC-15 | 2 | none yet |
| BR-09 | FR-09 | F-06 | AC-06.1, AC-06.2 | TC-16 | 1 | #30, #9 |
| BR-05, BR-06 | FR-10 | F-07 | AC-07.1 to AC-07.9 | TC-20, TC-21, TC-22, TC-53, TC-54, TC-55, TC-60 | 1 | #28, #9 |
| BR-01, BR-02, BR-03, BR-04, BR-06 | FR-11 | F-08 | AC-08.1 to AC-08.12 | TC-23 to TC-30, TC-56, TC-58, TC-61 | 1 | #28, #9 |
| BR-07 | FR-12 | F-09 | AC-09.1 to AC-09.8 | TC-31, TC-32, TC-59 | 1 | #28, #9 |
| BR-10 | FR-13 | F-10 | AC-10.1, AC-10.2, AC-10.4 to AC-10.7 | TC-33, TC-34, TC-35, TC-57 | 1 | #28, #9 |
| BR-10 | FR-14 | F-10 | AC-10.3 | TC-34 | 1 | #28, #9 |
| none | FR-15 | F-11 | later | TC-36 | 2 | none yet |
| BR-15 | FR-16 | F-12 | later | TC-37 | 2 | none yet |
| BR-11 | FR-17 | F-13 | later | TC-38 | 2 | none yet |
| BR-12 | FR-18 | F-14 | later | TC-39 | 2 | none yet |
| none | FR-19 | F-15 | later | TC-40 | 2 | none yet |
| BR-13 | FR-20 | F-16 | later | TC-41, TC-42 | 3 | none yet |
| BR-14 | FR-21 | F-17 | later | TC-43 | 3 | none yet |
| none | FR-22 | F-02 | AC-02.1 to AC-02.5 | TC-07, TC-08, TC-66, TC-67 | 1 | #30, #9 |
| BR-09 | FR-23 | F-06 | AC-06.3, AC-06.4 | TC-17, TC-18 (create, edit); TC-19 (retire, Sprint 2) | 1 | #30, #9 |

## NFR -> Feature -> Verification -> Test

| NFR | Feature or responsibility | Verification | Test ID | Verified in Sprint |
|---|---|---|---|---|
| NFR-01 | F-01 | User table read; repository search (AC-01.8) | TC-44, TC-45 | 1 |
| NFR-02 | F-02 | API test per endpoint (role matrix, AC-02.2, AC-02.3) | TC-08, TC-66, TC-34 (goal and entry endpoints, AC-10.4) | 1 (rechecked later) |
| NFR-03 | F-10 | API tests, two Participants and one Manager | TC-33, TC-34, TC-57 | 1 (rechecked in 2 and 3) |
| NFR-04 | F-01 | API and unit tests: cookie flag, aged session, logged-out session (AC-01.1, AC-01.4, AC-01.7) | TC-06, TC-46, TC-03, TC-63 | 1 |
| NFR-05 | Sprint 1 screens of F-03, F-04, F-06 to F-09; later screens | Playwright at 375 px and 1280 px | TC-47 | 1; 2 and 3 for later screens |
| NFR-06 | Same screens; F-12 markup | Playwright keyboard run; markup review | TC-48, TC-49 | 1; 2 and 3 for later screens |
| NFR-07 | System: setup commands and docs | Timed clean-clone run | TC-50 | 1 documented; timed in Lab 5 |
| NFR-08 | F-07, F-08, F-09 (rule code) | Coverage report | TC-51 | 1; 3 |
| NFR-09 | System: CI | CI run on a PR | TC-52 | 1 locally; CI from Lab 5 |

## Planned tests

Names only, from the "Tested by" and "Verification" columns of the SRS.

| Test ID | Planned test | Level |
|---|---|---|
| TC-01 | Valid login creates a session row and an HTTP-only cookie | API |
| TC-02 | Invalid login refused, no session | API |
| TC-03 | Logout deletes the session; the cookie no longer gives access | API |
| TC-04 | Current user returns name and role | API |
| TC-05 | Protected path with no valid session returns 401 | API |
| TC-06 | Session older than 8 hours returns 401 | API |
| TC-07 | Menu items change with role; layout is the same | Browser |
| TC-08 | Role matrix: each protected endpoint returns 401 without a session and 403 for the wrong role | API |
| TC-09 | Manager creates a template | API |
| TC-10 | Minimum not below maximum is rejected | Unit and API |
| TC-11 | Manager table shows name, unit, range, state, with actions | Browser |
| TC-12 | Edit of an unused template succeeds | API |
| TC-13 | Edit of a used template refused | API |
| TC-14 | Retired template leaves the new-goal list | API |
| TC-15 | New goal on a retired template refused; existing goal still takes entries | API |
| TC-16 | Participant sees active templates read-only | API and browser |
| TC-17 | Participant create-template request returns 403, nothing changes | API |
| TC-18 | Participant edit-template request returns 403, nothing changes | API |
| TC-19 | Participant retire-template request returns 403, nothing changes | API |
| TC-20 | Participant creates a goal | API |
| TC-21 | Second active goal on the same template rejected | API |
| TC-22 | Goal state on start day, end day and the day after | Unit |
| TC-23 | Valid entry accepted, unit shown | API and browser |
| TC-24 | Future-dated entry rejected | Unit and API |
| TC-25 | Entry before start or after end rejected | Unit and API |
| TC-26 | Entry on today and on boundary days accepted | Unit and API |
| TC-27 | "Today" is the Bangkok date at 23:59:59 and 00:00:00 (process run with `TZ=UTC`), for the future-date check and the UI's default date | Unit |
| TC-28 | Value below, at and above each limit | Unit and API |
| TC-29 | Second entry for the same day returns 409 | API |
| TC-30 | Ended goal: an entry dated after its end is rejected; an entry dated inside its period is accepted | Unit and API |
| TC-31 | Days met counts for met, missed and empty days | Unit |
| TC-32 | Progress shown on the goals page | Browser |
| TC-33 | Participant B's read and write of Participant A's goals and entries refused | API |
| TC-34 | Manager read and write of goals and entries refused | API |
| TC-35 | Participant sees only own goals, entries and progress | API and browser |
| TC-36 | Calendar is first after login; side panel shows chosen day | Browser |
| TC-37 | Colour per combination of goals met | Unit |
| TC-38 | Edit and delete an entry, then recompute | API and unit |
| TC-39 | Past days judged against the old target | Unit |
| TC-40 | Calendar and List switch; list newest first | Browser |
| TC-41 | Streak: runs, a miss, today without an entry | Unit |
| TC-42 | Best streak on the goal's detail page | Browser |
| TC-43 | Reminder stored and read; no outbound call | API |
| TC-44 | Passwords in the user table are bcrypt hashes | API |
| TC-45 | Repository search finds no seed passwords | Script |
| TC-46 | Session cookie is HTTP-only, `SameSite=Lax`, `Path=/`, and `Secure` only in production | API and unit |
| TC-47 | No horizontal scroll, controls work at 375 px and 1280 px | Browser |
| TC-48 | All actions reachable by keyboard alone | Browser |
| TC-49 | Calendar day state has a non-colour signal | Markup review |
| TC-50 | Clean clone builds, migrates, seeds and starts in 15 minutes or less | Manual, timed |
| TC-51 | Rule code has at least 80% line coverage | CI report |
| TC-52 | Tests run in CI on every PR against a real test database | CI |
| TC-53 | Goal input validation: missing field, bad date, end before start, target 0 or negative, Manager and anonymous refused; nothing stored | API |
| TC-54 | Daily target equal to the template maximum accepted; above it rejected | API and unit |
| TC-55 | An ended goal does not block a new goal on the same template; another template or another Participant allowed; the owner is the session user | API |
| TC-56 | Entry input validation and access: missing or malformed date or value; Manager, anonymous, another Participant's goal and unknown goal refused | API |
| TC-57 | Another Participant's goal and an unknown goal id give the same 404 status and body | API |
| TC-58 | A saved entry is returned after the app restarts | API and database |
| TC-59 | Journey: a Manager creates a template through the UI; a Participant creates a goal, reads "0 of 1", records a value, reads "1 of 1", restarts, reads again; Manager and anonymous refused | Browser and API |
| TC-60 | New goal form creates a goal and shows the API message for a rule failure | Browser |
| TC-61 | Entry form shows the API message for a rejected value and keeps the typed value | Browser |
| TC-62 | Login input validation: non-JSON body, missing, empty or non-string username or password; no cookie, no session | API |
| TC-63 | Session expiry with the instant passed in: valid at login plus 7:59:59, expired at plus 8:00:00 | Unit |
| TC-64 | Origin check: login and logout with a foreign `Origin` refused with 403 and change nothing; same-origin and no-Origin login accepted | API |
| TC-65 | Login screen: wrong password message, username kept; login opens the role's first page; logout shows the login screen | Browser |
| TC-66 | Check order and identity: anonymous gets 401 before 403; a Participant's invalid or unknown-id template write gets 403; a role in the body or a header changes nothing | API |
| TC-67 | No session shows the login screen; a 401 during use returns to the login screen | Browser |
| TC-68 | Template input validation (name, unit, numbers, 2 decimal places) and anonymous create and list refused; nothing stored | API |
| TC-69 | Duplicate template name returns 409; a range error wins over a duplicate name; two creates at once store one | API |
| TC-70 | New template form creates a template and shows the API message for a rejected range, keeping the typed values | Browser |
| TC-71 | Template edit validation, unknown id 404 and anonymous 401; nothing changes | API |
| TC-72 | Template edit: merged range below, duplicate name 409, own name accepted | Unit and API |
| TC-73 | Template edit form: a valid change shows in the table; an edit of a used template shows the API message | Browser |

## Coverage Gaps

- Every BR-01 to BR-15, FR-01 to FR-23 and NFR-01 to NFR-09 maps to a feature (or a named system responsibility for NFR-07 and NFR-09) and to at least one planned test. No requirement is uncovered.
- AC exist for every Sprint 1 feature: F-07 to F-10 (Issue #28) and F-01 to F-04, F-06 (draft contracts, Issue #30). Sprint 2 and 3 rows have none by design.
- Test IDs are provisional and no test is written or run, so no result is shown. Nothing is marked done.
- FR-23 retire refusal (TC-19) cannot run until FR-08 exists in Sprint 2.
- The calendar rows (FR-15, FR-16, FR-19) and NFR-06's non-colour check (TC-49) have only a Sprint 2 test name.
- Open points that change a row if answered differently: SRS A-1 (FR-12), A-2 (FR-06 to FR-08), A-3 (FR-15, FR-16), A-11 (FR-11); and O-1 to O-8 in `docs/features.md`.

## Approved Changes

| Date | Change | Affected IDs | Approved by |
|---|---|---|---|
| 2026-11-07 | No new Sprint 3 summary feature. Progress (F-09) and the calendar colours (F-12) cover the "summaries" named in ADR 0021 and SRS 1.2. Sprint plan open point O-1 | F-09, F-12, FR-12, FR-16 | phittayanan and projectnewy (PR #26 review) |
| 2026-11-07 | FR-08 (Retire template, with the retire part of BR-08) moves from Sprint 1 to Sprint 2; Retire is hidden in Sprint 1. Sprint 1 is the handout slice | FR-08, FR-06, BR-08 | phittayanan and projectnewy (PR #21 review, PR #22 open point O-4) |
| 2026-11-07 | FR-15 (calendar and side panel) and FR-16 with BR-15 move from Sprint 1 to Sprint 2 | FR-15, FR-16, BR-15 | phittayanan and projectnewy (PR #21 review) |
| 2026-11-07 | FR-23 added: a Participant's request to create, edit or retire a template is refused with 403 and changes nothing | FR-23, BR-09 | phittayanan and projectnewy (PR #21 review) |
| 2026-11-07 | No streak in the Sprint 2 side panel (number box only); the streak comes in Sprint 3 (FR-20, ADR 0021). A-4 decided: a goal's daily target is above 0 and not above the template's maximum | FR-15, F-11, FR-20, F-16, A-4 | phittayanan and projectnewy (PR #23 review, PR #25) |
