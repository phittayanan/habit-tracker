# Release readiness of `v2.1` and plan to 13 December

Deliverable 2 Part E, [Issue #160](https://github.com/phittayanan/habit-tracker/issues/160), records Issue [#199](https://github.com/phittayanan/habit-tracker/issues/199). Values read from GitHub and the repository on 2026-11-28. **The decision in section 2 and the plan in section 3 are the students'.** The evidence tables and the first draft of the plan were written by Claude Code.

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
| OBS-1 has no Issue | It can be forgotten | projectnewy opens its Issue and it is fixed before the final release (section 3) |
| UI and usability are not good enough yet for people outside the team (phittayanan, [review of 6230d71](https://github.com/phittayanan/habit-tracker/pull/200)) | The app is not ready for real users | A "UI and usability for real users" part of #27 (section 3) |
| Test data on the running app | Test templates and goals show in the demo accounts and cannot be deleted in the app | Say so in the demo and the report |
| The running service and database cost money while kept for grading | Budget | Keep running until the end of grading, then follow [deployment.md section 9.3](../labs/lab-05/deployment.md) |

## 2. Readiness decision

**READY for the Deliverable 2 scope:** Sprint 1, Sprint 2 and F-17 as released in `v2.1`.

**Not ready for real users yet:** the UI and usability are not good enough for people outside the team, and F-16 is not built.

Decided by phittayanan (proposed in the [review of 6230d71](https://github.com/phittayanan/habit-tracker/pull/200)) and projectnewy (agreed on 2026-11-28, as projectnewy told Claude Code). Date: 2026-11-28.

Facts that bear on it: the automated suites and the checks listed above passed, with no failed check; the limits in the records were not checked on the deployed app.

## 3. Plan to 13 December 2026

**Course dates.** Project Deliverable 2 is due 29 November 2026 23:59 and the Final Project Delivery 13 December 2026 23:59, both read on LEB2 (Assessment Activity) by phittayanan on 2026-11-28, about 16:00. LEB2 does not list the final examination period: "1 to 11 December" comes from the course handout and is **not verified**. The handout says not to leave the main workflows for the last two days.

**Order of the remaining work (agreed).**

1. Make the app ready for real users: F-16, UI and usability, OBS-1 and other defects.
2. The final release, then the report and the video on that version.
3. A habit-helper agent comes last, as an optional add-on with its own Issue, contract and ADR, started only after the ready-for-users release. It is not part of the required scope, and nothing about its design is decided here.

**Owners, reviewers and the order** were proposed by phittayanan in the [review of 6230d71](https://github.com/phittayanan/habit-tracker/pull/200) and agreed by projectnewy. **The dates between 29 November and 13 December are the team's own targets, not course dates.** Claude Code drafted them (UI and usability follows the #27 date) and projectnewy accepted them; phittayanan confirms them by reviewing this change.

| Work | Requirement / AC / tests | Owner | Reviewer | Depends on | Next action | Target date |
|---|---|---|---|---|---|---|
| Sprint 1 continuity and change register with the `v2.1` re-run ([#159](https://github.com/phittayanan/habit-tracker/issues/159), PR #186) | D2 Part A | projectnewy | phittayanan | #160 | Fill in J-1 to J-7, resolve the conflict, ask for review | 29 Nov |
| Current documents, status tables and D2 PDF ([#161](https://github.com/phittayanan/habit-tracker/issues/161)) | D2 Parts D and submission | phittayanan | projectnewy | #159, #160 | Update the documents; each student adds their ID only in the PDF | 29 Nov |
| Windows job as a required check ([#194](https://github.com/phittayanan/habit-tracker/issues/194)) | CI | phittayanan | projectnewy | `v2.1` (done) | Change the `staging` ruleset and record it | 30 Nov |
| OBS-1, the message that stays after a discard | F-11 | projectnewy | phittayanan | none | Open its Issue by this date; fix it before the final release | 30 Nov (Issue) |
| F-16 streaks: open the code Issue | FR-20, BR-13 | phittayanan | projectnewy | contract (#157) | Create the Issue | 30 Nov |
| F-16 streaks: tests, code, review | AC-16.1 to AC-16.9; TC-41, TC-42, TC-160 to TC-166 | phittayanan | projectnewy | F-08, F-09, F-11, F-13, F-14 (built) | Failing tests first, then code | 8 Dec |
| UI and usability for real users, a new part of [#27](https://github.com/phittayanan/habit-tracker/issues/27) | no requirement ID yet; its Issues define the scope | shared; projectnewy splits #27 | the other student | the split of #27 | Write what "ready for people outside the team" must include, as Issues; ask before any UI design decision | 10 Dec |
| Hardening ([#27](https://github.com/phittayanan/habit-tracker/issues/27)): failure handling, authorization, regression tests, defect fixes; NFR-08 rule coverage and the NFR rechecks | NFR-08; SRS 5.1 | shared; projectnewy splits #27 | the other student | F-16 for the last rechecks | Split #27 now; keep each Issue small because of the exams | 10 Dec |
| Final release to `main`, deploy, backup if there is a migration, post-deployment and regression checks | FD; Lab 5 process | projectnewy | phittayanan | the rows above | Release PR, checks, tag | 11 Dec |
| README and setup summary | FD | to be agreed | the other student | final release | Update against the released tag | 13 Dec |
| Final report (FD PDF) | FD | phittayanan assembles | projectnewy | final release | Assemble against the released tag | 13 Dec |
| Demo video | FD (requires both presenting) | both | none | final release | Record on the released version | 13 Dec |
| Habit-helper agent (optional, last) | none yet | to be agreed | to be agreed | the ready-for-users release | Own Issue, contract and ADR first | not set |
