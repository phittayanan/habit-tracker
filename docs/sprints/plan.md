# Sprint Plan

Part D of Deliverable 1 (Issue #7). The plan splits the product baseline across the three course sprints. It is built from merged documents only: the sprint column of `docs/features.md`, the FR sprints and A-3 in `docs/srs.md`, the planned tests in `docs/traceability.md`, `docs/system-sds.md` and the ADRs. It adds no feature, requirement or scope. The handout asks for each sprint's goal, feature IDs, dependencies and completion outcome, covering the whole baseline between them (`docs/assignment.md` 4.3, Part D), and for the scope of Sprint 1 (rubric, 4.1). Who does which Issue is not set here (ADR 0036 gives each Issue one assignee). Points the documents do not settle are in "Open points".

## Goals

| Sprint | Goal | Source |
|---|---|---|
| 1 | The handout's example only: a Manager defines a template; a Participant selects it, sets a goal, records daily activity and sees computed progress, with the entry rules and access restrictions enforced. Login, logout, two roles and backend permissions come with it. | ADR 0020; SRS 1.2 |
| 2 | Goal changes and history: template retire, the month calendar with its side panel and colours, entry edit and delete, goal change, and the Calendar and List switch. | ADR 0021; SRS A-3 |
| 3 | Streaks and the stored reminder. Hardening, regression tests and defect fixes round it off. | ADR 0021; GWS §7 (`docs/assignment.md` 3.4) |

## Sprint Schedule

| Sprint | Due | What the handout says is due | Source |
|---|---|---|---|
| 1 | 8 Nov 2026 | A small working increment on `main`: authentication, permissions and persistence, with a normal workflow, a business-rule rejection and access restrictions, all with tests. It runs locally from documented setup. | `docs/assignment.md` 3.4, 4.2 |
| 2 | 29 Nov 2026 | An integrated, tested increment of the major remaining workflows. Sprint 3 contracts, working progress and a remaining-work list are also due this day. | `docs/assignment.md` 3.4, 5.2 |
| 3 | 13 Dec 2026 | Remaining features, integration, failure handling, usability, authorization, regression tests and defect fixes. Released. | `docs/assignment.md` 3.4 |

The sprint staging branch question (one `staging` for all sprints or one per sprint) is open as SRS T-1.

## Scope per Sprint

Feature IDs and FR/BR/NFR links come from `docs/features.md`. Test IDs (`TC-nn`) come from `docs/traceability.md`; they are provisional names and no test is written or run yet.

### Sprint 1 (due 8 Nov 2026)

**Goal.** See Goals above.

| Feature | Requirements | Depends on |
|---|---|---|
| F-01 Login, logout and session | FR-01 to FR-04, NFR-01, NFR-04 | none |
| F-02 Role layout and endpoint protection | FR-22, NFR-02 | F-01 |
| F-03 Template creation and Manager list | FR-05, FR-06, BR-03 | F-01, F-02 |
| F-06 Participant template view and write refusal | FR-09, FR-23, BR-09 | F-01, F-02, F-03 |
| F-07 Goal creation | FR-10, BR-05, BR-06 | F-03, F-06 |
| F-04 Template edit | FR-07, BR-08 (edit part) | F-03, F-07 |
| F-08 Daily entry recording | FR-11, BR-01 to BR-04, BR-06 | F-07 |
| F-09 Progress (days met) | FR-12, BR-07 | F-08 |
| F-10 Participant data privacy | FR-13, FR-14, BR-10, NFR-03 | F-01, F-07, F-08 |

The rows run in build order, taken from the Depends-on column. F-04 follows F-07 because refusing an edit once a goal uses the template needs a goal to exist (features O-6).

**Sprint 1 scope.**
- In: the nine features above, plus NFR-05 to NFR-09 as they apply to the Sprint 1 screens and the local setup (features, cross-cutting table). Sprint 1 has a plain goals page and no calendar (SRS A-3, SDS 4.1).
- Out of Sprint 1: the Retire control and FR-08 (features O-4, decided by the owner on 2026-11-07), entry edit and delete (FR-17), so a wrong same-day entry cannot be fixed yet (SRS A-11), Docker, CI and GCP (Lab 5, not D1; `docs/assignment.md` 4.2).
- Out of the project: the exclusions in SRS 1.3 and ADR 0004.

**Tests planned.** TC-01 to TC-13, TC-16 to TC-18, TC-20 to TC-35, TC-44 to TC-48 and TC-50 to TC-52 (NFR-07 documented, NFR-09 run locally). The negative and boundary cases include TC-02, TC-05, TC-06, TC-10, TC-13, TC-17, TC-18, TC-21, TC-24 to TC-30, TC-33 and TC-34. AC are written in each feature's contract (Part E, `docs/sprints/sprint-1/`); until then the AC column of the traceability matrix says "Part E".

**Completion outcome.** The increment the handout requires is on `main` with documented local setup (`docs/assignment.md` 4.2):
- a full journey through the UI, the API and the database: a Manager creates a template, a Participant sets a goal, records an entry and reads the saved progress;
- login, logout and current-user identity for the two roles;
- a business-rule rejection (for example a future-dated entry or a second entry for a day) and a forbidden operation (a Participant creating a template, or one Participant reading another's goals), both refused by the backend;
- automated tests for the rules, persistence and access restrictions, with the results linked to the released commit;
- Issues, branches, teammate-reviewed PRs and a reviewed release PR from `staging` into `main`, tagged `v1.0`.

### Sprint 2 (due 29 Nov 2026)

**Goal.** See Goals above.

| Feature | Requirements | Depends on |
|---|---|---|
| F-05 Template retire | FR-08, BR-08 (retire part) | F-03, F-07 |
| F-11 Month calendar and side panel | FR-15 | F-08, F-09 |
| F-12 Calendar day colours | FR-16, BR-15 | F-11 |
| F-13 Entry edit and delete | FR-17, BR-11 | F-08, F-09 |
| F-14 Goal change | FR-18, BR-12 | F-07, F-09 |
| F-15 Calendar and List history | FR-19 | F-11 |

All dependencies are Sprint 1 features or earlier Sprint 2 features, so Sprint 2 can start once Sprint 1 is released. F-12 and F-15 follow F-11. The side panel shows no streak until Sprint 3 (F-16; decided on PR #23).

**Data change.** Goal versions: each change of the daily target becomes a new row with an effective-from date, and the Sprint 1 `daily_target` column moves to the version rows (SDS 3.5, ADR 0011).

**Tests planned.** TC-14, TC-15, TC-19 (F-05), TC-36 (F-11), TC-37 (F-12), TC-38 (F-13), TC-39 (F-14), TC-40 (F-15), TC-49 (non-colour signal on the calendar). NFR-05 and NFR-06 are checked on the new screens, and NFR-02 and NFR-03 are rechecked on each new endpoint (SRS 5.1). Feature contracts with AC and test IDs are written before each feature is built (`docs/assignment.md` 3.5).

**Completion outcome.** All six Sprint 2 features are implemented, reviewed, integrated and verified against their contracts, with Sprint 1 behavior, login, backend permissions and record ownership still working (`docs/assignment.md` 5.2). The Participant's first screen is the month calendar. The Sprint 2 release is on `main`. By the same date the Sprint 3 contracts, working progress on at least one Sprint 3 workflow or rule, and a remaining-work list are due (`docs/assignment.md` 5.2).

### Sprint 3 (due 13 Dec 2026)

**Goal.** See Goals above.

| Feature | Requirements | Depends on |
|---|---|---|
| F-16 Streaks | FR-20, BR-13 | F-08, F-13 |
| F-17 Stored reminder | FR-21, BR-14 | F-07 |

F-16 needs F-13 (Sprint 2) because a streak is computed from entries after any edit or delete. F-17 depends only on F-07 and could start earlier. ADR 0021 names it as the small item done before 29 Nov.

**Also in Sprint 3.** NFR-08 hardening (SRS 5.1), the NFR rechecks in SRS 5.1, and the handout's remaining Sprint 3 work: integration, failure handling, usability, authorization, regression tests and defect fixes (`docs/assignment.md` 3.4). None of these has a feature ID; see O-2 below.

**Tests planned.** TC-41, TC-42 (F-16), TC-43 (F-17).

**Completion outcome.** Both features are implemented and verified against their contracts, all baseline features of the three sprints are complete, and the final release is on `main` (`docs/assignment.md` 3.4, 6.2).

### Coverage check

| Sprint | Features | FR covered |
|---|---|---|
| 1 | F-01, F-02, F-03, F-04, F-06, F-07, F-08, F-09, F-10 | FR-01 to FR-07, FR-09 to FR-14, FR-22, FR-23 |
| 2 | F-05, F-11, F-12, F-13, F-14, F-15 | FR-08, FR-15 to FR-19 |
| 3 | F-16, F-17 | FR-20, FR-21 |

That is 17 features and FR-01 to FR-23, each in one sprint, matching the sprint column of `docs/features.md`. FR-23 is a Sprint 1 requirement, but its retire refusal (TC-19) can only run in Sprint 2 (features O-5).

## Risks

- Sprint 1 is due 8 Nov and no code exists yet (ADR 0020 "Why"). The slice is the handout's example only, to avoid needing TA agreement.
- F-04 cannot be tested without F-07, so the Sprint 1 build order must put F-07 first (features O-6).
- The Sprint 2 date, 29 Nov, also holds the Sprint 3 contracts and working progress (`docs/assignment.md` 5.2). Lab 6 is due 22 Nov and Lab 7 on 29 Nov. Lab work may be part of a sprint, but its evidence is kept apart from unrelated feature work (`docs/assignment.md` 3.5, GWS §8.3).
- The 1 to 11 Dec exam period falls inside Sprint 3. The handout says not to leave the main workflows for the last two days (`docs/assignment.md` 5.2).
- Moving a required feature to a later sprint just to mark one complete needs approved scope change (`docs/assignment.md` 5.2). The plan records any change in `docs/traceability.md` "Approved Changes".

## Open points for the students

Nothing below is decided.

- **O-1 Summaries in Sprint 3.** ADR 0021 and SRS 1.2 name "summaries" in Sprint 3, but no feature or FR is a summary: progress (F-09, FR-12) is in Sprint 1. Is a Sprint 3 summary feature wanted? If so it needs an SRS requirement first.
- **O-2 Hardening has no feature ID.** The handout's Sprint 3 work (failure handling, usability, regression tests, defect fixes) and NFR-08 hardening are not features. Should the plan give them IDs, or stay as a note?
- **O-3 Sprint 3 holds two features.** F-16 and F-17 are the only Sprint 3 features. Whether to move any Sprint 2 feature later, or keep the split, is a team decision under ADR 0021. The plan keeps the merged allocation.
- **O-4 Owners.** The plan assigns no one. The handout asks for owners only in the D2 remaining-work table (`docs/assignment.md` 5.1, Part C); ADR 0036 says each Issue has one assignee.
- **O-5 Branch per sprint.** One `staging` for all sprints or one per sprint (SRS T-1, ADR 0001).
- **O-6 Open points that still change a row.** SRS A-1 (FR-12), A-2 (FR-06 to FR-08), A-3 (FR-15, FR-16) and A-11 (FR-11); features O-1 to O-8.
