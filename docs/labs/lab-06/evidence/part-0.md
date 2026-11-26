<!-- Lab 6 evidence (Issue #109). Names and student IDs are placeholders filled from a file outside Git at build time (see build.mjs). -->

# Part 0: Team, releases, decisions and contents

**CPE 334 Lab 6, independent user acceptance testing and defect management. Section 31, group EN-010_P8.** Project: Theme 8, Habit and Activity Tracking System (a habit programme with Program Managers and Participants).

| Our team (both students) | Student ID | GitHub |
|---|---|---|
| {{STUDENT_1_NAME}} | {{STUDENT_1_ID}} | [phittayanan](https://github.com/phittayanan) |
| {{STUDENT_2_NAME}} | {{STUDENT_2_ID}} | [projectnewy](https://github.com/projectnewy) |

| Partner team "Habit and Activity Tracker" | GitHub |
|---|---|
| {{PARTNER_1_NAME}} | [asamapornch](https://github.com/asamapornch) |
| {{PARTNER_2_NAME}} | [warunwora](https://github.com/warunwora) |

## Our product (we are the Product Team)

| Item | Value |
|---|---|
| Repository | <https://github.com/phittayanan/habit-tracker> (public) |
| Deployed URL | <https://habit-tracker-rfi4eg2u4q-as.a.run.app> |
| Sprint 1 scope | F-01 to F-04 and F-06 to F-10: login, role protection, template create and edit, template view, goals, daily entries, progress, privacy. No Sprint 2 or 3 feature |
| Release tested by the partner | Tag `v1.3`, commit `50f5605d266d881b4afba3f8ac96d40882f26fd2`, Cloud Run revision `habit-tracker-00006-nj6`, page label `build 50f5605` |
| Corrected release, retested by the partner | Tag `v1.4`, commit `056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636`, Cloud Run revision `habit-tracker-00007-7pd`, page label `build 056ee5c` |
| Independent UAT testers | {{PARTNER_1_NAME}} and {{PARTNER_2_NAME}} (partner team) |
| **Final UAT decision (theirs)** | **Accepted, no blocking conditions**, 2026-11-26 (record AD-1 in the Appendix) |

## The partner's product (we are the UAT Team)

| Item | Value |
|---|---|
| Repository | <https://github.com/asamapornch/habit-activity-tracker> (public) |
| Deployed URL | <https://s65da36e2-4d7hbszvwq-as.a.run.app> |
| Release tested | Tag `v1.0-sprint1`, `main` at `0619c07db872a5bf1c7946301b4bfc40e9e477d2`, Cloud Run revision `s65da36e2-00009-b4s` (from their package; the app shows no version text), 2026-11-25 |
| Retest of their fixes | 2026-11-26. Details and the limits of the version claim are in Part D |
| Independent UAT testers | {{STUDENT_1_NAME}} and {{STUDENT_2_NAME}} (our team) |
| **Final UAT decision (ours)** | **Accepted with documented minor limitations**, 2026-11-26 (records AD-2 and the correction AD-3 in the Appendix) |

## Contents

| Part | Content | Pages | Evidence IDs |
|---|---|---|---|
| 0 | Teams, releases, decisions, this table | {{PAGES_0}} | none |
| A | Our product: UAT cases with requirement and criterion references, handoff, accounts, setup and reset, version | {{PAGES_A}} | UAT-01 to UAT-04 |
| B | Our independent execution on the partner's product: results, selected screenshots, evidence registers | {{PAGES_B}} | E-B1-01 to E-B1-34, E-B2-01 to E-B2-29, E-B2X-01 to E-B2X-09 |
| C | Findings: received about our product with triage; reports we sent; limitations | {{PAGES_C}} | partner findings #126, #127; our reports B1-01, B2-01 |
| D | Correction and retest: version table, RED and GREEN, code and test changes, review, CI, release, retests, acceptance decisions, contributions, AI use, limitations | {{PAGES_D}} | TC-81, TC-68, TC-71; run 45806178753 |
| Appendix | Contract criteria for the two defects; review texts; retest and acceptance records as posted on GitHub | {{PAGES_X}} | R-129, R-132, R-135, RT-126, RT-127, AD-1, RT-61, RT-60, AD-2, AD-3 |

**The two roles are kept apart.** Part A, the received findings in Part C and the correction chain in Part D concern **our** product. Part B, the reports we sent in Part C and our retest and decision in Part D concern the **partner's** product. All user testing was manual in a browser unless a line says otherwise; automated tests are labelled as automated. This PDF holds no password or token.
