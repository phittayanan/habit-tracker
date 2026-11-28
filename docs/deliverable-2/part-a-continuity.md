# Deliverable 2 Part A: Sprint 1 continuity and change status

Issue [#159](https://github.com/phittayanan/habit-tracker/issues/159). Owner: projectnewy. Reviewer and merger: phittayanan. Records read on 2026-11-28 (Asia/Bangkok), last with the repository at `staging` `e087c29`.

The candidate `v2.1` is released ([#160](https://github.com/phittayanan/habit-tracker/issues/160), closed on 2026-11-28), and the Sprint 1 journey was run on it (section 2). The run is also recorded in the [`v2.1` release record](v2.1-release.md).

## 1. Accepted Sprint 1 versions

| Version | Commit | What the records say |
|---|---|---|
| **`v1.0`** (annotated, 2026-11-10) | `64831f7a6e699d3f800738bd9b922af420f8b5ca` | The Sprint 1 release, and the accepted Sprint 1 tag named in Issue #159. Release [PR #61](https://github.com/phittayanan/habit-tracker/pull/61), approved by projectnewy |
| `v1.3` | `50f5605d266d881b4afba3f8ac96d40882f26fd2` | Sprint 1 with the Lab 5 changes. The partner team ran its user tests on this version ([Lab 6 resolution](../labs/lab-06/resolution.md) section 3.4) |
| `v1.4` | `056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636` | `v1.3` plus the fixes for #126 and #127. The [Lab 7 records](../labs/lab-07/release.md) call it the "Accepted Sprint 1 release (Lab 6)": the partner team decided **Accepted, no blocking conditions** on 2026-11-26 ([#130](https://github.com/phittayanan/habit-tracker/issues/130)). Its decision does not cover any later change |
| `v1.5` | `b8d5acbdcaf6b4e77185cf9f2c23b258dc0430a9` | Lab 7 maintenance release: one Sprint 1 rule changed (CR-09) |

**Results recorded for `v1.0`.**

- Before the release, on the candidate `03e039e` (same tree as `v1.0`), macOS: server 79 of 79 passed, browser 44 passed. Windows, Docker, CI and GCP were not run (tag message of `v1.0`).
- Repeated on 2026-11-13 for [Deliverable 1 Part F.3](../deliverable-1/rewrite/part-f.md): server 78 of 79, then 79 of 79 with the seed passwords in the shell (CR-17); browser 42 of 44, then 43 of 44 (CR-01).

## 2. Does the Sprint 1 journey still work on the candidate?

**Yes, with one limit on J-6: 7 steps run, 7 passed, 0 failed**, on the deployed app on 2026-11-28.

### 2.1 Candidate

| Item | Value |
|---|---|
| Tag and commit | annotated `v2.1` on `9b09bfef47733b365d1af9bb8aa4950f228f0d3c` (release [PR #198](https://github.com/phittayanan/habit-tracker/pull/198), approved by phittayanan) |
| Deployed | Cloud Run revision `habit-tracker-00010-qsv`, page label `build 9b09bfe` |
| CI and deploy | [run 46124923270](https://github.com/phittayanan/habit-tracker/actions/runs/46124923270): server 161 of 161 passed, 0 skipped; browser 126 passed, 6 skipped (tests written for one screen width only); deploy job succeeded, `ROLLBACK: false` |
| Server tests on Windows | [run 46123649846](https://github.com/phittayanan/habit-tracker/actions/runs/46123649846) on `d5f968b`, which has the same file tree as `9b09bfe`: 161 of 161 passed. No browser test ran on Windows in CI |

### 2.2 Journey

The journey comes from the goal of the [Sprint 1 overview](../sprints/sprint-1/README.md): a Manager defines a template; a Participant selects it, sets a goal, records daily activity and sees computed progress, with the entry rules and access restrictions enforced.

Two approved changes alter what a tester sees. A Participant now starts on `/calendar` and opens the goals page from there (ADR 0073). A day may hold several entries within the day-total maximum (ADR 0061).

**Who and how.** projectnewy typed every password. At projectnewy's request, Claude Code did the steps by script (Playwright) in a separate Chrome window with a temporary profile. Synthetic accounts and data only. The J-7 step had no guard against write requests; the record says it changed nothing but the logout.

| Step | Journey step and expected result | Actual on `v2.1` | Result |
|---|---|---|---|
| J-1 | A Manager signs in and creates a template with a unit and a range; it is listed | `manager1` created `PD-v21 Count` (Count, reps, 0 to 12): 201, listed as Active; the 11 older templates unchanged | Pass |
| J-2 | A Participant signs in, reaches the goals page, selects the template and creates a goal; it is listed | `participant1` created a goal (id 12), target 8, 28 to 29 November: 201, listed first, Active, `0 of 1 days met` | Pass |
| J-3 | The Participant records an entry for today; it is listed and the progress is computed from the day total | Entry 5: 201, listed, `Day total: 5 reps`, `0 of 1 days met` (5 is below 8) | Pass |
| J-4 | Rules are refused and nothing is stored: a value outside the template range, a future date, a total above the day maximum | 13: 400 `The value must be between 0 and 12.`; 29 November: 400 `The date cannot be after today.`; 8 more today: 409 `Only 7 reps left for today.`; stored entries unchanged after each | Pass |
| J-5 | After a reload and a new sign-in, the goal, entry and progress are still there | Goal 12, entry 5, day total 5 and `0 of 1 days met` still there after both | Pass |
| J-6 | Access: a Participant cannot create or edit a template; another Participant cannot read the goal (404); a Manager and an anonymous caller cannot read goals (403, 401) | `participant2`: no New, Edit or Retire on Templates; `/templates/new` not available; entries of goal 12: 404 `GOAL_NOT_FOUND`. `manager1` on goals: 403 `FORBIDDEN`. Signed out: 401 | Pass, **with a limit** (below) |
| J-7 | After logout, protected pages and requests need a new sign-in | `/goals`, `/calendar` and `/templates` showed the login page; signed-out reads of goals, calendar, templates and goal entries: 401 | Pass |

**Limit on J-6.** For "a Participant cannot create or edit a template", only the Participant's screens were checked on the deployed app. No create or edit request was sent as a Participant, so the server's refusal of those requests was not exercised in production. The release CI runs the automated tests; that is not a production result.

**Also not checked on the deployed app** in this run: keyboard-only use, data after a restart of the service, and `participant1`'s older entries after the checks (the older goals and their progress were read and were unchanged).

**Data added.** The template `PD-v21 Count` and `participant1`'s goal 12 with one entry stay on the app, which cannot delete them. Before any check data was added, the data read after the migration showed no difference from the reading before the release, apart from the new `reminder` field (`null`).

**Evidence.** [`v2.1` release record](v2.1-release.md), section 5. Screenshots with names that start `J-01` to `J-07` are kept outside Git by projectnewy.

### 2.3 Earlier user tests

These are history, not evidence for the candidate:

| Run | Version | Result | Source |
|---|---|---|---|
| Partner UAT-01 to UAT-04 and EXP-1 | `v1.3` | All PASS | [#130](https://github.com/phittayanan/habit-tracker/issues/130) |
| Partner retest of #126 and #127 | `v1.4` | 4 of 4 PASS; UAT-01 to UAT-04 not run again | [Lab 6 resolution](../labs/lab-06/resolution.md) section 3.4 |
| Lab 7 post-deployment checks | `v1.5` | 13 passed, 0 failed | [Lab 7 release](../labs/lab-07/release.md) section 4; [readiness](../labs/lab-07/readiness.md) section 2 |
| UAT-02 steps C8 and C9 only | `v1.5` | C8 saved; C9 showed the revised message | [UAT-02 revision note](../labs/lab-06/uat-cases/UAT-02-business-rules-and-boundaries.md) |

The partner's UAT-01 to UAT-04 were not run on `v2.1`.

## 3. Change and defect register

The register covers deployment, user-test and maintenance findings from Lab 5 to Lab 7, the related limitations listed in Deliverable 1, and two findings from the work on the `v2.0` and `v2.1` releases (CR-24, CR-25). IDs `CR-nn` belong to this register.

- **In section 3.1:** findings that led to a fix or an approved change.
- **In section 3.2:** limitations, debt and observations, with their current status.
- **Left out:** findings of pull request reviews that were fixed before merge (except the platform defects CR-02 and CR-10), reviews of Sprint 2 and Sprint 3 work, and our findings about the partner team's app.

"Released in" is the first tag that contains the fix.

### 3.1 Defects and changes

| ID | Source | Affected requirement or feature | Accepted decision | Status | Released in | Re-test outcome |
|---|---|---|---|---|---|---|
| CR-01 | [#62](https://github.com/phittayanan/habit-tracker/issues/62): the goals keyboard test TC-47/TC-48 failed on Windows, and intermittently on macOS; also in CI ([deployment.md](../labs/lab-05/deployment.md) 8.3) | NFR-05, NFR-06 checks on the goals form (test only) | Fix the test's keyboard steps; no application change ([PR #72](https://github.com/phittayanan/habit-tracker/pull/72)) | Resolved on Windows and CI. The macOS failures were not investigated (CR-18) | `v1.1` | Reviewer on Windows at `c065521`: the two cases passed, browser suite 44 of 44. CI [run 43182003625](https://github.com/phittayanan/habit-tracker/actions/runs/43182003625) green, 44 passed |
| CR-02 | Review of [PR #70](https://github.com/phittayanan/habit-tracker/pull/70) (Lab 5): a fresh clone on Windows could not start; `migrate` exited 255 because of CRLF line endings | NFR-07, local Docker setup | Force LF for shell scripts in `.gitattributes` | Resolved. An old clone keeps CRLF until the file is checked out again | `v1.1` | Reviewer at `6fe7b99`, Windows 11, fresh clone: `migrate` exited 0, health and ready answered, sign-in 200 |
| CR-03 | [#82](https://github.com/phittayanan/habit-tracker/issues/82), from the review of PR #81: the rollback runbook gave wrong guidance | Deployment procedure (Lab 5) | Correct which images can be a rollback target ([PR #83](https://github.com/phittayanan/habit-tracker/pull/83)) | Resolved (documents) | `v1.1` | Document check in the PR #83 review. A later rollback to a valid target passed its smoke test ([deployment.md](../labs/lab-05/deployment.md) 6.7, run 43463075320) |
| CR-04 | [#85](https://github.com/phittayanan/habit-tracker/issues/85): the runbook compared two image digests that are not equal, which gives a false mismatch | Deployment procedure (Lab 5) | Explain the index digest and the platform image digest ([PR #86](https://github.com/phittayanan/habit-tracker/pull/86)) | Resolved (documents) | `v1.2` | The PR #86 review matched the run digest, tag, commit and live build label; it did not open the Console |
| CR-05 | [#79](https://github.com/phittayanan/habit-tracker/issues/79), found while reviewing the deploy design: the seed overwrote edited demo templates on every deploy | Seed on every release; template data (F-03, F-04) | [ADR 0053](../adr/0053-seed-keeps-existing-templates.md): create demo templates only when missing; keep the password reset ([PR #92](https://github.com/phittayanan/habit-tracker/pull/92)) | Resolved | `v1.3` | TC-76 failed before the fix and passed after it (reviewer, local). No record was found of a check that a Manager's edit survives a later GCP release |
| CR-06 | [#74](https://github.com/phittayanan/habit-tracker/issues/74), found while reviewing the Deliverable 1 report; limitation 3 of Part F.6: a daily target could be below the template minimum | F-07, FR-10, BR-07, SRS A-4 | [ADR 0054](../adr/0054-goal-target-above-template-minimum.md): the target must be above the minimum; API only, existing goals unchanged ([PR #95](https://github.com/phittayanan/habit-tracker/pull/95)) | Resolved | `v1.3` | TC-78 failed before the fix and passed after it (reviewer, local); required checks green. Not run against the live URL ([Lab 5 Part 3](../labs/lab-05/evidence/part-3.md)) |
| CR-07 | Partner finding [#126](https://github.com/phittayanan/habit-tracker/issues/126); fix Issue [#128](https://github.com/phittayanan/habit-tracker/issues/128): a NUL character in the login username returned 500 | F-01, AC-01.2 | Accepted defect, minor ([PR #129](https://github.com/phittayanan/habit-tracker/pull/129)) | Resolved, closed | `v1.4` | TC-81 failed, then passed. Partner retest on `v1.4`: **PASS** (2026-11-26) |
| CR-08 | Partner finding [#127](https://github.com/phittayanan/habit-tracker/issues/127); fix Issue [#131](https://github.com/phittayanan/habit-tracker/issues/131): a NUL character in a template name or unit returned 500 | F-03 AC-03.1, AC-03.3; F-04 AC-04.1, AC-04.4 | Accepted defect, minor: answer 400 ([PR #132](https://github.com/phittayanan/habit-tracker/pull/132)) | Resolved, closed | `v1.4` | TC-68 and TC-71 failed, then passed. Partner retest on `v1.4`: **PASS** (2026-11-26) |
| CR-09 | Lab 7 change request [#139](https://github.com/phittayanan/habit-tracker/issues/139) ([record](../labs/lab-07/change-request.md)): with one entry a day and no edit, the rest of a day could not be added | BR-04, BR-07, FR-11, FR-12; F-08, F-09 | [ADR 0061](../adr/0061-multiple-entries-per-day.md): several entries a day, day total within the template maximum ([#143](https://github.com/phittayanan/habit-tracker/pull/143), [#146](https://github.com/phittayanan/habit-tracker/pull/146), release [#147](https://github.com/phittayanan/habit-tracker/pull/147)) | Released | `v1.5` | RED 21 failed, GREEN 149 passed. Post-deployment checks 13 passed, 0 failed ([release](../labs/lab-07/release.md) section 4) |
| CR-10 | Review of [PR #146](https://github.com/phittayanan/habit-tracker/pull/146#pullrequestreview-6084399396): TC-89 passed CI but failed on Windows | AC-08.18 check (migration test) | Fix before merge (`f8736c9`); the CI gap is CR-12 | Resolved | `v1.5` | Reviewer on Windows at `d30cf8c`: server 99 of 99, browser 50 passed |
| CR-11 | Lab 7 open item, [#165](https://github.com/phittayanan/habit-tracker/issues/165): UAT-02 step C9 still expected the old one-entry message | UAT-02, BR-04 | Revise the expected message and keep the Lab 6 result as history ([PR #175](https://github.com/phittayanan/habit-tracker/pull/175)) | Resolved (documents) | `v2.0` | C8 and C9 run on the deployed `v1.5` (2026-11-27): the revised message appeared. The other steps were not run again. The same day-total refusal appeared on `v2.1` (J-4) |
| CR-24 | [#192](https://github.com/phittayanan/habit-tracker/issues/192): TC-07 timed out at 375 px in a CI run of PR #183 ([run 46044082021](https://github.com/phittayanan/habit-tracker/actions/runs/46044082021)) | Browser test TC-07 (F-02, login helper); no application change | Wait for the logout to finish before the next login ([PR #193](https://github.com/phittayanan/habit-tracker/pull/193)). Cause: the login page opened while the session was still live, so the app redirected | Resolved | `v2.1` | With a delayed logout, TC-07 failed before the fix and passed after it. Reviewer on Windows: 10 of 10 on repeat, server 151 of 151, browser 120 passed, 6 skipped. `v2.1` release CI passed |

### 3.2 Limitations, debt and observations

"No decision recorded" means that no decision was found in the records read for this register.

| ID | Source | Affected requirement or feature | Accepted decision | Status | Fix release | Re-test outcome |
|---|---|---|---|---|---|---|
| CR-12 | Lab 7 debt 1 ([readiness](../labs/lab-07/readiness.md) section 3): CI runs on Linux only | NFR-09; CI | Add a Windows server-test job ([#164](https://github.com/phittayanan/habit-tracker/issues/164), [ADR 0106](../adr/0106-windows-ci-postgres.md), [PR #197](https://github.com/phittayanan/habit-tracker/pull/197)); make it required on `staging` after `v2.1` ([#194](https://github.com/phittayanan/habit-tracker/issues/194)) | Resolved for server tests. Required on `staging` only, not on `main`; no browser tests on Windows | Job in `v2.1`; the required check is a repository setting made after the release | The job failed on the old TC-89 ([run 46120341678](https://github.com/phittayanan/habit-tracker/actions/runs/46120341678)) and passed on newer code, 161 of 161 ([run 46120992781](https://github.com/phittayanan/habit-tracker/actions/runs/46120992781)); see [deployment.md](../labs/lab-05/deployment.md) 8.4 |
| CR-13 | Lab 7 debt 2 and [release](../labs/lab-07/release.md) section 3: a rollback to `v1.4` after the migration is not safe | BR-04; deployment | Fix forward; write a runbook and back up before a release with a migration | **Open.** Backups were taken before `v1.5`, `v2.0` and `v2.1`; no fix-forward runbook was found. The [`v2.1` readiness review](readiness-and-plan.md) keeps "fix forward" and a backup before a release with a migration | Pending | Not applicable; no rollback of `v1.5`, `v2.0` or `v2.1` is recorded |
| CR-14 | Lab 7 debt 3: business rules are checked by hand after a deploy | Smoke test | Add one API check of the day-total rule (priority low) | **Open**; no Issue found, and `deploy/` has not changed since `v1.5` | Pending | Not run |
| CR-15 | Lab 7 [release](../labs/lab-07/release.md) sections 3 and 4: entries saved during the migration window, and existing rows against a reading taken before, were not checked | Data after the `v1.5` migration | No decision recorded | **Not verified** | None | Not run |
| CR-16 | [Lab 5 Part 1](../labs/lab-05/evidence/part-1.md) and the PR #95 review: a login timeout at 375 px in the browser suite, once in each of two first CI runs | Browser tests (TC-07 area) | Accepted for PR #95; open an Issue if it appears again | **Open**, cause not known | None | Both passed on the next run of the same code; this does not show the cause is fixed. CR-24 later explained one TC-07 timeout; it is not shown that the same cause produced these |
| CR-17 | Deliverable 1 Part F.6, limitation 1: TC-44/45 fails when the seed passwords are in `server/.env`, as the README says | AC-01.8 test | No decision recorded | **No fix found**; no Issue. Since `v1.0` the only change to `auth.test.js` adds TC-81 | None | Not run again in that setup for this register |
| CR-18 | Deliverable 1 Part F.6, limitation 2: TC-47/48 failed in 3 of 10 executions on macOS | Browser test | No decision recorded | **Not investigated**; whether the CR-01 fix covers it is not known | None | No macOS re-test of this cause recorded |
| CR-19 | Deliverable 1 Part F.6, limitation 4 (SRS A-11): a wrong entry cannot be corrected | FR-17; F-13 | Build in Sprint 2 | Resolved, released ([PR #184](https://github.com/phittayanan/habit-tracker/pull/184)) | `v2.0` | Production checks C-13 to C-18 on `v2.0` (edit, refused edits, delete) passed ([v2.0 record](v2.0-release.md)). Edit and delete across accounts were not tried there. Not run again on `v2.1` |
| CR-20 | Deliverable 1 Part F.6, limitation 5: template retire is not built | FR-08; F-05 | Build in Sprint 2 | Resolved, released ([PR #179](https://github.com/phittayanan/habit-tracker/pull/179)) | `v2.0` | Production checks D-01 to D-05 on `v2.0` passed ([v2.0 record](v2.0-release.md)). A new goal on a retired template was not tried through the API there. Not run again on `v2.1` |
| CR-21 | Deliverable 1 Part F.6, limitation 6: repeated failed logins are not limited | F-01 | Not in Sprint 1 scope | Listed as a limitation; no later decision recorded | None | Not applicable |
| CR-22 | Review of [PR #132](https://github.com/phittayanan/habit-tracker/pull/132): a NUL character in a name gets the length message | F-03, F-04 message | No change: the contract asks for no new message ([resolution](../labs/lab-06/resolution.md) section 5) | Accepted limitation | None | Not applicable |
| CR-23 | Partner observation in [#130](https://github.com/phittayanan/habit-tracker/issues/130), not reported as a defect: `maxValue` 100000000 gets the "at most 2 decimal places" message | F-03, F-04 message | No decision recorded (the answer on #130 says the item was noted) | Observation | None | Not run |
| CR-25 | OBS-1 in the post-deployment checks of `v2.0` ([record](v2.0-release.md) section 5): after a rejected value was discarded, its message stayed on the calendar card with no input open. No effect on data was seen | F-11 calendar card; not yet compared with the contract | [Agreed plan](readiness-and-plan.md) section 3: owner projectnewy; open an Issue by 30 Nov and fix it before the final release | **Open**; no Issue yet | Pending | Not checked again on `v2.1` |

Related records that are not defects: the partner's synthetic `UAT-*` and `EXP-*` test records stay on the deployed app by decision ([#130](https://github.com/phittayanan/habit-tracker/issues/130)); a roll-forward of the same commit overwrites its image tag, and a rollback does not undo a migration ([deployment.md](../labs/lab-05/deployment.md) 6.4 and 6.7).

## 4. Approved baseline revisions

The source is "Approved Changes" in [traceability.md](../traceability.md), plus the contract changes made by the fixes above. "Approval" gives what the table or the linked review says. A revision is a change to the baseline; it does not show that the work is released.

| ID | Date | Revision | Rationale | Approval |
|---|---|---|---|---|
| B-01 | 2026-11-07 | No new Sprint 3 summary feature | Progress (F-09) and the calendar colours (F-12) cover the summaries of ADR 0021 and SRS 1.2 | Both students ([PR #26](https://github.com/phittayanan/habit-tracker/pull/26)) |
| B-02 | 2026-11-07 | FR-08 (retire) moves to Sprint 2; Retire is hidden in Sprint 1 | Sprint 1 was bigger than the handout slice (PR #21 review) | Both students (PR #21, PR #22 O-4) |
| B-03 | 2026-11-07 | FR-15, FR-16 and BR-15 (calendar) move to Sprint 2 | The same review finding | Both students ([PR #21](https://github.com/phittayanan/habit-tracker/pull/21)) |
| B-04 | 2026-11-07 | FR-23 added: a Participant's template write is refused with 403 | BR-09 had no requirement behind it, and the handout asks for this access test (PR #21 review) | Both students (PR #21) |
| B-05 | 2026-11-07 | No streak in the Sprint 2 side panel; SRS A-4 decided (target above 0, at most the template maximum; later revised by B-06) | Streaks are Sprint 3 work (ADR 0021). No separate reason for the A-4 limit was found in the records read | Both students ([PR #23](https://github.com/phittayanan/habit-tracker/pull/23), PR #25) |
| B-06 | 2026-11-14 | SRS A-4 and AC-07.11: the target must be above the template minimum (CR-06) | A target at or below the minimum is met by any entry ([ADR 0054](../adr/0054-goal-target-above-template-minimum.md)) | Both students (PR #95 review) |
| B-07 | 2026-11-14 | The seed keeps existing templates (CR-05) | Edits were lost at each deploy; the password reset stays as the only way to rotate seeded passwords ([ADR 0053](../adr/0053-seed-keeps-existing-templates.md)) | Decided by projectnewy; [PR #92](https://github.com/phittayanan/habit-tracker/pull/92) approved by phittayanan. The ADR status line still says "pending" |
| B-08 | 2026-11-25 to 26 | AC-01.2, AC-03.3 and AC-04.4 cover a NUL character (CR-07, CR-08) | PostgreSQL text cannot hold it, and the contract left no room for a 500 | PR #129 and PR #132, each reviewed by the other student |
| B-09 | 2026-11-27 | BR-04 and BR-07: several entries a day, judged by the day total (CR-09) | The rest of a day could not be added ([ADR 0061](../adr/0061-multiple-entries-per-day.md)) | Both students ([review](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119)) |
| B-10 | 2026-11-27 | Sprint 2 calendar contracts, ADR 0063 to ADR 0074: template kind Count or Time, calendar behaviour, `GET /api/calendar`, first page `/calendar` with the goals page kept | Examples: each kind needs its own input (ADR 0064); whole minutes are exact (ADR 0065); the Sprint 1 journey stays on the goals page (ADR 0073). Each ADR holds its own record; ADR 0063 records no reason beyond the chosen prototype | phittayanan; projectnewy agreed to ADR 0063 to ADR 0074 in the [approving review](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087285792) of PR #167 |
| B-11 | 2026-11-27 | Sprint 2 rules contracts, ADR 0075 to ADR 0084: permanent retire, entry edit and delete, target change with a `GoalTarget` table | Examples: keeping `daily_target` lets an app rollback keep working (ADR 0075); only goals not ended can change, so finished results stay (ADR 0076); each day is judged against one target (ADR 0077) | projectnewy; phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169), final approval of PR #171 later |
| B-12 | 2026-11-27 | ADR 0092 (target versions are deleted with their goal) and ADR 0093 (the `TIME` check joins the #153 PR) | A target version has no meaning without its goal (0092); one PR covers the whole contract and no `TIME` goal can take a fraction (0093) | Both students ([review](https://github.com/phittayanan/habit-tracker/pull/176#pullrequestreview-6089019427)) |
| B-13 | 2026-11-27 | Sprint 3 contracts, ADR 0086 to ADR 0091: reminder and streak behaviour | Examples: one removable reminder meets FR-21 with little to build (ADR 0086); the reminder follows the target-change rule (ADR 0087) | projectnewy; phittayanan in the [review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219), final approval of PR #174 later |
| B-14 | 2026-11-27 | ADR 0097: F-11 leaves the day state to F-12 (#156) | The state, colours and signs belong to F-12 and F-15, and each student keeps their own Issue | phittayanan; projectnewy agreed in the [PR #180 review](https://github.com/phittayanan/habit-tracker/pull/180#pullrequestreview-6090324352) |
| B-15 | 2026-11-27 | ADR 0101: ask before discarding an unsaved entry edit only when the value changed | The question names what would be lost | phittayanan; projectnewy agreed in the [PR #184 review](https://github.com/phittayanan/habit-tracker/pull/184#pullrequestreview-6091238373) |
| B-16 | 2026-11-27 | ADR 0099: a goal's reminder is deleted with its goal. ADR 0100: the calendar step of TC-43 waits for #155 | A reminder has no meaning without its goal (0099); AC-17.1 stays whole and is checked against the real endpoint (0100) | phittayanan; projectnewy agreed in the [PR #183 review](https://github.com/phittayanan/habit-tracker/pull/183#pullrequestreview-6090978739) |
| B-17 | 2026-11-27 | ADR 0102 to ADR 0105 (F-12, F-15): "+ New goal" above the calendar, the desktop panel stays with the List, "No entries" for an empty List day, a thick border on the chosen day | Examples: the calendar page had no "+ New goal" (0102); a dark fill would hide the day's colour (0105) | projectnewy; phittayanan agreed in the [PR #185 review](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) |

**Record gaps for [#161](https://github.com/phittayanan/habit-tracker/issues/161) (not changed here).** In `traceability.md`, the rows of B-10, B-14, B-15 and B-16 still show a pending agreement, although the reviews above record it. The SRS revision history still shows "pending" for #151, #150 and #157. The B-06, B-07 and B-08 changes have no row in "Approved Changes". [findings.md](../labs/lab-06/findings.md) still shows #127 as not yet triaged.

[PR #202](https://github.com/phittayanan/habit-tracker/pull/202) (draft, #161) changes `traceability.md` and the SRS and is not merged; its changes are not covered here.

## 5. Checks before #159 closes

- `v2.0` and `v2.1` are tagged, `v2.1` is deployed, and #160 is closed.
- Section 2 holds the results of the run on `v2.1`, with its limit.
- CR-12, CR-19 and CR-20 follow what was released; CR-24 and CR-25 are added.
- Section 4 was compared with `traceability.md` on `staging` `e087c29`.

**For the D2 PDF ([#161](https://github.com/phittayanan/habit-tracker/issues/161)).** The PDF needs captioned screenshots of the run on `v2.1`. This document names them but does not embed them.
