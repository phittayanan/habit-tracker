# Lab 7 release, deployment and post-deployment checks

Lab 7 Part B, [Issue #141](https://github.com/phittayanan/habit-tracker/issues/141). Owner: projectnewy. Reviewer and merger: phittayanan. Times are Asia/Bangkok (+07:00), 2026-11-27.

## 1. Versions

| Step | Version | Source |
|---|---|---|
| Sprint 1 baseline, old rule first released | tag `v1.0`, `64831f7` | `git tag` |
| Accepted Sprint 1 release (Lab 6) | tag `v1.4`, `056ee5c` | [Lab 6 resolution](../lab-06/resolution.md) |
| Revised contract | `ff6867b`, `6f27fac`, `eda4c6b`; merged as `c4ba749` at 12:38 | [PR #143](https://github.com/phittayanan/habit-tracker/pull/143) |
| Pre-change implementation | `staging` `c4ba749`, with the same `server` and `client` code as `v1.4` | [implementation.md](implementation.md) |
| Tests, seen failing on the old code | `761d87e` (12:54); Windows fix of TC-89 `f8736c9` | [implementation.md](implementation.md) |
| Implementation | `bbf12a2` (12:59); reviewed head `d30cf8c`, merged as `83ab8a2` | [PR #146](https://github.com/phittayanan/habit-tracker/pull/146) |
| Sync of `main` into `staging` | `4f3a1c4`, merged as `c482474` | [PR #149](https://github.com/phittayanan/habit-tracker/pull/149), Issue #148 |
| Main release | `b8d5acb`, merged 15:57, tag `v1.5` | [PR #147](https://github.com/phittayanan/habit-tracker/pull/147) |
| Deployed revision | `habit-tracker-00008-jgf`, page label `build b8d5acb` | Deploy run [45969767744](https://github.com/phittayanan/habit-tracker/actions/runs/45969767744) |

**Merge commits.** `d30cf8c`, `83ab8a2`, `c482474` and `b8d5acb` have the same tree (`70c0a1a`): the released files are the reviewed files, and only the commit IDs differ.

**Not part of the maintenance change, but in this release:** the Lab 6 records and evidence source (PR #136, #137) and the team status rule and records (ADR 0062, PR #145). No Sprint 2 or 3 feature.

## 2. Review and integration

| PR | Review | Merged by |
|---|---|---|
| [#143](https://github.com/phittayanan/habit-tracker/pull/143) contract | phittayanan approved, then re-checked the fixes | phittayanan |
| [#146](https://github.com/phittayanan/habit-tracker/pull/146) tests and code | projectnewy [requested changes](https://github.com/phittayanan/habit-tracker/pull/146#pullrequestreview-6084399396) (TC-89 failed on Windows), then [approved](https://github.com/phittayanan/habit-tracker/pull/146#pullrequestreview-6084528918) | projectnewy |
| [#149](https://github.com/phittayanan/habit-tracker/pull/149) sync | phittayanan approved | phittayanan |
| [#147](https://github.com/phittayanan/habit-tracker/pull/147) release | phittayanan [approved](https://github.com/phittayanan/habit-tracker/pull/147#pullrequestreview-6084904251) with one finding (the owner of two pre-merge tasks), fixed in the description | phittayanan |

## 3. Release and deployment

| Item | Result |
|---|---|
| Database backup before the merge | taken by projectnewy: `habit-tracker-pg`, On-demand, `before-lab7-release`, 15:27:57, successful ([screenshot](evidence/img/E-pre-release-backup-2026-11-27.png)) |
| Running version before | `056ee5c`; its image digest is kept outside Git (read from the log of run 45806178753, not from the Console) |
| CI in the deploy run | server 99 tests, 99 passed, 0 failed, 0 skipped; browser 50 passed |
| Rollback flag | `false` |
| Migration job | `habit-tracker-migrate-5p6mb` completed successfully |
| Service | revision `habit-tracker-00008-jgf` serving 100 percent of traffic (deploy log) |
| Smoke test | passed: `/api/health`, `/api/ready`, build label |
| Public site, read by Claude Code at 16:35 | build `b8d5acb`; health and ready 200; anonymous `GET /api/goals` 401 |
| Tag | annotated `v1.5` on `b8d5acb`, pushed after the checks below; earlier tags did not move |

**Rollback.** A rollback does not undo the migration. `v1.4` code on the migrated database would accept further same-day entries without the day-total check, and the unique index cannot be restored once a day holds two entries; the test data below already holds such a day. Prefer a fix-forward release. No rollback was done.

**Deployment window.** The migration job runs before the service update, so for a short time the old code could serve without the unique index. The data was not checked for entries saved in that window.

## 4. Post-deployment checks

- **URL:** https://habit-tracker-rfi4eg2u4q-as.a.run.app
- **Method:** manual test in Chrome by projectnewy, who typed all passwords. Claude Code gave the steps and checked the screenshots projectnewy sent; it did not operate or see the browser.
- **Times:** when Claude Code received each screenshot, by this computer's clock (+07:00). They are not capture times. projectnewy measured this computer's clock on 2026-11-27 as about 10 minutes ahead of GitHub (10 min 23 s); the same applies to "read by Claude Code at 16:35" in section 3. Times from GitHub and the Google Cloud Console are not affected.
- **Data:** synthetic. Three entries (5, 3, 4) were added to Participant One's Water goal (goal id 2) for 2026-11-27. They cannot be deleted in the app.
- Screenshots are in [`evidence/img/`](evidence/img/); in those with a browser bar, the extension and profile area is masked. Most do not show the address bar; the build label `b8d5acb` is visible in E-PD-00-templates-range, E-PD-06-after-reload-header, E-PD-08-participant2-goals-top and E-PD-10-manager-home. E-PD-09, E-PD-11 and E-PD-12 show the URL but not the account; the account follows from the order of the tests.

Water: unit glasses, range 1 to 12, daily target 8, goal 2026-11-23 to 2026-12-22.

### A. Changed behaviour (Participant One)

| ID | Time | Action | Expected | Actual | Result |
|---|---|---|---|---|---|
| [E-PD-00](evidence/img/E-PD-00-before-water.png) [2](evidence/img/E-PD-00-templates-range.png) | 16:42 to 16:43 | Read the goal and the template before any save | Old entries shown; no entry for 11-27 | 2 of 5 days met; one entry each on 11-23, 24, 25 with a day total; range 1 to 12 | Recorded |
| [E-PD-01](evidence/img/E-PD-01-first-entry-5.png) | 16:44 | Save 5 for 11-27 | Saved; total 5; still 2 of 5 | Saved; list shows 5 for 11-27; day total 5; 2 of 5 days met | Pass |
| [E-PD-02](evidence/img/E-PD-02-second-entry-3-day-met.png) | 16:44 | Save 3 for the same day | Saved; order 3, 5; total 8; 3 of 5 | Saved; order 3, 5; day total 8; 3 of 5 days met | Pass |
| [E-PD-03](evidence/img/E-PD-03-over-maximum-refused.png) | 16:45 | Save 5 (total would be 13) | "Only 4 glasses left for today."; value kept; nothing added | "Only 4 glasses left for today."; the box still shows 5; list still 3, 5 | Pass |
| [E-PD-04](evidence/img/E-PD-04-exact-maximum-accepted.png) | 16:45 | Save 4 (total exactly 12) | Saved; order 4, 3, 5; total 12; still 3 of 5 | Saved; order 4, 3, 5; day total 12; 3 of 5 days met | Pass |
| [E-PD-05](evidence/img/E-PD-05-day-full-refused.png) | 16:45 | Save 1 on the full day | "Today is full (12 glasses)."; value kept; nothing added | "Today is full (12 glasses)."; the box still shows 1; list still 4, 3, 5 | Pass |
| [E-PD-06](evidence/img/E-PD-06-after-reload-water.png) [2](evidence/img/E-PD-06-after-reload-header.png) | 16:46 | Reload the page | Entries 4, 3, 5 only; total 12; 3 of 5 | Entries 4, 3, 5 only; day total 12; 3 of 5 days met | Pass |
| [E-PD-07](evidence/img/E-PD-07-goal-id.png) [2](evidence/img/E-PD-07-owner-reads-entries.png) | 16:47 to 16:50 | Owner reads `/api/goals` and `/api/goals/2/entries` | Goal id 2, progress 3 of 5; entries listed newest first | Goal `id` 2, `daysMet` 3, `daysSoFar` 5; entries 4, 3, 5 (ids 19, 18, 17), then 10, 6, 8 (the entries screenshot has no address bar) | Pass |

### B. Preserved behaviour: privacy and roles

| ID | Time | Who and action | Expected | Actual | Result |
|---|---|---|---|---|---|
| (earlier) | 16:35 | Anonymous GET `/api/goals`, run by Claude Code | 401 | 401 `UNAUTHENTICATED` | Pass |
| [E-PD-08](evidence/img/E-PD-08-participant2-goals-top.png) [2](evidence/img/E-PD-08-participant2-goals-middle.png) [3](evidence/img/E-PD-08-participant2-goals-bottom.png) | 16:50 to 16:51 | Participant Two reads the goals page | None of Participant One's goals or entries | Own goals seen (Walking, Reading, Water, UAT-02 Squats); the Water goal has other dates and entries; no 4, 3, 5 | Pass |
| [E-PD-09](evidence/img/E-PD-09-participant2-goal-not-found.png) | 16:53 | Participant Two opens `/api/goals/2/entries` | `GOAL_NOT_FOUND` | `GOAL_NOT_FOUND`, "Goal not found."; address bar visible. The account is not shown in this screenshot; it follows E-PD-08 in the same session as reported by the tester | Pass |
| [E-PD-10](evidence/img/E-PD-10-manager-home.png) | 16:53 | Manager signs in | Templates only, no Goals menu | "Manager One"; menu shows Templates only; `build b8d5acb` | Pass |
| [E-PD-11](evidence/img/E-PD-11-manager-goals-forbidden.png) | 16:53 | Manager opens `/api/goals` | `FORBIDDEN` | `FORBIDDEN`, "You do not have permission to do this." | Pass |
| [E-PD-12](evidence/img/E-PD-12-manager-entries-forbidden.png) | 16:53 | Manager opens `/api/goals/2/entries` | `FORBIDDEN` | `FORBIDDEN`, "You do not have permission to do this." | Pass |

### Existing data after the migration

The screenshots show the earlier entries of both Participants on the new version, each with a day total. They were not compared row by row with data read before the release.

### Not checked

Cloud Run revision page in the Console; the HTTP status codes of E-PD-09, E-PD-11 and E-PD-12 (the screenshots show the error body only); two requests at once on the deployed app (covered by TC-84 in the test suites); other templates, including negative values.
