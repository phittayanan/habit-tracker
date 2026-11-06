# Features

Part B of Deliverable 1 (Issue #5). Each feature groups SRS requirements (`docs/srs.md`); its sprint comes from the SRS. Nothing here adds a requirement or moves scope. Requirement-to-test mapping is in `docs/traceability.md`. Where the SRS and ADRs do not settle a point, it is listed under "Open points" for the students.

## Feature List

| ID | Feature | Description | Requirements | Depends on | Sprint |
|---|---|---|---|---|---|
| F-01 | Login, logout and session | A seeded user logs in and out. The session is a database row with an HTTP-only cookie, ends after 8 hours, and the user can retrieve who they are. | FR-01, FR-02, FR-03, FR-04, NFR-01, NFR-04 | none | 1 |
| F-02 | Role layout and endpoint protection | One layout for everyone; menu items follow the role. Every protected endpoint is checked on the backend: 401 without a session, 403 for the wrong role. | FR-22, NFR-02 | F-01 | 1 |
| F-03 | Template creation and Manager list | A Manager creates a template (name, unit, minimum, maximum) and sees the template table with New and Edit actions (no Retire control in Sprint 1). | FR-05, FR-06, BR-03 (minimum below maximum) | F-01, F-02 | 1 |
| F-04 | Template edit | A Manager edits a template only while no goal uses it. | FR-07, BR-08 (edit part) | F-03, F-07 | 1 |
| F-05 | Template retire | A Manager retires a template; the Retire control appears in the table with this feature. It leaves the new-goal list; existing goals continue. | FR-08, BR-08 (retire part) | F-03, F-07 | 2 |
| F-06 | Participant template view and write refusal | A Participant sees active templates read-only. A Participant's create, edit or retire request is refused with 403. | FR-09, FR-23, BR-09 | F-01, F-02, F-03 | 1 |
| F-07 | Goal creation | A Participant creates a goal on a template with a daily target and start and end dates. One active goal per template; the state (Active or Ended) is derived from dates. | FR-10, BR-05, BR-06 | F-03, F-06 | 1 |
| F-08 | Daily entry recording | A Participant records a day's value. Date, value-range and one-entry-per-day rules are enforced on the backend with clear messages. | FR-11, BR-01, BR-02, BR-03, BR-04, BR-06 | F-07 | 1 |
| F-09 | Progress (days met) | A Participant sees days met out of days so far for a goal. | FR-12, BR-07 | F-08 | 1 |
| F-10 | Participant data privacy | A Participant sees only their own goals, entries and progress. Another Participant and any Manager are refused. | FR-13, FR-14, BR-10, NFR-03 | F-01, F-07, F-08 | 1 |
| F-11 | Month calendar and side panel | After login a Participant sees this month's calendar, and a side panel for the chosen day with each goal's number box (no streak until Sprint 3, F-16; decided on PR #23). | FR-15 | F-08, F-09 | 2 |
| F-12 | Calendar day colours | Each calendar day is green, yellow, red or grey. | FR-16, BR-15 | F-11 | 2 |
| F-13 | Entry edit and delete | A Participant edits or deletes an entry on any day inside the goal period; progress is recomputed. | FR-17, BR-11 | F-08, F-09 | 2 |
| F-14 | Goal change | A Participant changes a goal's target from today on; earlier days keep the old target. | FR-18, BR-12 | F-07, F-09 | 2 |
| F-15 | Calendar and List history | A Participant switches between Calendar and List; the list shows the month's records newest first. | FR-19 | F-11 | 2 |
| F-16 | Streaks | The current streak shows next to each goal; the best streak shows on the goal's detail page. | FR-20, BR-13 | F-08, F-13 | 3 |
| F-17 | Stored reminder | A Participant stores a reminder time and weekdays per goal. The app shows them and sends nothing. | FR-21, BR-14 | F-07 | 3 |

Every FR-01 to FR-23 appears in exactly one feature. Every BR-01 to BR-15 appears in at least one; BR-03, BR-06 and BR-08 are shared by the rows shown.

## Cross-cutting requirements

These NFRs apply to many features or to the system as a whole. Each links to the features it constrains or to a named system responsibility, with the sprint that sets it up and the sprint that verifies it.

| NFR | Linked to | Set up in | Verified in |
|---|---|---|---|
| NFR-01 Password hashing | F-01 | 1 | 1 |
| NFR-02 401 and 403 coverage | F-02 (all features with endpoints) | 1 | 1; rechecked on each later endpoint |
| NFR-03 Cross-account privacy | F-10 (all goal and entry endpoints) | 1 | 1; rechecked in 2 and 3 |
| NFR-04 Session cookie and expiry | F-01 | 1 | 1 |
| NFR-05 Phone and desktop width | Sprint 1 screens of F-03, F-04, F-06, F-07, F-08, F-09; later screens of F-11 to F-17 | 1 | 1 for Sprint 1 screens; 2 and 3 for later screens |
| NFR-06 Keyboard and non-colour signal | Same screens as NFR-05; calendar markup of F-12 | 1 | 1 for Sprint 1 screens; 2 and 3 for later screens |
| NFR-07 Clean-clone setup | System responsibility: setup commands and documentation | 1 | 1 (documented); timed run in Lab 5 |
| NFR-08 Rule unit tests and coverage | F-07, F-08, F-09 (rule code for BR-01 to BR-07) | 1 | 1; hardening in 3 |
| NFR-09 Tests in CI | System responsibility: CI | 1 (local) | CI from Lab 5 |

## Acceptance Criteria

Acceptance criteria (AC) are not written here. Part B asks for no AC on later-sprint features, and the Sprint 1 AC belong to each feature's contract (Part E, with stable AC IDs and planned test IDs). Until those contracts exist, the AC column in `docs/traceability.md` points to Part E.

## Open points for the students

Nothing below is decided. Each needs an answer from the students (or the TA).

- **O-1 Feature grouping.** The SRS fixes requirements and sprints, not features. The grouping in F-01 to F-17 is a proposal to confirm or change; for example whether F-03 and F-04 are one feature, and whether F-11 and F-12 are one.
- **O-2 Feature ID scheme.** `F-nn` is used here. Confirm, or name another scheme (it would also fix the branch and Issue naming per feature).
- **O-3 Test ID scheme and AC.** Test IDs `TC-nn` in `docs/traceability.md` are provisional names only. The Part E test specification should set final IDs and the AC they cover.
- **O-4 Retire control in Sprint 1. Resolved (owner, 2026-11-07): hide.** In Sprint 1 the Manager template table shows no Retire control; it appears with FR-08 in Sprint 2. FR-06 in `docs/srs.md` was corrected to match (one wording change).
- **O-5 SRS: FR-23 and retire.** FR-23 is Sprint 1 and covers create, edit and retire, but retire does not exist until Sprint 2. In Sprint 1 only create and edit refusals can be tested; the retire refusal is tested in Sprint 2 (TC-19).
- **O-6 Feature F-04 depends on F-07.** "Refused once a goal uses it" needs a goal to exist, so the F-04 test needs F-07 built in the same sprint. Sprint 1 order is a Part D matter, not decided here.
- **O-7 Sprint 1 completion of BR-04.** A-11 (SRS) already lists the Sprint 1 limit on correcting a same-day entry. The feature F-08 inherits it; no change here.
- **O-8 Open points from the SRS** (A-1 to A-11, T-1 to T-10) still apply to the features they affect: A-1 (days so far) to F-09; A-2 to F-03, F-04, F-05; A-3 to F-11, F-12; A-4 (decided on PR #23) to F-07; A-5 to F-05, F-06; A-10 to F-16.
