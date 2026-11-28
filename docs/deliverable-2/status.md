# Sprint 2 status, Sprint 3 status and remaining work

Deliverable 2 Parts B, C and D, [Issue #161](https://github.com/phittayanan/habit-tracker/issues/161). Owner: phittayanan. Reviewer and merger: projectnewy. Values read from the repository and GitHub on 2026-11-28 (Asia/Bangkok). Drafted by Claude Code; the layout and the meaning of each state were chosen by phittayanan on 2026-11-28.

**DRAFT.** PR #200 (Issue #199, part of #160: the `v2.1` record, the readiness decision and the plan to 13 December) is merged into `staging` (`e087c29`) and used below. Places still marked **PENDING** wait for PR #186 (Issue #159, Part A).

## States

| State | Meaning |
|---|---|
| planned | The contract (AC and planned tests) exists; no code Issue is started |
| in progress | The code Issue is started; its PR is not merged |
| implemented | Merged into `staging` |
| tested | Its planned tests pass on the version named |
| accepted | In a tag on `main` whose release PR the other student approved. No outside user test has run on `v2.0` or `v2.1` |

## Versions

| Version | Commit | Release PR | CI on the release (Linux) | Record |
|---|---|---|---|---|
| `v2.0`, Sprint 2 release | `f510619` | PR #189, author projectnewy, approved and merged by phittayanan | Deploy run [46053447699](https://github.com/phittayanan/habit-tracker/actions/runs/46053447699): server 151 passed of 151; browser 120 passed, 6 skipped | [v2.0 record](v2.0-release.md) |
| `v2.1`, Sprint 3 candidate (adds F-17) | `9b09bfe` | PR #198, author projectnewy, approved and merged by phittayanan | Deploy run [46124923270](https://github.com/phittayanan/habit-tracker/actions/runs/46124923270): server 161 passed of 161; browser 126 passed, 6 skipped | [v2.1 record](v2.1-release.md) |

The 6 skipped browser cases are phone-only or desktop-only cases skipped at the other width (`test.skip`); none is a disabled test.

## Sprint 2 completion

Every planned Sprint 2 feature is accepted in `v2.0` and still passes on `v2.1`. Per-AC test results: `docs/traceability.md`, "Results at `v2.1`".

| Feature | AC | Contract (Issue, PR) | Build Issue, PR (author → approver) | Executed verification | Result | Accepted in |
|---|---|---|---|---|---|---|
| F-05 Template retire | AC-05.1 to AC-05.8 | [F-05](../sprints/sprint-2/F-05-template-retire.md) (#150, PR #171) | #152, PR #179 (projectnewy → phittayanan) | TC-14, TC-15, TC-19, TC-140 to TC-143 in CI; deployed checks D-01 to D-05 on `v2.0` | Pass | `v2.0` |
| F-11 Month calendar and side panel | AC-11.1 to AC-11.13 | [F-11](../sprints/sprint-2/F-11-month-calendar.md) (#151, PR #167) | #155, PR #180 (phittayanan → projectnewy) | TC-36, TC-110 to TC-117, TC-120, TC-121, TC-130, TC-47, TC-48 in CI; deployed checks C-01, C-04 to C-12, C-27 on `v2.0` | Pass; observation OBS-1 (no Issue yet) | `v2.0` |
| F-12 Calendar day colours | AC-12.1 to AC-12.6 | [F-12](../sprints/sprint-2/F-12-day-colours.md) (#151, PR #167) | #156, PR #185 (projectnewy → phittayanan) | TC-37, TC-49, TC-117, TC-122 to TC-124 in CI; TC-49 markup review by phittayanan; deployed checks C-22 to C-24 on `v2.0` | Pass | `v2.0` |
| F-13 Entry edit and delete | AC-13.1 to AC-13.10 | [F-13](../sprints/sprint-2/F-13-entry-edit-delete.md) (#150, PR #171) | #154, PR #184 (phittayanan → projectnewy) | TC-38, TC-144 to TC-151 in CI; deployed checks C-13 to C-17 on `v2.0` | Pass | `v2.0` |
| F-14 Goal change | AC-14.1 to AC-14.9 | [F-14](../sprints/sprint-2/F-14-goal-change.md) (#150, PR #171) | #153, PR #176 (phittayanan → projectnewy, after one changes-requested review) | TC-39, TC-152 to TC-159 in CI; deployed checks C-20 to C-23 on `v2.0` | Pass | `v2.0` |
| F-15 Calendar and List history | AC-15.1 to AC-15.6 | [F-15](../sprints/sprint-2/F-15-calendar-list.md) (#151, PR #167) | #156, PR #185 (projectnewy → phittayanan) | TC-40, TC-121, TC-125, TC-126, TC-47, TC-48 in CI; deployed checks C-25, C-26 on `v2.0` | Pass | `v2.0` |
| Template kind Count or Time (revision of F-03, F-04, F-07, F-08; ADR 0064) | AC-03.8, AC-03.9, AC-04.8, AC-07.12, AC-07.13, AC-08.20, AC-08.21 | F-03, F-04, F-07, F-08 contracts (#151, PR #167) | #168, PR #173 (projectnewy → phittayanan) | TC-118, TC-119, TC-127 to TC-129, TC-131 in CI; deployed checks B-01 to B-03 on `v2.0` | Pass | `v2.0` |

No Sprint 2 feature was moved to Sprint 3.

## Sprint 3 status

| Feature | AC | Contract | State at `v2.1` | Evidence |
|---|---|---|---|---|
| F-16 Streaks | AC-16.1 to AC-16.9; TC-41, TC-42, TC-160 to TC-166 | [F-16](../sprints/sprint-3/F-16-streaks.md) (#157, PR #174) | **planned**: no code Issue, no test written | none |
| F-17 Stored reminder | AC-17.1 to AC-17.9; TC-43, TC-167 to TC-175 | [F-17](../sprints/sprint-3/F-17-stored-reminder.md) (#157, PR #174) | **accepted** in `v2.1` (#158, PR #183, phittayanan → projectnewy) | TC-43, TC-168 to TC-175 pass in CI on `9b09bfe`; TC-167 passed in projectnewy's review of PR #183; deployed checks R-01 to R-11 on `v2.1`: 11 of 11 passed ([v2.1 record](v2.1-release.md) section 5) |

F-17 is the Sprint 3 workflow that is implemented and tested for Deliverable 2.

**Readiness of `v2.1`** (decided by both students, 2026-11-28): ready for the Deliverable 2 scope; not ready for real users yet ([readiness-and-plan.md](readiness-and-plan.md) section 2).

## Remaining work

Owners, reviewers and target dates are the students' plan in [`readiness-and-plan.md`](readiness-and-plan.md) section 3. They are not repeated here, so there is one source; the last column names the plan row.

| Item | IDs | Status at `v2.1` | Remaining action | Owner and target date |
|---|---|---|---|---|
| F-16 streaks | FR-20, BR-13, AC-16.1 to AC-16.9, TC-41, TC-42, TC-160 to TC-166 | planned | Open the code Issue; failing tests first, then code, review, release | plan rows "F-16 streaks" |
| OBS-1, a rejected-entry message that stays on a calendar card | F-11 | observed on `v2.0`; no Issue | Open its Issue; compare with the F-11 contract; fix before the final release | plan row "OBS-1" |
| UI and usability for people outside the team | no requirement ID yet | not started | Define it as Issues under #27; ask the students before any UI decision | plan row "UI and usability for real users" |
| Hardening, NFR rechecks | NFR-02 to NFR-08; #27 | in progress through each feature's tests | Split #27 into Issues | plan row "Hardening" |
| Rule coverage from CI | NFR-08, TC-51 | local run only (100% line coverage of the rule files on `9b09bfe`) | Decide whether CI produces the coverage report that NFR-08 names | plan row "Hardening" (it names NFR-08 rule coverage) |
| Timed clean-clone run | NFR-07, TC-50 | last run in Lab 5 on `ad3300a` | Repeat on the final release | not in the plan yet |
| Outside user test on a Sprint 2 or Sprint 3 version | Sprint 2 and 3 AC | not run; last on `v1.3` and `v1.4` (Lab 6) ([readiness](readiness-and-plan.md) section 1) | The students decide whether one is run | not in the plan |
| Sprint 1 continuity on `v2.1` and the change register | J-1 to J-7; CR-nn | J-1 to J-7 run on the deployed `v2.1`: 7 of 7 passed ([v2.1 record](v2.1-release.md) section 5); register **PENDING**: PR #186 | Finish and merge PR #186 | plan row "Sprint 1 continuity and change register" |
| Final release, README, report, video | FD | not started | As in the plan | plan rows "Final release" to "Demo video" |
