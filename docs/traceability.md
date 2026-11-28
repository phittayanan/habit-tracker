# Traceability

## Results at `v2.1` (Deliverable 2 Part D)

Issue #161. One row per requirement: requirement → feature → sprint → AC (or NFR verification) → planned test → actual test file → result and version. Values read from the repository and GitHub on 2026-11-28.

- **Version tested.** Tag `v2.1`, commit `9b09bfe` (release PR #198, merged by phittayanan after projectnewy's approval).
- **"Pass (CI)".** Every planned test in the row passed in the release CI run [46124923270](https://github.com/phittayanan/habit-tracker/actions/runs/46124923270) on `9b09bfe` (job `test-and-docker`, Linux): server 161 tests, 161 passed, 0 failed, 0 skipped; browser 126 passed, 0 failed, 6 skipped. The 6 skipped are the phone-only or desktop-only cases in `client/test/calendar.spec.js` (5) and `client/test/day-colours.spec.js` (1), each skipped at the other width by `test.skip`; each runs and passes at its own width.
- **"Not run".** No result is claimed; the reason is given.
- **Accepted in.** The first tag on `main` whose release PR was approved by the other student. `v1.0` is the Sprint 1 release, `v1.5` the Lab 7 release (ADR 0061), `v2.0` the Sprint 2 release (PR #189), `v2.1` the Sprint 3 candidate (PR #198). No outside user test has run on `v2.0` or `v2.1` (last: Lab 6 on `v1.3` and `v1.4`).
- Test files are under `server/test/` (API, database and unit) and `client/test/` (Playwright, 375 px and 1280 px). TC-47 and TC-48 are steps in most browser files; the rows name them once.

### Functional requirements

| FR | BR | Feature | Sprint | AC | Planned tests | Test files at `v2.1` | Result at `v2.1` | Accepted in |
|---|---|---|---|---|---|---|---|---|
| FR-01 | none | F-01 | 1 | AC-01.1 to AC-01.3, AC-01.9, AC-01.10 | TC-01, TC-02, TC-46, TC-62, TC-64, TC-65, TC-81 | `auth.test.js`, `session.test.js`, `auth.spec.js` | Pass (CI) | `v1.0`; TC-81 `v1.4` |
| FR-02 | none | F-01 | 1 | AC-01.4 | TC-03 | `auth.test.js` | Pass (CI) | `v1.0` |
| FR-03 | none | F-01 | 1 | AC-01.5, AC-01.6 | TC-04, TC-05 | `auth.test.js` | Pass (CI) | `v1.0` |
| FR-04 | none | F-01 | 1 | AC-01.7 | TC-06, TC-63 | `auth.test.js`, `session.test.js` | Pass (CI) | `v1.0` |
| FR-05 | BR-03 | F-03 | 1; kind 2 | AC-03.1 to AC-03.5, AC-03.7; AC-03.8, AC-03.9 | TC-09, TC-10, TC-68, TC-69, TC-70; TC-118, TC-119 | `template.test.js`, `templates.spec.js`, `template-kind.test.js`, `template-kind.spec.js` | Pass (CI) | `v1.0`; kind `v2.0` |
| FR-06 | BR-08 | F-03 | 1 | AC-03.6 | TC-11 | `templates.spec.js` | Pass (CI) | `v1.0` |
| FR-07 | BR-08 | F-04 | 1; kind 2 | AC-04.1 to AC-04.6; AC-04.8 | TC-12, TC-13, TC-71, TC-72, TC-73; TC-129 | `template-edit.test.js`, `templates.spec.js`, `template-kind.test.js` | Pass (CI) | `v1.0`; kind `v2.0` |
| FR-08 | BR-08 | F-05 | 2 | AC-05.1 to AC-05.8 | TC-14, TC-15, TC-19, TC-140 to TC-143 | `template-retire.test.js`, `template-retire.spec.js` | Pass (CI) | `v2.0` |
| FR-09 | BR-09 | F-06 | 1 | AC-06.1, AC-06.2 | TC-16 | `template.test.js`, `templates.spec.js` | Pass (CI) | `v1.0` |
| FR-10 | BR-05, BR-06 | F-07 | 1; Time target 2 | AC-07.1 to AC-07.11; AC-07.12, AC-07.13 | TC-20, TC-21, TC-22, TC-53, TC-54, TC-55, TC-60, TC-74, TC-78; TC-128, TC-131 | `goal.test.js`, `goal-rules.test.js`, `goals.spec.js`, `template-kind.test.js`, `template-kind.spec.js` | Pass (CI) | `v1.0`; TC-78 `v1.3`; Time `v2.0` |
| FR-11 | BR-01, BR-02, BR-03, BR-04, BR-06 | F-08 | 1; Time value 2 | AC-08.1 to AC-08.19; AC-08.20, AC-08.21 | TC-23 to TC-30, TC-56, TC-58, TC-61, TC-82 to TC-86, TC-89, TC-90; TC-127, TC-131 | `entry.test.js`, `entry-rules.test.js`, `entry-migration.test.js`, `entries.spec.js`, `template-kind.test.js`, `template-kind.spec.js` | Pass (CI) | `v1.0`; day total `v1.5`; Time `v2.0` |
| FR-12 | BR-07 | F-09 | 1 | AC-09.1 to AC-09.10 | TC-31, TC-32, TC-59, TC-87, TC-88 | `progress-rules.test.js`, `progress.test.js`, `progress.spec.js` | Pass (CI) | `v1.0`; day total `v1.5` |
| FR-13 | BR-10 | F-10 | 1 | AC-10.1, AC-10.2, AC-10.4 to AC-10.7 | TC-33, TC-34, TC-35, TC-57 | `privacy.test.js`, `progress.spec.js` | Pass (CI) | `v1.0` |
| FR-14 | BR-10 | F-10 | 1 | AC-10.3 | TC-34 | `privacy.test.js` | Pass (CI) | `v1.0` |
| FR-15 | none | F-11 | 2 | AC-11.1 to AC-11.13 | TC-36, TC-110 to TC-117, TC-120, TC-121, TC-130, TC-47, TC-48 | `calendar.spec.js`, `day-colours.spec.js`, `calendar.test.js` | Pass (CI) | `v2.0` |
| FR-16 | BR-15 | F-12 | 2 | AC-12.1 to AC-12.6 | TC-37, TC-49, TC-117, TC-122, TC-123, TC-124 | `day-state-rules.test.js`, `calendar.test.js`, `day-colours.spec.js`; TC-49 also a markup review | Pass (CI); TC-49 markup review recorded by phittayanan in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) | `v2.0` |
| FR-17 | BR-11 | F-13 | 2 | AC-13.1 to AC-13.10 | TC-38, TC-144 to TC-151 | `entry-edit.test.js`, `entry-edit.spec.js` | Pass (CI) | `v2.0` |
| FR-18 | BR-12 | F-14 | 2 | AC-14.1 to AC-14.9 | TC-39, TC-152 to TC-159 | `progress-rules.test.js`, `goal-change.test.js`, `goal-target-migration.test.js`, `goal-change.spec.js` | Pass (CI) | `v2.0` |
| FR-19 | none | F-15 | 2 | AC-15.1 to AC-15.6 | TC-40, TC-121, TC-125, TC-126, TC-47, TC-48 | `day-colours.spec.js`, `calendar.test.js`, `time-format.test.js` | Pass (CI) | `v2.0` |
| FR-20 | BR-13 | F-16 | 3 | AC-16.1 to AC-16.9 | TC-41, TC-42, TC-160 to TC-166 | none | **Not run:** F-16 is not built and none of its tests is written | not released |
| FR-21 | BR-14 | F-17 | 3 | AC-17.1 to AC-17.9 | TC-43, TC-167 to TC-175 | `reminder.test.js`, `reminder-rules.test.js`, `reminder.spec.js` | Pass (CI); TC-167 (review) passed in projectnewy's [review of 3714141](https://github.com/phittayanan/habit-tracker/pull/183#pullrequestreview-6096383972) of PR #183 | `v2.1` |
| FR-22 | none | F-02 | 1 | AC-02.1 to AC-02.5 | TC-07, TC-08, TC-66, TC-67 | `auth.spec.js`, `auth.test.js` (TC-08 also in every route test file) | Pass (CI) | `v1.0` |
| FR-23 | BR-09 | F-06, F-04, F-05 | 1; retire 2 | AC-06.3, AC-04.7; the retire refusal in F-05 | TC-17, TC-18, TC-19 | `template.test.js`, `template-edit.test.js`, `template-retire.test.js` | Pass (CI) | `v1.0`; retire `v2.0` |

### Non-functional requirements

| NFR | Feature or responsibility | Sprint | Verification | Planned tests | Test file or measurement at `v2.1` | Result at `v2.1` |
|---|---|---|---|---|---|---|
| NFR-01 | F-01 | 1 | User table read; repository search (AC-01.8) | TC-44, TC-45 | `auth.test.js` | Pass (CI) |
| NFR-02 | F-02, every endpoint | 1; rechecked 2, 3 | Route audit and role matrix (AC-02.2, AC-02.3) | TC-08, TC-66, TC-34 | `auth.test.js` with `route-coverage.js`; TC-08 cases in `calendar.test.js`, `entry*.test.js`, `goal*.test.js`, `reminder.test.js`, `template-retire.test.js` | Pass (CI). `server/src` registers 19 API routes at `v2.1`; 3 are public (login, health, ready) and the other 16, Sprint 2 and F-17 routes included, are protected |
| NFR-03 | F-10, every goal and entry endpoint | 1; rechecked 2, 3 | Two Participants and one Manager | TC-33, TC-34, TC-57; later TC-121, TC-147, TC-155, TC-172 | `privacy.test.js`, `calendar.test.js`, `entry-edit.test.js`, `goal-change.test.js`, `reminder.test.js` | Pass (CI) |
| NFR-04 | F-01 | 1 | Cookie flags, aged and logged-out session | TC-03, TC-06, TC-46, TC-63 | `auth.test.js`, `session.test.js` | Pass (CI) |
| NFR-05 | Screens of F-01 to F-15 and F-17 | 1, 2, 3 | Playwright at 375 px and 1280 px (AC-SYS.1) | TC-47 | every `client/test/*.spec.js` with a TC-47 step | Pass (CI). F-16 screens do not exist yet |
| NFR-06 | Same screens; F-12 markup | 1, 2, 3 | Keyboard run (AC-SYS.2); markup review | TC-48, TC-49 | browser files with a TC-48 step; `day-colours.spec.js` | Pass (CI); TC-49 review as in FR-16. F-16 screens do not exist yet |
| NFR-07 | System: setup | 1; timed in Lab 5 | Timed clean-clone run (AC-SYS.3) | TC-50 | manual | **Not run at `v2.1`.** Last result: 27 s Docker fresh-clone run on `ad3300a` (Lab 5, Issue #49) |
| NFR-08 | F-07, F-08, F-09 rule code | 1; 3 | Coverage report (AC-SYS.4) | TC-51 | local run, [evidence](deliverable-2/evidence/tc-51-coverage-v2.1.txt) | Pass, local, not CI: on `9b09bfe` (2026-11-28, Node 26.8.1, run by Claude Code for #161) 161 of 161 passed; line coverage 100% in `entry-rules.js`, `goal-rules.js`, `progress-rules.js`, `day-state-rules.js`, `reminder-rules.js` and `template.js`; all files 99.20% |
| NFR-09 | System: CI | 1 locally; CI from Lab 5 | CI run on a PR (AC-SYS.5) | TC-52 | `.github/workflows/ci-docker.yml` | Pass: run 46124923270 above (server, browser and Docker build). Server tests also on Windows since #164 |

### Gaps at `v2.1`

| Gap | Affected IDs | State | Where it is planned |
|---|---|---|---|
| F-16 streaks not built; 9 planned tests not written | FR-20, BR-13, AC-16.1 to AC-16.9, TC-41, TC-42, TC-160 to TC-166 | Open | Plan to 13 Dec, PR #200 (PENDING until #200 merges) |
| NFR-08 asks for "a coverage report from CI"; CI produces none, so TC-51 is a local run | NFR-08, TC-51 | Open | Hardening, #27 (PENDING: owner and date from PR #200) |
| TC-50 (timed clean clone) not repeated since Lab 5 | NFR-07 | Open | not planned yet |
| No outside user test on `v2.0` or `v2.1` | all Sprint 2 and Sprint 3 AC | Open | PENDING: D2 Part A, PR #186 |
| Checks not run on the deployed app (keyboard-only, cross-account writes, concurrency) | NFR-03, NFR-06 | Automated suites only | [v2.0 record](deliverable-2/v2.0-release.md) section 5 |
| OBS-1: a rejected-entry message stays on a calendar card after the draft is discarded (`v2.0`) | F-11 | No Issue yet | Plan to 13 Dec, PR #200 |
| TC-75 to TC-77 have no requirement ID (Lab 5 technical checks); TC-79 and TC-80 are defined nowhere (TC-80 was renamed TC-75) | none | Known, kept | none |

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

Auth implementation review: [https://github.com/phittayanan/habit-tracker/pull/34](https://github.com/phittayanan/habit-tracker/pull/34), for Issue #32 and parent #9.

Test IDs (`TC-nn`) map to the list below. Auth tests exist under `server/test/` and `client/test/` for implementation Issue #32. Template create and view tests exist in the same folders for implementation Issue #36. Goal tests are implemented for Issue #40, Entry tests for Issue #42, Progress and privacy tests for Issue #44, and template edit tests for Issue #53; broader privacy tests remain planned. See [Auth implementation evidence](auth-implementation-evidence.md) and [Template implementation evidence](template-implementation-evidence.md), [Goal](goal-implementation-evidence.md) and [Entry](entry-implementation-evidence.md) and [Progress and privacy](progress-privacy-implementation-evidence.md) and [Template edit](template-edit-implementation-evidence.md) for red/green commands, tested commits, AC results and limits. Auth API/unit checks pass 22/22 and Playwright checks pass 12/12 at 375px and 1280px on `31746a3` in the current review round; teammate re-review remains pending after changes requested. Template server checks pass 31/31 and Playwright checks pass 20/20 at 375px and 1280px on `5435e89`. Initial-build counts remain in the evidence history. AC are set in each Sprint 1 feature contract (Part E); later-sprint rows need none now. Issue #9 is the Sprint 1 parent build Issue. The AC for F-07 to F-10 are written in `docs/sprints/sprint-1/` (contract Issue #28), and the AC for F-01 to F-04 and F-06 in the same folder (contract Issue #30). TC-53 to TC-61 were added by the first four contracts, and TC-62 to TC-73 by the other five.

| BR | FR | Feature | AC | Test ID | Sprint | Issue / PR |
|---|---|---|---|---|---|---|
| none | FR-01 | F-01 | AC-01.1 to AC-01.3, AC-01.9, AC-01.10 | TC-01, TC-02, TC-46, TC-62, TC-64, TC-65, TC-81 | 1 | #30, #32, #9, #128 (partner finding #126), [implementation](https://github.com/phittayanan/habit-tracker/pull/34) |
| none | FR-02 | F-01 | AC-01.4 | TC-03 | 1 | #30, #32, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/34) |
| none | FR-03 | F-01 | AC-01.5, AC-01.6 | TC-04, TC-05 | 1 | #30, #32, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/34) |
| none | FR-04 | F-01 | AC-01.7 | TC-06, TC-63 | 1 | #30, #32, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/34) |
| BR-03 | FR-05 | F-03 | AC-03.1 to AC-03.5, AC-03.7; AC-03.8, AC-03.9 (kind, Sprint 2) | TC-09, TC-10, TC-68, TC-69, TC-70; TC-118, TC-119 | 1; kind 2 | #30, #36, #9, #131 (partner finding #127), [implementation](https://github.com/phittayanan/habit-tracker/pull/37); #151 (kind contract), #168 (kind, [evidence](template-kind-implementation-evidence.md)) |
| BR-08 | FR-06 | F-03 | AC-03.6 | TC-11 | 1 | #30, #36, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/37) |
| BR-08 | FR-07 | F-04 | AC-04.1 to AC-04.6; AC-04.8 (kind, Sprint 2) | TC-12, TC-13, TC-71, TC-72, TC-73; TC-129 | 1; kind 2 | #30, #53, #9, #131 (partner finding #127), [implementation](https://github.com/phittayanan/habit-tracker/pull/54), #168 (kind, [evidence](template-kind-implementation-evidence.md)) |
| BR-08 | FR-08 | F-05 | AC-05.1 to AC-05.8 | TC-14, TC-15, TC-19, TC-140 to TC-143 | 2 | #150 ([contract](sprints/sprint-2/F-05-template-retire.md)), #152 ([evidence](template-retire-implementation-evidence.md)) |
| BR-09 | FR-09 | F-06 | AC-06.1, AC-06.2 | TC-16 | 1 | #30, #36, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/37) |
| BR-05, BR-06 | FR-10 | F-07 | AC-07.1 to AC-07.11; AC-07.12, AC-07.13 (Time target, Sprint 2) | TC-20, TC-21, TC-22, TC-53, TC-54, TC-55, TC-60, TC-74, TC-78; TC-128, TC-131 | 1; Time target 2 | #28, #38, #40, #74, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/41), #168 (kind, [evidence](template-kind-implementation-evidence.md)) |
| BR-01, BR-02, BR-03, BR-04, BR-06 | FR-11 | F-08 | AC-08.1 to AC-08.19; AC-08.20, AC-08.21 (Time value, Sprint 2) | TC-23 to TC-30, TC-56, TC-58, TC-61, TC-82 to TC-86, TC-89, TC-90; TC-127, TC-131 | 1; Time value 2 | #28, #38, #42, #9, #139 (Lab 7), #140 ([implementation](labs/lab-07/implementation.md)), #168 (kind, [evidence](template-kind-implementation-evidence.md)) |
| BR-07 | FR-12 | F-09 | AC-09.1 to AC-09.10 | TC-31, TC-32, TC-59, TC-87, TC-88 | 1 | #28, #44, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/51), #139 (Lab 7), #140 ([implementation](labs/lab-07/implementation.md)) |
| BR-10 | FR-13 | F-10 | AC-10.1, AC-10.2, AC-10.4 to AC-10.7 | TC-33, TC-34, TC-35, TC-57 | 1 | #28, #44, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/51) |
| BR-10 | FR-14 | F-10 | AC-10.3 | TC-34 | 1 | #28, #44, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/51) |
| none | FR-15 | F-11 | AC-11.1 to AC-11.13 | TC-36, TC-110 to TC-117, TC-120, TC-121, TC-130, TC-47, TC-48 | 2 | #151 ([contract](sprints/sprint-2/F-11-month-calendar.md)), #155 ([evidence](calendar-implementation-evidence.md); TC-117 and the List step of TC-110 run in #156, ADR 0097) |
| BR-15 | FR-16 | F-12 | AC-12.1 to AC-12.6 | TC-37, TC-49, TC-117, TC-122, TC-123, TC-124 | 2 | #151 ([contract](sprints/sprint-2/F-12-day-colours.md)), #156 ([evidence](colours-list-implementation-evidence.md)) |
| BR-11 | FR-17 | F-13 | AC-13.1 to AC-13.10 | TC-38, TC-144 to TC-151 | 2 | #150 ([contract](sprints/sprint-2/F-13-entry-edit-delete.md)), #154 |
| BR-12 | FR-18 | F-14 | AC-14.1 to AC-14.9 | TC-39, TC-152 to TC-159 | 2 | #150 ([contract](sprints/sprint-2/F-14-goal-change.md)), #153 (ADR 0092, ADR 0093) |
| none | FR-19 | F-15 | AC-15.1 to AC-15.6 | TC-40, TC-121, TC-125, TC-126, TC-47, TC-48 | 2 | #151 ([contract](sprints/sprint-2/F-15-calendar-list.md)), #156 ([evidence](colours-list-implementation-evidence.md)) |
| BR-13 | FR-20 | F-16 | AC-16.1 to AC-16.9 | TC-41, TC-42, TC-160 to TC-166 | 3 | #157 ([contract](sprints/sprint-3/F-16-streaks.md)); no code Issue yet |
| BR-14 | FR-21 | F-17 | AC-17.1 to AC-17.9 | TC-43, TC-167 to TC-175 | 3 | #157 ([contract](sprints/sprint-3/F-17-stored-reminder.md)), #158 (ADR 0099, ADR 0100) |
| none | FR-22 | F-02 | AC-02.1 to AC-02.5 | TC-07, TC-08, TC-66, TC-67 | 1 | #30, #32, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/34) |
| BR-09 | FR-23 | F-06, F-04 | AC-06.3, AC-04.7 | TC-17, TC-18 (create, edit); TC-19 (retire, Sprint 2) | 1 | #30, #36, #53, #9, [implementation](https://github.com/phittayanan/habit-tracker/pull/37), #152 (retire, [evidence](template-retire-implementation-evidence.md)) |

Goal implementation evidence: [Issue #40](goal-implementation-evidence.md). AC-07.1/2 → TC-20; AC-07.3 → TC-21; AC-07.4 → TC-55; AC-07.5 → TC-22; AC-07.6/8 → TC-53; AC-07.7 → TC-54; AC-07.9 → TC-60; AC-07.10 → TC-74; AC-07.11 → TC-78. `server/test/goal.test.js` covers the API/database cases; `server/test/goal-rules.test.js` adds rule units; `client/test/goals.spec.js` covers TC-60 and Goal TC-47/48 at both widths. TC-08's independent discovery now includes both `/api/goals` methods and their implicit HEAD protection. Goal rule coverage is local evidence for NFR-08; this is not a claim of CI coverage or completion of the later BR-01 to BR-07 rules.

## NFR -> Feature -> Verification -> Test

| NFR | Feature or responsibility | Verification | Test ID | Verified in Sprint |
|---|---|---|---|---|
| NFR-01 | F-01 | User table read; repository search (AC-01.8) | TC-44, TC-45 | 1 |
| NFR-02 | F-02 | API test per endpoint (role matrix, AC-02.2, AC-02.3) | TC-08, TC-66, TC-34 (goal and entry endpoints, AC-10.4) | 1 (rechecked later) |
| NFR-03 | F-10 | API tests, two Participants and one Manager | TC-33, TC-34, TC-57 | 1 (rechecked in 2 and 3) |
| NFR-04 | F-01 | API and unit tests: cookie flag, aged session, logged-out session (AC-01.1, AC-01.4, AC-01.7) | TC-06, TC-46, TC-03, TC-63 | 1 |
| NFR-05 | Sprint 1 screens of F-01 (login), F-03, F-04, F-06 to F-09; later screens | Playwright at 375 px and 1280 px (AC-SYS.1) | TC-47 | 1; 2 and 3 for later screens |
| NFR-06 | Same screens, including F-01 (login); F-12 markup | Playwright keyboard run (AC-SYS.2); markup review | TC-48, TC-49 | 1; 2 and 3 for later screens |
| NFR-07 | System: setup commands and docs | Timed clean-clone run (AC-SYS.3) | TC-50 | 1 documented; timed in Lab 5 step 3 (Issue #49): Docker fresh-clone run (C-03) 27 s on `ad3300a`, following `docs/labs/lab-05/deployment.md` section 7.3, not the README native setup |
| NFR-08 | F-07, F-08, F-09 (rule code) | Coverage report (AC-SYS.4) | TC-51 | 1; 3 |
| NFR-09 | System: CI | CI run on a PR (AC-SYS.5; run locally in Sprint 1) | TC-52 | 1 locally; CI from Lab 5: green `test-and-docker` run 43182003625 on `daaafc2` for Issue #50 (82 server tests, 44 browser tests, Docker build); see deployment.md 8.3 |

## Planned tests

Names from the "Tested by" and "Verification" columns of the SRS. Auth implementation and API/unit/browser results are linked above; other tests are still planned.

| Test ID | Planned test | Level |
|---|---|---|
| TC-01 | Valid login creates a session row and an HTTP-only cookie | API |
| TC-02 | Unknown username and wrong password: identical errors, real cost-10 bcrypt comparisons, no cookie or session | API |
| TC-03 | Logout deletes the session; the cookie no longer gives access | API |
| TC-04 | Current user returns public identity; real session middleware excludes hash and unrelated user fields | API |
| TC-05 | Protected path with no valid session returns 401 | API |
| TC-06 | Session older than 8 hours returns 401 | API |
| TC-07 | Menu items change with role; layout is the same | Browser |
| TC-08 | Independent Express route audit and role matrix grow with each implemented endpoint: exact public allowlist, missing registration detected, 401 without a session and 403 for the wrong role | API |
| TC-09 | Manager creates a template | API |
| TC-10 | Minimum not below maximum is rejected | Unit and API |
| TC-11 | Manager table shows name, unit, range, state, with actions | Browser |
| TC-12 | Edit of an unused template succeeds | API |
| TC-13 | Edit of a used template refused, also when the edit races a new goal on the same template (OP-04.4) | API and database |
| TC-14 | Retired template leaves the new-goal list | API |
| TC-15 | New goal on a retired template refused; existing goal still takes entries | API |
| TC-16 | Participant sees active templates read-only | API and browser |
| TC-17 | Participant create-template request returns 403, nothing changes | API |
| TC-18 | F-04 (AC-04.7): Participant edit-template request returns 403, nothing changes | API |
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
| TC-29 | A second entry for the same day within the day maximum is stored (revised in Lab 7; before: 409) | API |
| TC-30 | Ended goal: an entry dated after its end is rejected; an entry dated inside its period is accepted | Unit and API |
| TC-31 | Days met counts for met, missed and empty days | Unit |
| TC-32 | Progress shown on the goals page | Browser |
| TC-33 | Participant B's read and write of Participant A's goals and entries refused | API |
| TC-34 | Manager read and write of goals and entries refused | API |
| TC-35 | Participant sees only own goals, entries and progress | API and browser |
| TC-36 | Calendar is first after login (Monday first); the panel shows the chosen day's active goals | Browser |
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
| TC-53 | Goal input validation: missing field, bad date, end before start, target 0 or negative, target with more than 2 decimal places or above 99,999,999.99, Manager and anonymous refused; nothing stored | API |
| TC-54 | Daily target equal to the template maximum accepted; above it rejected; a target above it with more than 2 decimal places gets `VALIDATION_ERROR` (validation wins); a target above it with no `startDate` also gets `VALIDATION_ERROR` | API and unit |
| TC-55 | An ended goal does not block a new goal on the same template; another template or another Participant allowed; the owner is the session user | API |
| TC-56 | Entry input validation and access: missing or malformed date or value, value with more than 2 decimal places or outside `Decimal(10, 2)`; Manager, anonymous, another Participant's goal and unknown goal refused | API |
| TC-57 | Another Participant's goal and an unknown goal id give the same 404 status and body | API |
| TC-58 | A saved entry is returned after the app restarts | API and database |
| TC-59 | Journey: a Manager creates a template through the UI; a Participant creates a goal, reads "0 of 1", records a value, reads "1 of 1", restarts, reads again; Manager and anonymous refused | Browser and API |
| TC-60 | New goal form creates a goal and shows the API message for a rule failure | Browser |
| TC-61 | Entry form shows the API message for a rejected value and keeps the typed value | Browser |
| TC-62 | Login input validation: non-JSON, missing, empty or non-string credentials; no cookie or session. Shared API malformed/oversized JSON returns 400 after auth checks | API |
| TC-63 | Session expiry with the instant passed in: valid at login plus 7:59:59, expired at plus 8:00:00 | Unit |
| TC-64 | Origin check: login and logout with a foreign `Origin` refused with 403 and change nothing; matching-host and no-Origin login accepted, including HTTP upstream with `X-Forwarded-Proto: https` | API |
| TC-65 | Login screen: wrong password message, username kept; login opens the role's first page; logout shows the login screen | Browser |
| TC-66 | Check order and identity: anonymous gets 401 before 403; a Participant's invalid or unknown-id request to a test-only Manager route gets 403; a role in the body or a header changes nothing | API |
| TC-67 | No session shows the login screen; a 401 during use returns to the login screen | Browser |
| TC-68 | Template input validation (name, unit, numbers, 2 decimal places) and anonymous create and list refused; nothing stored | API |
| TC-69 | Duplicate template name returns 409; a range error wins over a duplicate name; two creates at once store one | API |
| TC-70 | New template form creates a template and shows the API message for a rejected range, keeping the typed values | Browser |
| TC-71 | Template edit validation, unknown id 404 and anonymous 401; nothing changes | API |
| TC-72 | Template edit: merged range below, duplicate name 409, own name accepted | Unit and API |
| TC-73 | Template edit form: a valid change shows in the table; an edit of a used template shows the API message | Browser |
| TC-74 | Goal creation locks the template row: while another transaction holds a `FOR UPDATE` lock on the template, `POST /api/goals` waits, then reads the template as committed | API and database |
| TC-75 | Lab 5 technical check (Issues #66, #80, ADR 0052; no feature ID): the build label shows on the login page and in the top bar | Browser |
| TC-76 | Demo seed keeps an edited template: after a Manager edits a demo template, running the seed again leaves the unit, minimum and maximum as edited and still creates a missing demo template (Issue #79, ADR 0053; no feature ID) | API and database |
| TC-77 | Seed sets the password hash again on every run: a second run with other `SEED_*_PASSWORD` values replaces the hashes, so the new passwords match and the old ones no longer do (Issue #79, ADR 0053 decision 2; no feature ID) | API and database |
| TC-78 | A daily target not above the template minimum is rejected with `TARGET_NOT_ABOVE_TEMPLATE_MIN` and nothing is stored; a target just above it is accepted; on a template with minimum 0 a target of 0 still gets `VALIDATION_ERROR` (Issue #74, ADR 0054, AC-07.11) | API and unit |
| TC-81 | A username with a NUL character is an unknown username: 401, no session (Issue #128, AC-01.2) | API |
| TC-82 | Day total below, at and above the template maximum | Unit and API |
| TC-83 | Day total is exact to 2 decimal places | Unit and API |
| TC-84 | Concurrent entries cannot take the day total above the maximum | API and database |
| TC-85 | The day-total rule is checked last | Unit and API |
| TC-86 | Several entries of a day and the day total on the goals page | Browser |
| TC-87 | A day is met by the sum of its entries and counts once | Unit |
| TC-88 | A day becomes met with a second entry, also after a restart | Browser and API |
| TC-89 | The Lab 7 migration keeps existing entries | API and database |
| TC-90 | Negative values: only the upper limit is checked on the day total | API |
| TC-110 | Month arrows: back to earlier months, not past the current month; the List follows | Browser |
| TC-111 | A future day cannot be opened; today and past days open | Browser |
| TC-112 | A day with no active goal says "No goals on this day." | Browser |
| TC-113 | Count input: − / + by 1, not below +0 or past what fits; Done saves one entry | Browser |
| TC-114 | Time input: 15-minute bar by pointer and arrow keys; Check in saves whole minutes | Browser |
| TC-115 | Typed row saves exact amounts; a rejected save shows the API message | Browser and API |
| TC-116 | Closing with an unsaved amount asks before discarding | Browser |
| TC-117 | A save updates the card, the sign and the calendar colour without a reload | Browser |
| TC-118 | Template kind on create: default Count; Time stores unit minutes and whole numbers; bad kind refused | API and database |
| TC-119 | Template form Kind choice and the Kind column | Browser |
| TC-120 | `GET /api/calendar` shape, month default and bad month | API |
| TC-121 | `GET /api/calendar` privacy: own goals only; Manager 403; anonymous 401 | API |
| TC-122 | Editing or deleting an entry changes the day state (after F-13) | API |
| TC-123 | Day state uses the target valid that day (after F-14) | Unit and API |
| TC-124 | Today's state is live | API |
| TC-125 | List grouped by day, newest first, with "No entries" days | Browser |
| TC-126 | Time shown as hours and minutes | Unit |
| TC-127 | A Time entry must be whole minutes | API |
| TC-128 | A Time goal target must be whole minutes | API |
| TC-129 | Template kind change: allowed while unused, whole numbers for Time, refused when used | API |
| TC-130 | First page `/calendar`; menu Calendar, Goals, Templates; TC-07, TC-32, TC-59, TC-61, TC-65, TC-86 and TC-47/TC-48 pass with only their steps into the goals page changed (ADR 0073 point 4); Manager refused on `/calendar` | Browser |
| TC-131 | Time values outside the calendar: typed in minutes with an hours-and-minutes hint, shown in hours and minutes | Browser |
| TC-140 | Retire again, edit after retire and bad ids refused | API |
| TC-141 | Retire in the browser with confirmation; the row and the Participant lists after it | Browser |
| TC-142 | Retire against goal creation, and two retires, on one template at once | API and database |
| TC-143 | Retire by keyboard at both widths | Browser |
| TC-144 | Edit on an ended goal and a retired template | API |
| TC-145 | Invalid edit values refused | API |
| TC-146 | Day-total cap on edit and delete | API |
| TC-147 | Entry edit and delete access and unknown ids | API |
| TC-148 | Concurrent create and edit keep the day cap | API and database |
| TC-149 | Edit and delete on the goals page | Browser |
| TC-150 | Edit and delete in the day box | Browser |
| TC-151 | Entry edit and delete by keyboard at both widths | Browser |
| TC-152 | Target change stored as versions, same day replaced | API and database |
| TC-153 | Change on a goal not yet started | API and database |
| TC-154 | Target change refusals and boundaries | API |
| TC-155 | Target change access | API |
| TC-156 | Goal version migration keeps goals and progress | API and database |
| TC-157 | First version on create; fallback without a version | API and database |
| TC-158 | Change target on the goals page | Browser |
| TC-159 | Change target by keyboard at both widths | Browser |
| TC-160 | Streaks of a goal not started, ended, and of one day | Unit |
| TC-161 | Streaks use the target of each day | Unit |
| TC-162 | Edit and delete change the streaks | API |
| TC-163 | Streak fields, goal detail and access | API |
| TC-164 | Detail page refusals in the browser | Browser |
| TC-165 | Current streak on today's calendar cards only | Browser |
| TC-166 | Goal detail by keyboard at both widths | Browser |
| TC-167 | No sending library or job is added | Review |
| TC-168 | Saving replaces the reminder; one per goal | API and database |
| TC-169 | Removing a reminder | API |
| TC-170 | Reminder time and weekday validation | API and unit |
| TC-171 | No reminder change on an ended goal | API |
| TC-172 | Reminder access | API |
| TC-173 | Set, change and remove a reminder on the goals page | Browser |
| TC-174 | An ended goal's reminder | Browser |
| TC-175 | Reminder by keyboard at both widths | Browser |
| none | Lab 5 technical checks (Issue #80, no feature ID): `deploy/tests/test_release_stub.sh`, `deploy/tests/test_smoke.py`, `deploy/tests/test_deploy_workflow.py` (release script, smoke test and `deploy.yml` structure, offline) | Offline script and unit |

## Coverage Gaps

The notes below were written while each Issue was built and keep their history; some describe states that later changed. The current state is in "Results at `v2.1`" above.

- Every BR-01 to BR-15, FR-01 to FR-23 and NFR-01 to NFR-09 maps to a feature (or a named system responsibility for NFR-07 and NFR-09) and to at least one planned test. No requirement is uncovered.
- AC exist for every Sprint 1 feature: F-07 to F-10 (Issue #28) and F-01 to F-04, F-06 (draft contracts, Issue #30). The five system checks for NFR-05 to NFR-09 (TC-47, TC-48, TC-50, TC-51, TC-52) have AC-SYS.1 to AC-SYS.5 in `docs/sprints/sprint-1/README.md` (Issue #8). Sprint 2 and 3 rows have none by design.
- Auth API/unit/browser checks have passed for Issue #32, including TC-47/48 on the login and shared role layout. Template create and view checks have passed for Issue #36 on `5435e89`, including TC-47/48 on the template list and new form at 375px and 1280px. F-04 tests (TC-12, TC-13 with the edit-versus-goal race, TC-18, TC-71, TC-72, TC-73, and TC-47/48 on the edit form) pass locally for Issue #53 on `3d1ccbb`, and TC-08 now audits `PATCH /api/templates/:id`; teammate review is pending. TC-08 independently discovers implemented API routes from the Express router tree, including mounted routers and methods; only exact login/health/ready methods are public. Issue #36 adds `GET /api/templates` and `POST /api/templates` to that coverage. Missing coverage registration and missing protection are regression-tested; each later feature must extend the protected coverage entries. Implementation re-review and merge remain pending.
- `GET /api/ready` answering 503 when the database cannot be reached (F-02 section 5, SDS 4.4) has an automated test, `server/test/ready.test.js`, added in Issue #48. It has no TC number because no planned test covers it; no new TC was added in Issue #48 (projectnewy left the choice to the worker, who kept the numbering unchanged); the reviewer may ask for one. The 503 behavior already existed, so that test passed the first time it ran.
- FR-08 and the FR-23 retire refusal (F-05, Issue #152): TC-14, TC-15, TC-19, TC-140 to TC-143 pass locally ([evidence](template-retire-implementation-evidence.md)); phittayanan approved PR #179; released in `v2.0`.
- The calendar rows (FR-15, FR-16, FR-19) and NFR-06's non-colour check (TC-49) have AC and test IDs in the Sprint 2 contracts of Issue #151. Issue #156: TC-37, TC-40, TC-49 (the automated part; phittayanan recorded the markup review in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) of PR #185), TC-117, TC-123, TC-124, TC-125, TC-126, the List step of TC-110 and TC-47/TC-48 on the List pass locally ([evidence](colours-list-implementation-evidence.md)); phittayanan approved 8cf2ee2 in the PR #185 review. After #154 merged, TC-122 and the calendar colour step of F-13 AC-13.9 (in TC-150) were added in #156 and pass. The template kind (ADR 0064) is built in Issue #168, before #155.
- Issue #168: TC-118, TC-119, TC-127, TC-128, TC-129 and TC-131 pass locally ([evidence](template-kind-implementation-evidence.md)); phittayanan approved PR #173; released in `v2.0`.
- FR-20 has AC and test IDs in the Sprint 3 contract of Issue #157; none of its tests is written yet. TC-162 waits for F-13 (#154) and TC-165 for F-11 (#155). F-16 has no code Issue yet.
- FR-21 (F-17, Issue #158): TC-43 and TC-168 to TC-172 (`server/test/reminder.test.js`, with the TC-170 unit part in `server/test/reminder-rules.test.js`) and TC-173 to TC-175 (`client/test/reminder.spec.js`, 375 px and 1280 px) are written. All pass, TC-43's `GET /api/calendar` step included since #155 (PR #180) was merged into the branch (ADR 0100). TC-167 is the reviewer's check of the diff. Results and the tested commit are in the #158 PR.
- FR-17 (F-13, Issue #154): TC-38 (API and unit), TC-144 to TC-148 (`server/test/entry-edit.test.js`) and TC-149 to TC-151 (`client/test/entry-edit.spec.js`, 375 px and 1280 px) are written and pass; TC-08 audits `PATCH` and `DELETE /api/goals/:id/entries/:entryId`. Results and the tested commit are in the #154 PR. The calendar colour step of AC-13.9 is not run: F-12 (#156) is not merged; TC-122 (F-12) can use these routes once #154 merges. Issue #156 then ran TC-122 and added the calendar colour step to TC-150; both pass.
- FR-18 (F-14, Issue #153): TC-39 (`server/test/progress-rules.test.js`), TC-152 to TC-155 and TC-157 (`server/test/goal-change.test.js`), TC-156 (`server/test/goal-target-migration.test.js`), TC-158 and TC-159 (`client/test/goal-change.spec.js`, 375 px and 1280 px) are written and pass; results and the tested commit are in the #153 PR. TC-154 (d) (whole minutes on a `TIME` goal) and the "= 7 h" hint (TC-158, `TIME` part) were added after #168 merged, in the same PR (ADR 0093). TC-123 (F-12) can now use the target versions.
- Open points that change a row if answered differently: SRS A-1 (FR-12), A-2 (FR-06 to FR-08), A-3 (FR-15, FR-16), A-11 (FR-11); and O-1 to O-8 in `docs/features.md`.

## Approved Changes

| Date | Change | Affected IDs | Approved by |
|---|---|---|---|
| 2026-11-07 | No new Sprint 3 summary feature. Progress (F-09) and the calendar colours (F-12) cover the "summaries" named in ADR 0021 and SRS 1.2. Sprint plan open point O-1 | F-09, F-12, FR-12, FR-16 | phittayanan and projectnewy (PR #26 review) |
| 2026-11-07 | FR-08 (Retire template, with the retire part of BR-08) moves from Sprint 1 to Sprint 2; Retire is hidden in Sprint 1. Sprint 1 is the handout slice | FR-08, FR-06, BR-08 | phittayanan and projectnewy (PR #21 review, PR #22 open point O-4) |
| 2026-11-07 | FR-15 (calendar and side panel) and FR-16 with BR-15 move from Sprint 1 to Sprint 2 | FR-15, FR-16, BR-15 | phittayanan and projectnewy (PR #21 review) |
| 2026-11-07 | FR-23 added: a Participant's request to create, edit or retire a template is refused with 403 and changes nothing | FR-23, BR-09 | phittayanan and projectnewy (PR #21 review) |
| 2026-11-07 | No streak in the Sprint 2 side panel (number box only); the streak comes in Sprint 3 (FR-20, ADR 0021). A-4 decided: a goal's daily target is above 0 and not above the template's maximum | FR-15, F-11, FR-20, F-16, A-4 | phittayanan and projectnewy (PR #23 review, PR #25) |
| 2026-11-27 | Lab 7: BR-04 changes from one entry per goal per day to several entries with a day total not above the template maximum; BR-07 judges the day total (ADR 0061) | BR-04, BR-07, FR-11, FR-12, F-08, F-09 | projectnewy decided (Issue #139); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119) |
| 2026-11-27 | Sprint 2 calendar contracts: template kind Count or Time (Time in whole minutes); phone centre box and kind inputs; month arrows, Monday first; colour edge cases with today live; List grouped by day; one `GET /api/calendar` endpoint (`GET /api/entries?month` dropped). ADR 0063 to ADR 0072. After the PR #167 review: first page `/calendar` with the goals page kept (ADR 0073); nothing saved at +0 by the counter or bar (ADR 0074); Time in hours and minutes on every screen (ADR 0065) | FR-05, FR-07, FR-10, FR-11, FR-15, FR-16, FR-19, BR-15; F-03, F-04, F-07, F-08, F-11, F-12, F-15 | phittayanan (Issue #151); projectnewy agreed to ADR 0064 in the [review of d4c72cb](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087108343) and approved the rest in the [review of 5cb03fd](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087285792) of PR #167 |
| 2026-11-27 | Sprint 2 rules contracts: permanent retire; value-only entry edit, delete with confirmation, controls on the goals page and day box, day cap on edit and delete; target change for goals not ended, in a new `GoalTarget` table with `daily_target` kept. ADR 0075 to ADR 0084 | FR-08, FR-17, FR-18, BR-04, BR-07, BR-11, BR-12; F-03 to F-09, F-11, F-13, F-14 | projectnewy (Issue #150); phittayanan agreed in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171 |
| 2026-11-27 | Issue #153: target versions are deleted with their goal (ADR 0092); the `TIME` whole-minutes check of a target change joins the #153 PR after #168 merges (ADR 0093) | FR-18, F-14 | phittayanan chose both; projectnewy agreed in the [review of 136c4b3](https://github.com/phittayanan/habit-tracker/pull/176#pullrequestreview-6089019427) of PR #176 |
| 2026-11-27 | Sprint 3 contracts: one removable reminder per goal that has not ended, on the goals page; no current streak for an ended goal; current streak on the goals page and today's calendar cards; goal detail page as a short summary. ADR 0086 to ADR 0091 | FR-20, FR-21, BR-13, BR-14; F-16, F-17 | projectnewy (Issue #157); phittayanan agreed in the [review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219) of PR #174 |
| 2026-11-27 | Issue #155: F-11 returns `state: null` and shows no day colour, sign or chip; Issue #156 builds them (F-12). TC-117 and the List step of TC-110 run in #156 (ADR 0097) | FR-15, FR-16; F-11, F-12, F-15; AC-11.10, AC-11.11 | phittayanan (Issue #155); projectnewy approved PR #180 ([review of 7e83f0a](https://github.com/phittayanan/habit-tracker/pull/180#pullrequestreview-6090324352)) |
| 2026-11-27 | Issue #158: a reminder is deleted with its goal (ADR 0099); #158 is blocked by #155 and TC-43's calendar step passes after #155 merges (ADR 0100) | FR-21, F-17, AC-17.1, TC-43 | phittayanan chose both; projectnewy approved PR #183 ([review of 3714141](https://github.com/phittayanan/habit-tracker/pull/183#pullrequestreview-6096383972)) |
| 2026-11-27 | Issue #154: an unsaved entry edit in the day box asks "Discard the edit to …?" only when the value changed (ADR 0101, F-13 OP-13.4) | FR-17; F-13; AC-13.9; TC-150 | phittayanan (Issue #154); projectnewy approved PR #184 ([review of 840ba16](https://github.com/phittayanan/habit-tracker/pull/184#pullrequestreview-6091416154)) |
| 2026-11-27 | Issue #156: "+ New goal" also above the calendar (ADR 0102); the desktop panel stays with the List (ADR 0103); a List day with no entry shows only "No entries" (ADR 0104); the chosen day is marked by a thick border (ADR 0105) | FR-16, FR-19, FR-10; F-12, F-15; AC-12.4, AC-15.1 to AC-15.3 | projectnewy (Issue #156); phittayanan agreed in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) of PR #185 |
