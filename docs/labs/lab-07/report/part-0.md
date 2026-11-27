<!-- Lab 7 report (Issue #166). Names and student IDs are placeholders filled from a file outside Git at build time (see build.mjs). -->

# Part 0: Team, versions and contents

**CPE 334 Lab 7, software maintenance metrics and release readiness. Section 31, group EN-010_P8.** Project: Theme 8, Habit and Activity Tracking System (a habit programme with Program Managers and Participants).

| Student | Student ID | GitHub |
|---|---|---|
| {{STUDENT_1_NAME}} | {{STUDENT_1_ID}} | [phittayanan](https://github.com/phittayanan) |
| {{STUDENT_2_NAME}} | {{STUDENT_2_ID}} | [projectnewy](https://github.com/projectnewy) |

## The change, in one line

**Old rule (Sprint 1):** at most one entry per goal per day; a second one gets `409 ENTRY_ALREADY_EXISTS`; a day is met when that one entry reaches the daily target. **New rule:** several entries per goal per day, each inside the template range; the day total may not be above the template maximum (`409 DAILY_TOTAL_ABOVE_MAX`); a day is met when the day total reaches the daily target. Requirement IDs: BR-04, FR-11 (F-08) and BR-07, FR-12 (F-09).

## Versions and addresses

| Item | Value |
|---|---|
| Repository | <https://github.com/phittayanan/habit-tracker> (public) |
| Deployed URL | <https://habit-tracker-rfi4eg2u4q-as.a.run.app> |
| Sprint 1 baseline where the old rule was first delivered | tag `v1.0`, commit `64831f7` |
| Accepted Sprint 1 release (Lab 6) | tag `v1.4`, commit `056ee5c`, Cloud Run revision `habit-tracker-00007-7pd` |
| Pre-change implementation | `staging` at `c4ba749`, the merged revised contract, which the new tests were run against. The change request (A.1, section 2) names `a43070f`, the `staging` head when it was written; `a43070f` to `c4ba749` changes only `docs/`, and both have the same `server` and `client` code as `v1.4` |
| Tests seen failing on the old code | `761d87e` |
| Implementation | `bbf12a2`; reviewed head `d30cf8c` |
| Submitted main release | tag `v1.5`, commit `b8d5acb` |
| Deployed revision | `habit-tracker-00008-jgf`, page label `build b8d5acb`, serving 100 percent of traffic since 2026-11-27 16:02 |

The full version table, with the merge commits and the unrelated changes in the same release, is in Part B (B.4).

## Approval of the change

The sheet asks for instructor/TA approval before implementation. Issue #139 records: "Instructor/TA approval is not required, per the instructor's announcement changing the Lab 7 spec sheet" (Appendix CR-139); the change request adds "as relayed by projectnewy on 2026-11-27" (A.1). The team's own approval is the teammate review of the change request and contract in PR #143 before any test or code (Part A, A.4).

## Contents

| Part | Content | Pages | Evidence IDs |
|---|---|---|---|
| 0 | Team, versions, approval, this table | {{PAGES_0}} | none |
| A | Change request, versions, impact table, unchanged behaviour and its tests, order of work, contract review; ADR 0061 | {{PAGES_A}} | CR-139, R-143, C-143; old/new contract text in X.2 |
| B | Commits in order, RED and GREEN output, regression suites, code diff, review and integration, release, deployment, post-deployment checks with screenshots | {{PAGES_B}} | TC-29, TC-61, TC-82 to TC-90; R-146, R-149, R-147, R-162; run 45969767744; E-pre-release, E-PD-00 to E-PD-12 |
| C | Five metrics with definitions, windows, values and embedded source data; interpretation | {{PAGES_C}} | M1 to M5, S1 to S5 |
| D | Readiness checklist and decision, open items, technical debt, retrospective, contribution, AI use, limitations | {{PAGES_D}} | R-163, RA-142 |
| Appendix | Records as posted on GitHub (change request, reviews, comments), old/new contract text, test diff | {{PAGES_X}} | CR-139; R-143, R-146, R-149, R-147, R-162, R-163; C-143-1, C-143-2, C-143-4, C-143-5, C-146-1; RA-142 |

All times are Asia/Bangkok (+07:00) unless a line says UTC; the GitHub records in the Appendix are UTC. All data in this PDF is synthetic. This PDF holds no password or token.
