# Lab 7 change request: several entries per day

Lab 7 Part A, [Issue #139](https://github.com/phittayanan/habit-tracker/issues/139). Owner: projectnewy. Reviewer: phittayanan. Written on 2026-11-27, before any test or code of the new rule.

Instructor/TA approval is not required, per the instructor's announcement changing the Lab 7 spec sheet (as relayed by projectnewy on 2026-11-27).

## 1. Change request

| Item | Content |
|---|---|
| Original Sprint 1 requirement | BR-04 and FR-11 (F-08); BR-07 and FR-12 (F-09) |
| Implemented rule (old) | At most one entry per goal per day. A second entry gets `409 ENTRY_ALREADY_EXISTS`. A day is met when that entry reaches the daily target |
| New rule | Several entries per goal per day. Each stays inside the template range. The day total is not above the template maximum, otherwise `409 DAILY_TOTAL_ABOVE_MAX`. A day is met when the day total reaches the daily target |
| Reason | A Participant who records part of a day cannot add the rest, and Sprint 1 has no edit (ADR 0061) |
| In scope | The entry rule on the backend, one migration, progress, the list and day total on the goals page |
| Out of scope | Editing or deleting entries (FR-17), the calendar (FR-15, FR-16), goal changes (FR-18), streaks and reminders, and a separate "goal met" signal (F-09 OP-09.4) |
| Access | Unchanged: own goal only; another Participant or unknown goal 404; Manager 403; anonymous 401 |

Acceptance criteria: AC-08.7 (revised), AC-08.13 to AC-08.19 in [F-08](../../sprints/sprint-1/F-08-entry.md); AC-09.1, AC-09.2, AC-09.6 (revised), AC-09.9, AC-09.10 in [F-09](../../sprints/sprint-1/F-09-progress.md).

Boundaries and invalid cases (template maximum 24): a total of exactly 24 is accepted; 24.01 is refused; 0.1 + 0.2 fits a maximum of 0.3; a single value above 24 stays `VALUE_OUT_OF_RANGE`; validation and date errors come before the day-total error.

## 2. Versions

| Step | Version | Source |
|---|---|---|
| Sprint 1 baseline release (old rule delivered) | tag `v1.0`, commit `64831f7`, 2026-11-10 | `git tag`; [Lab 6 resolution](../lab-06/resolution.md) |
| Accepted Sprint 1 release (Lab 6) | tag `v1.4`, commit `056ee5c`; accepted by the partner team on 2026-11-26 (UAT-01 to UAT-04 and EXP-1 on `v1.3`, the two fixes retested on `v1.4`) | [Lab 6 resolution](../lab-06/resolution.md) |
| Pre-change implementation | `staging` at `a43070f`. No difference from `v1.4` in `server`, `client`, `.github`, `deploy`, `Dockerfile` or `docker-compose.yml` | `git diff --stat v1.4 origin/staging` on those paths, 2026-11-27 |
| Pre-change deployed revision | `habit-tracker-00007-7pd`, `build 056ee5c`, as recorded on 2026-11-26. Not read again for this document | [Lab 6 resolution](../lab-06/resolution.md) |

Intervening development, `v1.0` to `v1.4` (`git diff --stat v1.0 origin/staging -- server client`, 22 files): container and readiness work (Lab 5), the demo seed keeping edited templates, the goal target above the template minimum (Issue #74), and the two NUL-character fixes (Lab 6). The schema and migrations did not change, and no Sprint 2 or 3 feature is in this code.

## 3. Impact

| Requirement | Feature | SRS / SDS sections | AC | Tests | Code to change (Issue #140) |
|---|---|---|---|---|---|
| BR-04, FR-11 | F-08 | SRS 1.4, BR-04, FR-11, A-11; SDS 3.2, 3.4, 4.3, decision list; F-08 sections 2 to 4, 6 to 12; Sprint 1 overview | AC-08.7, AC-08.13 to AC-08.17, AC-08.19 | TC-29, TC-61 (revised); TC-82 to TC-86, TC-90 | `server/src/services/entry.js`, `server/src/services/entry-rules.js`, `client/src/goals.jsx` |
| BR-07, FR-12 | F-09 | SRS 1.4, BR-07; SDS 3.4; F-09 sections 3, 9, 10 | AC-09.1, AC-09.2, AC-09.6, AC-09.9, AC-09.10 | TC-87, TC-88 | `server/src/services/progress-rules.js`, `server/src/services/goal.js` |
| BR-04 (data) | F-08 | SDS 3.2; F-08 section 8 | AC-08.18 | TC-89 | `server/prisma/schema.prisma`, a new migration |

| Area | Effect |
|---|---|
| Callers and dependencies | `computeProgress` is called by `listGoals` in `server/src/services/goal.js`, which already passes every entry of the goal. Today it compares each entry with the target, so without a change two partial entries would not meet the day. `createEntry` and `listEntries` are called by `server/src/routes/entries.js`; paths and response shapes do not change |
| API | One error code replaces another. The list adds a second sort key (newest saved first within a date). No new endpoint |
| UI validation | The goals page shows the API message and keeps the typed value, as now. It adds a day total per date |
| Precision | Values are `Decimal(10, 2)`. The day total must be added as decimals (in the database or in hundredths), not as binary floating point. `listGoals` in `goal.js` turns each value into a JavaScript number before `computeProgress`, so the sum must not simply add those numbers |
| Concurrency | The unique index now turns the second of two requests into a 409. Without it, the goal row must be locked while the total is checked and the row inserted |
| Persistence, migration, history | One migration: drop the unique index, add a non-unique one. No row changes. Each existing day has one in-range entry, so it meets the new rule, and its progress result is unchanged |
| Rollback | Not safe for the rule: `v1.4` code on the migrated database would accept further same-day entries without a total check. Issue #141 must record this in the release plan. The old unique index cannot be restored once a day holds two entries |
| Roles and ownership | Not changed. The new check runs after the existing session, role and ownership checks |
| Goals (F-07) | Not changed: the target rule stays (SRS A-4, ADR 0054) |
| Templates (F-03, F-04, F-06) | No code change. `max_value` gains a second meaning. A template that a goal uses cannot be edited (BR-08), so the maximum cannot change under existing entries |
| Login and roles (F-01, F-02, F-10 rules) | Not applicable: no entry rule is involved |
| Seed and configuration | Not applicable: the seed creates no entries, and no environment variable changes |
| Sprint 2 and 3 plans | FR-17 must keep the day total within the maximum; FR-15's one number box per goal must allow several entries; streaks (BR-13) use "day met", which now means the day total |
| Past evidence | Lab 5 and Lab 6 records and UAT cases describe the old rule as tested at that time. They are not edited. UAT-02 step C9 expects the one-entry message; on the new release the same input (8 then 9, maximum 12) is still refused, with "Only 4 glasses left for today.", so its expected message needs revising. UAT-03 has no step that depends on the one-entry rule (corrected in Issue #142 after projectnewy's review of PR #163) |

## 4. Behaviour that must not change, and what protects it

| Unchanged behaviour | Existing tests |
|---|---|
| No future date, no date outside the goal, Bangkok day | TC-24, TC-25, TC-26, TC-27, TC-30 |
| Each entry inside the template range; input validation | TC-28, TC-56 |
| A saved entry survives a restart | TC-23, TC-58 |
| Progress for met, missed and empty days, and ended or future goals | TC-31, TC-32, TC-59 (expected results unchanged) |
| Privacy: own data only; Manager and anonymous refused | TC-33, TC-34, TC-35, TC-57 |
| Goal rules | TC-20 to TC-22, TC-53 to TC-55, TC-60, TC-74, TC-78 |
| A goal with entries cannot be deleted | schema test in `server/test/entry.test.js` (revised under TC-89, this part kept) |

Issue #140 runs the whole server and browser suites, not only this selection.

### Old expectations that change

No test is deleted or disabled. These expect the old rule and are revised, with the reason above:

| Test | Before | After |
|---|---|---|
| TC-29, `server/test/entry.test.js` | second entry for a day: `409 ENTRY_ALREADY_EXISTS`; two at once give one row | second entry within the maximum: 201; the concurrency case moves to TC-84 with the day-total limit |
| TC-61 part of `client/test/entries.spec.js` | a second entry (6 after 7.5) shows "An entry already exists for this day." | an entry that passes the day maximum (17 after 7.5, maximum 24) shows the day-total message and keeps the value |
| Schema test, `server/test/entry.test.js` | the database refuses a second row for a goal and day | it accepts the row; the index is not unique (TC-89) |

## 5. Order of work

1. This document and the revised contract, reviewed by phittayanan and merged (Issue #139).
2. New and revised tests, seen failing on the pre-change code; then the implementation (Issue #140).
3. Release, deployment and checks (Issue #141).
4. Metrics, readiness and retrospective (Issue #142).

## 6. Review

phittayanan approved commit `6f27fac` on 2026-11-27 (Asia/Bangkok): [review](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119). It records nine checks (made with AI assistance, no test run) and agreement with the two rules and OP-08.9 to OP-08.12.

| Point from the review and follow-up comments on [PR #143](https://github.com/phittayanan/habit-tracker/pull/143) | Result |
|---|---|
| Record the agreement instead of "pending" | Done |
| Revision rows in the SRS and the system SDS | Done |
| The exactness example in AC-09.9 and TC-87 could not fail | Changed to 0.7 + 0.1 against a target of 0.8; `goal.js` added to the impact table |
| No test for negative values (OP-08.12) | AC-08.19 and TC-90 added |
| "Goal met" signal on the goals page? | Not in Lab 7 (F-09 OP-09.4) |
| Issue #141 does not mention the rollback risk | Line added to #141 |
| Shorter day-total message that says what still fits | Accepted (F-08 OP-08.14) |

phittayanan re-checked and approved the changes after `6f27fac` in the [re-check of eda4c6b](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777) on 2026-11-27. That review asked for "unit hours" in the Given of TC-61; it was added in Issue #140.
