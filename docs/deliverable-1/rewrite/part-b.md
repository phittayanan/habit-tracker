<!-- Deliverable 1 rewrite, Part B (Issue #11). New text; feature, AC and test IDs from tag v1.0 (64831f7), checked against the v1.0 test files. Requirement text lives in Part A, AC text and test design in Part E, results in Part F. -->

# Part B. Feature inventory and traceability {#part-b}

This Part groups the requirements of Part A into features, gives each feature a sprint, and traces every requirement to the acceptance criteria (AC) and tests that verify it. The AC and test design are written out in Part E, and the results are in Part F; here they appear as IDs only.

## B.1 Feature inventory {#b-1}

| ID | Feature | What it delivers | Requirements | Depends on | Sprint |
|---|---|---|---|---|---|
| F-01 | Login, logout and session | Seeded users sign in and out; a database session that expires; "who am I" | FR-01 to FR-04; NFR-01, NFR-04 | — | 1 |
| F-02 | Role layout and endpoint protection | One shared layout with a menu per role; every protected endpoint checked on the server | FR-22; NFR-02 | F-01 | 1 |
| F-03 | Template creation and Manager list | A Manager creates templates and sees them in a table | FR-05, FR-06; BR-03 (range part) | F-01, F-02 | 1 |
| F-04 | Template edit | A Manager edits a template that no goal uses | FR-07; BR-08 (edit part) | F-03, F-07 | 1 |
| F-05 | Template retire | A Manager retires a template; the Retire action appears in the table | FR-08; BR-08 (retire part) | F-03, F-07 | 2 |
| F-06 | Participant template view and write refusal | A Participant reads active templates and cannot change them | FR-09, FR-23; BR-09 | F-01, F-02, F-03 | 1 |
| F-07 | Goal creation | A Participant sets a daily goal on a template | FR-10; BR-05, BR-06 | F-03, F-06 | 1 |
| F-08 | Daily entry recording | A Participant records one value per goal per day | FR-11; BR-01 to BR-04, BR-06 | F-07 | 1 |
| F-09 | Progress (days met) | A Participant sees days met out of days so far | FR-12; BR-07 | F-08 | 1 |
| F-10 | Participant data privacy | Goals, entries and progress are visible only to their owner | FR-13, FR-14; BR-10; NFR-03 | F-01, F-07, F-08 | 1 |
| F-11 | Month calendar and side panel | The Participant's first screen: this month's calendar and the chosen day's goals | FR-15 | F-08, F-09 | 2 |
| F-12 | Calendar day colours | Each day coloured by how many goals were met | FR-16; BR-15 | F-11 | 2 |
| F-13 | Entry edit and delete | A Participant corrects or removes an entry | FR-17; BR-11 | F-08, F-09 | 2 |
| F-14 | Goal change | A Participant changes a goal's target from today on | FR-18; BR-12 | F-07, F-09 | 2 |
| F-15 | Calendar and List history | A switch between the calendar and a dated list | FR-19 | F-11 | 2 |
| F-16 | Streaks | Current and best streak per goal | FR-20; BR-13 | F-08, F-13 | 3 |
| F-17 | Stored reminder | A reminder time and weekdays per goal, shown and never sent | FR-21; BR-14 | F-07 | 3 |

F-04 depends on F-07 because "refused once a goal uses it" can only be tested when goals exist; both are in Sprint 1.

## B.2 Requirement → feature → sprint → verification {#b-2}

Each FR appears in exactly one row. The BR column shows which business rules the row also carries; every BR-01 to BR-15 appears at least once. Sprint 1 rows give the AC from Part E and the tests that run them. Later rows have a planned test ID only, because the handout asks for full AC and executable tests in the sprint that builds the feature.

| FR | BR | Feature | Sprint | AC (Part E) | Tests |
|---|---|---|---|---|---|
| FR-01 | — | F-01 | 1 | AC-01.1 to AC-01.3, AC-01.9, AC-01.10 | TC-01, TC-02, TC-46, TC-62, TC-64, TC-65 |
| FR-02 | — | F-01 | 1 | AC-01.4 | TC-03 |
| FR-03 | — | F-01 | 1 | AC-01.5, AC-01.6 | TC-04, TC-05 |
| FR-04 | — | F-01 | 1 | AC-01.7 | TC-06, TC-63 |
| FR-05 | BR-03 | F-03 | 1 | AC-03.1 to AC-03.5, AC-03.7 | TC-09, TC-10, TC-68, TC-69, TC-70 |
| FR-06 | BR-08 | F-03 | 1 | AC-03.6 | TC-11 |
| FR-07 | BR-08 | F-04 | 1 | AC-04.1 to AC-04.6 | TC-12, TC-13, TC-71, TC-72, TC-73 |
| FR-08 | BR-08 | F-05 | 2 | — | planned TC-14, TC-15 |
| FR-09 | BR-09 | F-06 | 1 | AC-06.1, AC-06.2 | TC-16 |
| FR-10 | BR-05, BR-06 | F-07 | 1 | AC-07.1 to AC-07.10 | TC-20, TC-21, TC-22, TC-53, TC-54, TC-55, TC-60, TC-74 |
| FR-11 | BR-01 to BR-04, BR-06 | F-08 | 1 | AC-08.1 to AC-08.12 | TC-23 to TC-30, TC-56, TC-58, TC-61 |
| FR-12 | BR-07 | F-09 | 1 | AC-09.1 to AC-09.8 | TC-31, TC-32, TC-59 |
| FR-13 | BR-10 | F-10 | 1 | AC-10.1, AC-10.2, AC-10.4 to AC-10.7 | TC-33, TC-34, TC-35, TC-57 |
| FR-14 | BR-10 | F-10 | 1 | AC-10.3 | TC-34 |
| FR-15 | — | F-11 | 2 | — | planned TC-36 |
| FR-16 | BR-15 | F-12 | 2 | — | planned TC-37 |
| FR-17 | BR-11 | F-13 | 2 | — | planned TC-38 |
| FR-18 | BR-12 | F-14 | 2 | — | planned TC-39 |
| FR-19 | — | F-15 | 2 | — | planned TC-40 |
| FR-20 | BR-13 | F-16 | 3 | — | planned TC-41, TC-42 |
| FR-21 | BR-14 | F-17 | 3 | — | planned TC-43 |
| FR-22 | — | F-02 | 1 | AC-02.1 to AC-02.5 | TC-07, TC-08, TC-66, TC-67 |
| FR-23 | BR-09 | F-06, F-04 | 1 (create, edit); 2 (retire) | AC-06.3, AC-04.7 | TC-17, TC-18; planned TC-19 (retire) |

## B.3 Cross-cutting requirements {#b-3}

The NFRs of Part A constrain many features or the system as a whole. Each is tied to a feature or a named system responsibility, with the sprint that sets it up and the sprint that verifies it. NFR-05 to NFR-09 have system-level AC (AC-SYS.1 to AC-SYS.5) in Part E.

| NFR | Feature or system responsibility | Set up | Verified | AC (Part E) | Tests |
|---|---|---|---|---|---|
| NFR-01 | F-01 | 1 | 1 | AC-01.8 | TC-44, TC-45 |
| NFR-02 | F-02, for every feature with an endpoint | 1 | 1; again for each new endpoint | AC-02.2, AC-02.3, AC-10.4 | TC-08, TC-34, TC-66 |
| NFR-03 | F-10, for every goal and entry endpoint | 1 | 1; again in 2 and 3 | AC-10.1 to AC-10.7 | TC-33, TC-34, TC-57 |
| NFR-04 | F-01 | 1 | 1 | AC-01.1, AC-01.4, AC-01.7 | TC-03, TC-06, TC-46, TC-63 |
| NFR-05 | Every screen: the Sprint 1 screens of F-01, F-03, F-04, F-06 to F-09, then the later screens | 1 | 1 for Sprint 1 screens; 2, 3 for later screens | AC-SYS.1 | TC-47 |
| NFR-06 | The same screens; the calendar markup of F-12 | 1 | 1 for the keyboard; 2 for the calendar | AC-SYS.2 | TC-48; planned TC-49 |
| NFR-07 | System: setup commands and README | 1 | 1 documented; timed run in Lab 5 | AC-SYS.3 | TC-50 (manual) |
| NFR-08 | F-07, F-08, F-09 (the rule code for BR-01 to BR-07) | 1 | 1; hardening in 3 | AC-SYS.4 | TC-51 (coverage report) |
| NFR-09 | System: test suites and CI | 1 (local) | 1 locally; every pull request from Lab 5 | AC-SYS.5 | TC-52 |

## B.4 Coverage gaps {#b-4}

- **No uncovered requirement.** Every BR, FR and NFR of Part A has a feature or system responsibility, a sprint and at least one planned test.
- **Sprint 1 tests exist in code.** Every test ID given for a Sprint 1 row above is present in the `v1.0` test files, except the three system checks that are not automated tests: TC-50 (a manual timed run), TC-51 (a coverage report) and TC-52 (a test run). Their results are in Part F.
- **Waiting for a later sprint:**
  - The retire refusal of FR-23 (TC-19) cannot run until Retire exists (F-05, Sprint 2).
  - Refusing a new goal on a retired template (BR-08, TC-15) is planned with F-05 in Sprint 2. In `v1.0` goal creation does not check the template's state; a template can only be retired by changing the database directly, so the case cannot happen through the application yet.
  - The calendar requirements (FR-15, FR-16, FR-19) and the calendar part of NFR-06 (TC-49) have planned test IDs only.
- **Open points that could change a row:** A-5 (F-05, F-06) and A-10 (F-16) in Part A.

## B.5 Approved changes {#b-5}

Scope changes agreed by both students after the first SRS. Each was approved in a pull-request review (the review evidence is in Part F).

| Date | Change | IDs affected | Approved in |
|---|---|---|---|
| 2026-11-07 | Retire (FR-08, the retire part of BR-08) moves from Sprint 1 to Sprint 2; the Retire action is hidden in Sprint 1 | FR-06, FR-08, BR-08 | Review of PR #21 and PR #22 |
| 2026-11-07 | The month calendar and side panel (FR-15) and the day colours (FR-16, BR-15) move from Sprint 1 to Sprint 2 | FR-15, FR-16, BR-15 | Review of PR #21 |
| 2026-11-07 | FR-23 added: a Participant's create, edit or retire request on a template is refused with 403 and changes nothing | FR-23, BR-09 | Review of PR #21 |
| 2026-11-07 | The side panel shows no streak until Sprint 3; a goal's daily target is above 0 and not above the template's highest value | FR-15, FR-20, F-11, F-16, A-4 | Review of PR #23 and PR #25 |
| 2026-11-07 | No separate Sprint 3 summary feature: progress (F-09) and the day colours (F-12) cover the "summaries" in the sprint split | F-09, F-12, FR-12, FR-16 | Review of PR #26 |
