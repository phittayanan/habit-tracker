# Part C. Sprint 3 contracts and working progress {#part-c}

<!-- source: docs/sprints/sprint-3/*.md, docs/deliverable-2/status.md, v2.1-release.md -->

## C.1 Status of each Sprint 3 item {#c-1}

<!-- include: docs/deliverable-2/status.md#Sprint_3_status -->

## C.2 Implemented Sprint 3 workflow: F-17 stored reminder {#c-2}

| Item | Value |
|---|---|
| Contract | `b8eef14`, 27 Nov 20:35 (PR #174, author projectnewy, approved and merged by phittayanan) |
| Failing tests | `e4a43e6`, 27 Nov 21:49: server 23 tests, 13 passed, 10 failed (TC-43, TC-168 to TC-172, the ADR 0099 test, the `reminder-rules.test.js` module missing, TC-20 and TC-152 without the `reminder` field); browser 6 failed (TC-173, TC-175 no controls; TC-174) |
| Code | `58b496e`, 27 Nov 21:52: table `GoalReminder` (additive migration `20261127000400_goal_reminder`), `PUT` and `DELETE /api/goals/:id/reminder`, the goals page controls |
| Review and merge | PR #183, author phittayanan; approved by projectnewy (TC-167 checked in the [review of b35e654](https://github.com/phittayanan/habit-tracker/pull/183#pullrequestreview-6090978739); final approval on `3714141`); merged into `staging` as `54ad196` |
| Release | `v2.1`, `9b09bfe` (release PR #198, author projectnewy, approved and merged by phittayanan) |
| Tests on `9b09bfe` | TC-43, TC-168 to TC-175 pass in CI run 46124923270 (`reminder.test.js`, `reminder-rules.test.js`, `reminder.spec.js` at 375 px and 1280 px) |
| Deployed checks on `v2.1` | R-01 to R-11, 11 of 11 passed (Part E, `v2.1` record section 5) |

**Screenshots (PENDING: projectnewy's captures, asked for in PR #202).** Set, change and remove a reminder on the deployed `v2.1` (R-04, R-06, R-08) were captured by projectnewy; the captures are kept outside Git (`v2.1` record section 7).

## C.3 Remaining-work table {#c-3}

<!-- include: docs/deliverable-2/status.md#Remaining_work -->

The plan with owners, reviewers and dates is in Part E.5.

## C.4 Sprint 3 contracts {#c-4}

### Sprint 3 overview

<!-- include: docs/sprints/sprint-3/README.md -->

### F-16 Streaks

<!-- include: docs/sprints/sprint-3/F-16-streaks.md -->

### F-17 Stored reminder

<!-- include: docs/sprints/sprint-3/F-17-stored-reminder.md -->
