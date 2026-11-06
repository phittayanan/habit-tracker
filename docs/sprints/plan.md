# Sprint Plan

Part D of Deliverable 1 (Issue #7). The plan splits the product baseline across the three course sprints. It is built from merged documents only: the sprint column of `docs/features.md`, the FR sprints and A-3 in `docs/srs.md`, the planned tests in `docs/traceability.md`, `docs/system-sds.md` and the ADRs. It adds no feature, requirement or scope. The handout asks for each sprint's goal, feature IDs, dependencies and completion outcome, covering the whole baseline between them (`docs/assignment.md` 4.3, Part D), and for the scope of Sprint 1 (rubric, 4.1). Who does which Issue is not set here (ADR 0036 gives each Issue one assignee). Points the documents do not settle are in "Open points"; the answers from review round 1 are in "Decisions from review round 1".

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

The team keeps one `staging` for all sprints and asks the TA to confirm (SRS T-1; PR #26 review, O-5).

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

**Tests planned.** TC-01 to TC-13, TC-16 to TC-18, TC-20 to TC-35, TC-44 to TC-48, TC-50 to TC-52 and TC-53 to TC-61 (NFR-07 documented, NFR-09 run locally; TC-53 to TC-61 were added by the F-07 to F-10 contracts, Issue #28). The negative and boundary cases include TC-02, TC-05, TC-06, TC-10, TC-13, TC-17, TC-18, TC-21, TC-24 to TC-30, TC-33 and TC-34. AC are written in each feature's contract (Part E, `docs/sprints/sprint-1/`); until then the AC column of the traceability matrix says "Part E".

**Completion outcome.** The increment the handout requires is on `main` with documented local setup (`docs/assignment.md` 4.2):
- a full journey through the UI, the API and the database: a Manager creates a template, a Participant sets a goal, records an entry and reads the saved progress;
- login, logout and current-user identity for the two roles;
- a business-rule rejection (for example a future-dated entry or a second entry for a day) and a forbidden operation (a Participant creating a template, or one Participant reading another's goals), both refused by the backend;
- automated tests for the rules, persistence and access restrictions, with the results linked to the released commit;
- Issues, branches, teammate-reviewed PRs and a reviewed release PR from `staging` into `main`, tagged `v1.0`.

**Feasibility.** Nine features in under two days is tight, so the Sprint 1 build is grouped into five Issues, in the build order above (PR #26 review):

| Issue | Features |
|---|---|
| Auth | F-01, F-02 |
| Template | F-03, F-04, F-06 |
| Goal | F-07 |
| Entry | F-08 |
| Progress and privacy | F-09, F-10 |

*Cut line.* If the team is behind on Saturday evening, cut in this order: F-04 first, then F-09 shown as a plain number. Always keep login, the two roles, the tested rule and a finished journey. Any cut is recorded in "Approved Changes" in `docs/traceability.md`.

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

**Also in Sprint 3.** NFR-08 hardening (SRS 5.1), the NFR rechecks in SRS 5.1, and the handout's remaining Sprint 3 work: integration, failure handling, usability, authorization, regression tests and defect fixes (`docs/assignment.md` 3.4). None of these has a feature ID; they stay a note, with a tracking Issue in Sprint 3 (O-2 below).

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
- Lab 5 (deployment to GCP, due 15 Nov), Lab 6 (22 Nov) and Lab 7 (29 Nov) all fall inside Sprint 2 (`docs/assignment.md` 1), which already holds six features. The Sprint 2 date, 29 Nov, also holds the Sprint 3 contracts and working progress (`docs/assignment.md` 5.2). Lab work may be part of a sprint, but its evidence is kept apart from unrelated feature work (`docs/assignment.md` 3.5, GWS §8.3).
- The 1 to 11 Dec exam period falls inside Sprint 3. The handout says not to leave the main workflows for the last two days (`docs/assignment.md` 5.2).
- Moving a required feature to a later sprint just to mark one complete needs approved scope change (`docs/assignment.md` 5.2). The plan records any change in `docs/traceability.md` "Approved Changes".

## Decisions from review round 1

Answered by the owner ("all yes") to the partner's review of PR #26. Source for each: that review.

- **O-1 Summaries in Sprint 3.** No new summary feature. Progress (F-09, FR-12) and the calendar colours (F-12, FR-16) cover it. Recorded as an approved change in `docs/traceability.md`.
- **O-2 Hardening has no feature ID.** It stays a note in Sprint 3 (see "Also in Sprint 3"). A tracking Issue for it is opened in Sprint 3.
- **O-3 Sprint 3 holds two features.** The split stays. Watch Sprint 2: six features, with Labs 5 to 7 in the same weeks (see Risks).
- **O-4 Owners.** Owners are set in the Issues (ADR 0036), not in the plan.
- **O-5 Branch per sprint.** One `staging` for all sprints; the team asks the TA (SRS T-1).

## Open points for the students

- **O-6 Open points that still change a row.** SRS A-1 (FR-12), A-2 (FR-06 to FR-08), A-3 (FR-15, FR-16) and A-11 (FR-11); features O-1 to O-8. Not decided here.
