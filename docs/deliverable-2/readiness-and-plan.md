# Release readiness of `v2.1` and plan to 13 December

Deliverable 2 Part E, [Issue #160](https://github.com/phittayanan/habit-tracker/issues/160), records Issue [#199](https://github.com/phittayanan/habit-tracker/issues/199). Values read from GitHub and the repository on 2026-11-28. **The decision in section 2 and the dates and owners in section 3 belong to the students. What is marked "proposed" was drafted by Claude Code and is not agreed yet.**

## 1. Readiness evidence

| Item | State | Evidence |
|---|---|---|
| Deployed version | `v2.1`, `9b09bfe`, revision `habit-tracker-00010-qsv`; the page shows `build 9b09bfe` | [v2.1 record](v2.1-release.md) sections 1 and 3 |
| Content | Sprint 1, Sprint 2 (F-05, F-11 to F-15, template kind) and the Sprint 3 feature F-17. F-16 is not built | [v2.1 record](v2.1-release.md) section 1 |
| Automated tests | Release CI: server 161 of 161, 0 skipped; browser 126 passed, 6 skipped (Linux). Server tests also 161 of 161 on Windows | v2.1 record sections 2 and 3 |
| Checks on the deployed app | `v2.1`: F-17 11 of 11, Sprint 1 journey 7 of 7. `v2.0`: 45 of 45 (not run again on `v2.1`). Done by Claude Code at projectnewy's request, with projectnewy signing in | [v2.1 record](v2.1-release.md), [v2.0 record](v2.0-release.md) |
| User tests by another team | Last run on `v1.3` and a retest on `v1.4` (Lab 6). Not run on `v2.0` or `v2.1` | [Lab 6 resolution](../labs/lab-06/resolution.md) |
| Data kept across the release | No difference except the new `reminder` field, `null` | v2.1 record section 4 |
| Defects | No open Issue describes a defect (open Issues read on 2026-11-28). One observation without an Issue: OBS-1, a rejected-entry message that stays on a calendar card after the draft is discarded (seen on `v2.0`) | [v2.0 record](v2.0-release.md) |
| Configuration and secrets | `deploy.yml`, `deploy/`, the Dockerfiles, `seed.js` and the app `package.json` and lock files did not change since `v2.0`. No secret is in these records | PR #198 and its review |
| Deployment and smoke test | Deploy run success; migration applied; smoke test passed | v2.1 record section 3 |
| Documentation | Release records are in `docs/deliverable-2/`. Not current yet: the README still names the Lab 7 release as the latest; the status lines in the SRS, features, SDS and traceability are the work of #161 | `README.md`; [#161](https://github.com/phittayanan/habit-tracker/issues/161) |

### Open items and risks

| Item | Risk | Proposed action |
|---|---|---|
| A rollback does not undo a migration | Going back to an older tag keeps the new tables; the older code does not know newer rules (see the v2.0 record) | Fix forward; keep a backup before each release with a migration |
| `server-tests-windows` is not a required check | A Windows failure does not block a merge | #194 |
| Not checked on the deployed app | Keyboard-only use, some cross-account API requests, concurrent requests, a service restart | Decide which to run before the final release (#27) |
| OBS-1 has no Issue | It can be forgotten | Decide whether to open a fix Issue |
| Test data on the running app | Test templates and goals show in the demo accounts and cannot be deleted in the app | Say so in the demo and the report |
| The running service and database cost money while kept for grading | Budget | Keep running until the end of grading, then follow [deployment.md section 9.3](../labs/lab-05/deployment.md) |

## 2. Readiness decision

**Decision: _to be made by the two students_** (READY or NOT READY, for which scope).

Decided by: _name_. Date: _date_. Reasons: _in the students' words_.

Facts that bear on it: the automated suites and the checks listed above passed, with no failed check; F-16 is not built; the limits in the records were not checked on the deployed app.

## 3. Plan to 13 December 2026 (proposed, not agreed)

**These dates have not been checked against LEB2.** Course dates in [assignment.md](../assignment.md): Deliverable 2 on 29 November; final examinations 1 to 11 December; final product, report and demo video on 13 December. The handout says not to leave the main workflows for the last two days.

| Work | Requirement / AC / tests | Owner | Depends on | Next action | Proposed date |
|---|---|---|---|---|---|
| Sprint 1 continuity and change register with the `v2.1` re-run ([#159](https://github.com/phittayanan/habit-tracker/issues/159), PR #186) | D2 Part A | projectnewy | #160 | Fill in J-1 to J-7, resolve the conflict, ask for review | 29 Nov |
| Current documents, status tables and D2 PDF ([#161](https://github.com/phittayanan/habit-tracker/issues/161)) | D2 Parts D and submission | phittayanan | #159, #160 | Update the documents; each student adds their ID only in the PDF | 29 Nov |
| Windows job as a required check ([#194](https://github.com/phittayanan/habit-tracker/issues/194)) | CI | phittayanan | `v2.1` (done) | Change the `staging` ruleset and record it | 30 Nov |
| Decide on OBS-1 | F-11 | to be agreed | none | Open a fix Issue, or record why not | 30 Nov |
| F-16 streaks: open the code Issue | FR-20, BR-13 | to be agreed | contract (#157) | Create the Issue with owner and reviewer | 30 Nov |
| F-16 streaks: tests, code, review | AC-16.1 to AC-16.9; TC-41, TC-42, TC-160 to TC-166 | to be agreed | F-08, F-09, F-11, F-13, F-14 (built) | Failing tests first, then code | 8 Dec |
| Hardening, split into Issues ([#27](https://github.com/phittayanan/habit-tracker/issues/27)): failure handling, usability, authorization, regression, defect fixes; NFR-08 rule coverage and the NFR rechecks | NFR-08; SRS 5.1 | to be agreed | F-16 for the last rechecks | Split #27 now; keep each Issue small because of the exams | 10 Dec |
| Final release to `main`, deploy, backup if there is a migration, post-deployment and regression checks | FD; Lab 5 process | to be agreed | all above | Release PR, checks, tag | 11 Dec |
| README, setup summary, final report and demo video | FD | to be agreed | final release | Update and record against the released tag | 13 Dec |
