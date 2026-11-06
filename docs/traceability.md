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

Test IDs (`TC-nn`) are provisional planned-test names; the list is below. No test code exists yet. AC are set in each Sprint 1 feature contract (Part E); later-sprint rows need none now. Issue #9 is the Sprint 1 build Issue; no PR exists yet.

| BR | FR | Feature | AC | Test ID | Sprint | Issue / PR |
|---|---|---|---|---|---|---|
| none | FR-01 | F-01 | Part E | TC-01, TC-02 | 1 | #9 |
| none | FR-02 | F-01 | Part E | TC-03 | 1 | #9 |
| none | FR-03 | F-01 | Part E | TC-04, TC-05 | 1 | #9 |
| none | FR-04 | F-01 | Part E | TC-06 | 1 | #9 |
| BR-03 | FR-05 | F-03 | Part E | TC-09, TC-10 | 1 | #9 |
| BR-08 | FR-06 | F-03 | Part E | TC-11 | 1 | #9 |
| BR-08 | FR-07 | F-04 | Part E | TC-12, TC-13 | 1 | #9 |
| BR-08 | FR-08 | F-05 | later | TC-14, TC-15 | 2 | none yet |
| BR-09 | FR-09 | F-06 | Part E | TC-16 | 1 | #9 |
| BR-05, BR-06 | FR-10 | F-07 | Part E | TC-20, TC-21, TC-22 | 1 | #9 |
| BR-01, BR-02, BR-03, BR-04, BR-06 | FR-11 | F-08 | Part E | TC-23 to TC-30 | 1 | #9 |
| BR-07 | FR-12 | F-09 | Part E | TC-31, TC-32 | 1 | #9 |
| BR-10 | FR-13 | F-10 | Part E | TC-33, TC-35 | 1 | #9 |
| BR-10 | FR-14 | F-10 | Part E | TC-34 | 1 | #9 |
| none | FR-15 | F-11 | later | TC-36 | 2 | none yet |
| BR-15 | FR-16 | F-12 | later | TC-37 | 2 | none yet |
| BR-11 | FR-17 | F-13 | later | TC-38 | 2 | none yet |
| BR-12 | FR-18 | F-14 | later | TC-39 | 2 | none yet |
| none | FR-19 | F-15 | later | TC-40 | 2 | none yet |
| BR-13 | FR-20 | F-16 | later | TC-41, TC-42 | 3 | none yet |
| BR-14 | FR-21 | F-17 | later | TC-43 | 3 | none yet |
| none | FR-22 | F-02 | Part E | TC-07, TC-08 | 1 | #9 |
| BR-09 | FR-23 | F-06 | Part E | TC-17, TC-18 (create, edit); TC-19 (retire, Sprint 2) | 1 | #9 |

## NFR -> Feature -> Verification -> Test

| NFR | Feature or responsibility | Verification | Test ID | Verified in Sprint |
|---|---|---|---|---|
| NFR-01 | F-01 | User table read; repository search | TC-44, TC-45 | 1 |
| NFR-02 | F-02 | API test per endpoint (role matrix) | TC-08 | 1 (rechecked later) |
| NFR-03 | F-10 | API tests, two Participants and one Manager | TC-33, TC-34 | 1 (rechecked in 2 and 3) |
| NFR-04 | F-01 | API tests: cookie flag, aged session, logged-out session | TC-06, TC-46, TC-03 | 1 |
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
| TC-27 | Entries either side of midnight Bangkok | Unit |
| TC-28 | Value below, at and above each limit | Unit and API |
| TC-29 | Second entry for the same day returns 409 | API |
| TC-30 | Entry to an ended goal rejected | Unit and API |
| TC-31 | Days met counts for met, missed and empty days | Unit |
| TC-32 | Progress shown on the goals page | Browser |
| TC-33 | Participant B's read and write of Participant A's goals and entries refused | API |
| TC-34 | Manager read and write of goals and entries refused | API |
| TC-35 | Participant sees only own goals, entries and progress | API |
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
| TC-46 | Session cookie is HTTP-only | API |
| TC-47 | No horizontal scroll, controls work at 375 px and 1280 px | Browser |
| TC-48 | All actions reachable by keyboard alone | Browser |
| TC-49 | Calendar day state has a non-colour signal | Markup review |
| TC-50 | Clean clone builds, migrates, seeds and starts in 15 minutes or less | Manual, timed |
| TC-51 | Rule code has at least 80% line coverage | CI report |
| TC-52 | Tests run in CI on every PR against a real test database | CI |

## Coverage Gaps

- Every BR-01 to BR-15, FR-01 to FR-23 and NFR-01 to NFR-09 maps to a feature (or a named system responsibility for NFR-07 and NFR-09) and to at least one planned test. No requirement is uncovered.
- No AC exist yet for Sprint 1 rows (Part E). Sprint 2 and 3 rows have none by design.
- Test IDs are provisional and no test is written or run, so no result is shown. Nothing is marked done.
- FR-23 retire refusal (TC-19) cannot run until FR-08 exists in Sprint 2.
- The calendar rows (FR-15, FR-16, FR-19) and NFR-06's non-colour check (TC-49) have only a Sprint 2 test name.
- Open points that change a row if answered differently: SRS A-1 (FR-12), A-2 (FR-06 to FR-08), A-3 (FR-15, FR-16), A-11 (FR-11); and O-1 to O-8 in `docs/features.md`.

## Approved Changes

| Date | Change | Affected IDs | Approved by |
|---|---|---|---|
| 2026-11-07 | No new Sprint 3 summary feature. Progress (F-09) and the calendar colours (F-12) cover the "summaries" named in ADR 0021 and SRS 1.2. Sprint plan open point O-1 | F-09, F-12, FR-12, FR-16 | phittayanan (answer to the PR #26 review) |
