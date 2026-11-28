# Part B. Sprint 2 contracts and working increment {#part-b}

<!-- source: docs/deliverable-2/status.md and docs/sprints/sprint-2/*.md -->

## B.1 Sprint 2 completion table {#b-1}

The Sprint 2 release is tag `v2.0` on `f510619` (release PR #189). Every Sprint 2 feature still passes on the candidate `v2.1` (`9b09bfe`).

<!-- include: docs/deliverable-2/status.md#Sprint_2_completion -->

## B.2 Contract history and TDD evidence {#b-2}

Each row gives the first commit of the contract, of the failing tests and of the code, with its commit time (Asia/Bangkok, from the PR's commit list), the red run recorded before the code and the green run with its commit. All these tests pass again on `v2.0` (`f510619`) and `v2.1` (`9b09bfe`) in CI. Later fix commits in each PR follow the same order (failing test, then fix); the PRs list them.

| Feature | Contract | Failing tests | Code | Red run before the code | Green |
|---|---|---|---|---|---|
| F-05 retire (#152, PR #179) | `d9f2d25`, 27 Nov 18:38 (PR #171) | `c37ccb9`, 27 Nov 22:00 | `39a4f38`, 27 Nov 22:03 | server 10 tests, 10 failed; browser 8 failed (no Retire button) | on `39a4f38`: server 123 of 123; browser 68 passed ([evidence](https://github.com/phittayanan/habit-tracker/blob/staging/docs/template-retire-implementation-evidence.md)) |
| Template kind (#168, PR #173) | `9987722`, 27 Nov 17:49 (PR #167) | `70a16af`, 27 Nov 20:29 | `ed1094a`, 27 Nov 20:29 | server 5 tests, 5 failed; browser 6 failed | after the code commit: server 104 of 104; browser 56 passed ([evidence](https://github.com/phittayanan/habit-tracker/blob/staging/docs/template-kind-implementation-evidence.md)) |
| F-14 goal change (#153, PR #176) | `d9f2d25`, 27 Nov 18:38 (PR #171) | `76b4141`, 27 Nov 20:15 | `2db2717`, 27 Nov 20:19 | 8 of 14 new server tests failed; TC-158, TC-159 failed on the old page | on `32316c0`: server 113 of 113; browser 62 passed (PR #176 description) |
| F-11 calendar (#155, PR #180) | `9987722`, 27 Nov 17:49 (PR #167) | `91a930e`, 27 Nov 21:58 | `ffc88f0`, 27 Nov 22:03 | server 6 tests, 6 failed; browser 70 failed, 12 passed, 4 skipped | on `3d31bb1`: server 118 of 118; browser 83 passed, 5 skipped, 2 failed (TC-73: its request context was fixed to port 33132 and the run used 33155), then TC-73 2 of 2 on the standard port ([evidence](https://github.com/phittayanan/habit-tracker/blob/staging/docs/calendar-implementation-evidence.md)) |
| F-13 entry edit and delete (#154, PR #184) | `d9f2d25`, 27 Nov 18:38 (PR #171) | `0243a87`, 27 Nov 23:25 (API); `61fa4d2`, 23:33 (browser) | `536cb9e`, 27 Nov 23:26 (API); `7dbd9c2`, 23:33 (screens) | API 6 of 7 failed; browser TC-149 to TC-151, 6 of 6 failed | API on `536cb9e`: 7 of 7; browser on `f148941`: TC-149 to TC-151, 6 of 6 (PR #184 description) |
| F-12, F-15 colours and List (#156, PR #185) | `9987722`, 27 Nov 17:49 (PR #167) | `c9f4a68`, 27 Nov 23:47 (server); `3fb2076`, 28 Nov 00:00 (browser) | `4395185`, 28 Nov 00:06 | server 132 tests, 4 failed; browser 19 failed, 23 passed, 6 skipped | on `51d4ca7`: server 151 of 151; browser 120 passed, 6 skipped ([evidence](https://github.com/phittayanan/habit-tracker/blob/staging/docs/colours-list-implementation-evidence.md)) |

## B.3 Program evidence for two Sprint 2 features {#b-3}

Screenshots from the F-12 and F-15 build (Issue #156), local development build before the `v2.0` release, synthetic account `participant3`, at 1280 px. The day box in them has no F-13 Edit and Delete buttons yet.

![Figure B-1. F-12 day colours (AC-12.2, AC-12.6). Role Participant. Start: Water (target 8 glasses) and Sleep (target 7 h) active all month, with entries on past days. Steps: sign in; the calendar opens on November 2026 with today (28 Nov) chosen. Expected: each past day coloured by the F-12 rule with a sign (✓ all met, ½ some, ✗ none, – nothing) and a legend; today live. Actual: as expected; 28 Nov shows ½ because Water 8 / 8 is met and Sleep 0 min / 7 h is not.](../../sprints/sprint-2/img/f12-built-1280-calendar.png)

![Figure B-2. F-15 List (AC-15.1 to AC-15.3, AC-15.5). Same account and data. Steps: press List. Expected: the month's days newest first, each with its sign and words and one row per goal with total / target, ✓ when met, the entries in brackets, Time in hours and minutes, and "No entries" for a day without entries. Actual: as expected (for example Fri 27 Nov ✓ all met, Sleep 7 h 10 min / 7 h ✓; Tue 24 Nov "No entries").](../../sprints/sprint-2/img/f15-built-1280-list.png)

**To add (PENDING: projectnewy's captures, asked for in PR #202).** A rule rejection with saved data on a Sprint 2 feature, for example F-13's refused edit above the day cap (check C-13 or C-14 on `v2.0`, 409 `Only 9 reps left for today.`). Those captures are kept outside Git by projectnewy ([v2.0 record](https://github.com/phittayanan/habit-tracker/blob/staging/docs/deliverable-2/v2.0-release.md) section 7). Backend evidence of the access rules is in Part E.2 (TC-121) and in the deployed checks E-01 to E-06 of `v2.0`.

## B.4 Issue and PR chains {#b-4}

| | Chain 1: F-14 goal change | Chain 2: F-12 and F-15 colours and List |
|---|---|---|
| Contract | Issue #150, PR #171 (author projectnewy; approved and merged by phittayanan) | Issue #151, PR #167 (author phittayanan; approved and merged by projectnewy) |
| Build Issue and branch | #153, `feat/153-goal-change` (owner phittayanan) | #156, `feat/156-calendar-colours-list` (owner projectnewy) |
| PR | PR #176, author phittayanan | PR #185, author projectnewy |
| Review | projectnewy: changes requested, then approved after the fixes ([approval](https://github.com/phittayanan/habit-tracker/pull/176)); the ADR 0092 and 0093 agreement is in the [review of 136c4b3](https://github.com/phittayanan/habit-tracker/pull/176#pullrequestreview-6089019427) | phittayanan, approved twice; the TC-49 markup review is in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) |
| Merge into `staging` | `a8a047c`, merged by projectnewy | `899fa35`, merged by phittayanan |
| Release on `main` | PR #189 (author projectnewy, approved and merged by phittayanan), `f510619`, tag `v2.0` | the same |

## B.5 Sprint 2 contracts {#b-5}

The contracts as they are on `staging`, each with its FR, BR and NFR links, UI, API and data, validation, errors, permissions, AC, test specification and Definition of Done.

### Sprint 2 overview

<!-- include: docs/sprints/sprint-2/README.md -->

The template kind (Count or Time, ADR 0064) is a revision of the Sprint 1 contracts F-03, F-04, F-07 and F-08 (Issue #151): AC-03.8, AC-03.9, AC-04.8, AC-07.12, AC-07.13, AC-08.20 and AC-08.21 are in those files in `docs/sprints/sprint-1/`, with revision rows.

### F-05 Template retire

<!-- include: docs/sprints/sprint-2/F-05-template-retire.md -->

### F-11 Month calendar and side panel

<!-- include: docs/sprints/sprint-2/F-11-month-calendar.md -->

### F-12 Calendar day colours

<!-- include: docs/sprints/sprint-2/F-12-day-colours.md -->

### F-13 Entry edit and delete

<!-- include: docs/sprints/sprint-2/F-13-entry-edit-delete.md -->

### F-14 Goal change

<!-- include: docs/sprints/sprint-2/F-14-goal-change.md -->

### F-15 Calendar and List history

<!-- include: docs/sprints/sprint-2/F-15-calendar-list.md -->
