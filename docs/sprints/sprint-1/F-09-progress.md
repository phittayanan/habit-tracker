# F-09 Progress (days met)

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-09 Progress (days met) |
| Sprint | 1 |
| Requirements | FR-12; BR-07 |
| Related | NFR-05, NFR-06, NFR-08; SRS A-1 (what "days so far" means; decided here, OP-09.1) |
| Depends on | F-08 (entries exist), F-07, F-01, F-02 |
| Needed by | Sprint 2 features F-11, F-13, F-14 |
| Author / reviewer | projectnewy / phittayanan |
| Status | Revised for Lab 7 (Issue #139, ADR 0061): a day is met by its day total. First version agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119); later changes re-checked and approved by phittayanan in the [re-check of eda4c6b](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777). Implemented in Issue #140 ([evidence](../../labs/lab-07/implementation.md)) |

## 2. Behaviour and workflow

1. A Participant opens the goals page. Each of their goals shows its progress as "N of M days met".
2. The API computes the numbers from the goal and its entries each time they are asked for. No progress value is stored (ADR 0009, SDS 3.5).
3. After a new entry is saved, the next read shows the new numbers.

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-07 | Progress is days met: the count of days whose total reached the daily target, out of the days so far | SRS BR-07; ADR 0013, ADR 0061 |
| Day met | A day is met when its day total (the sum of the values of all its entries, exact to 2 decimal places) is greater than or equal to the goal's `daily_target`. A day counts at most once | ADR 0013, ADR 0061 |
| Days so far | The number of days from the goal's start date up to today, or up to the end date if the goal has ended. Both ends are included, so today counts even before today has an entry. Before the start date it is 0 | SRS A-1; decided on PR #29 (Q5), OP-09.1 |
| Day | A day is an Asia/Bangkok date | ADR 0006 |

Missed day: a day so far that has entries whose total is below the target. Empty day: a day so far with no entry. Both count in `daysSoFar` and not in `daysMet`.

Sprint 2 (F-14, ADR 0075): "the daily target" in BR-07 means the target of that day: the `GoalTarget` version with the latest effective date on or before it, or `daily_target` when the goal has no version. For a goal never changed the result is the same as in Sprint 1.

## 4. Validation and failure cases

Reading progress has no request body. It fails only on access:

| Case | Result | Error code |
|---|---|---|
| No valid session | 401 | `UNAUTHENTICATED` |
| Caller is a Manager | 403 | `FORBIDDEN` |

A goal with no entries gives `daysMet` 0. A goal that starts in the future gives `daysSoFar` 0 and `daysMet` 0. Another Participant's goal never appears in the caller's list (see F-10).

## 5. Permissions

| Caller | See progress |
|---|---|
| Anonymous | 401 |
| Participant | own goals only |
| Manager | 403 |

## 6. UI behaviour

- The plain goals page (Sprint 1, SRS A-3) shows, for each goal, the template name, the target with its unit, the dates, the state, and the text "N of M days met". Sprint 1 has no calendar or colours.
- Empty state: a goal with no entries shows "0 of M days met" (M counts today); a goal that has not started shows "0 of 0 days met".
- Loading: a loading indicator while the list is fetched; an error message with no technical detail if the request fails.
- 375 px and 1280 px wide with no horizontal scroll; keyboard only (NFR-05, NFR-06; TC-47, TC-48).

## 7. API

Progress is part of the goal list (SDS 4.4), so there is no new path.

**`GET /api/goals`** (Participant): each goal object from F-07 gains a `progress` object:
```json
{ "goals": [ { "id": 12, "templateId": 3, "dailyTarget": 30, "startDate": "2026-11-01",
               "endDate": "2026-11-30", "state": "ACTIVE",
               "template": { "id": 3, "name": "Sleep", "unit": "hours", "minValue": 0, "maxValue": 24 },
               "progress": { "daysMet": 4, "daysSoFar": 10 } } ] }
```
`daysMet` and `daysSoFar` are integers, with `daysMet <= daysSoFar`. Errors: 401, 403.

## 8. Data

No new table and no migration. Progress is computed from `Goal` and `Entry` (F-07, F-08).

| Layer change | Detail |
|---|---|
| API | `progress` added to the `GET /api/goals` response |
| Data | none |
| UI | text on the goals page |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-09.1 | (Revised, Lab 7) A day whose total is equal to or above the daily target counts in `daysMet` and in `daysSoFar` |
| AC-09.2 | (Revised, Lab 7) A day with entries totalling below the target counts in `daysSoFar` but not in `daysMet` |
| AC-09.3 | A day with no entry counts in `daysSoFar` but not in `daysMet` |
| AC-09.4 | For a goal that has not started, `daysSoFar` is 0 and `daysMet` is 0 |
| AC-09.5 | For an Ended goal, `daysSoFar` counts the days from the start date to the end date, and does not grow after that |
| AC-09.6 | After a new entry is saved, the next `GET /api/goals` shows the updated numbers (an entry that brings the day total to the target raises `daysMet`), also after the app restarts |
| AC-09.7 | The goals page shows "N of M days met" for each goal, with the same numbers as the API |
| AC-09.8 | An anonymous caller gets 401 `UNAUTHENTICATED` and a Manager gets 403 `FORBIDDEN` on `GET /api/goals` |
| AC-09.9 | Several entries on one day are added before the comparison: two entries each below the target meet the day when their total reaches it, the day counts once, and the sum is exact (0.7 + 0.1 meets a target of 0.8; added as binary floating point it would give 0.7999999999999999 and miss it) |
| AC-09.10 | On the goals page, saving a first partial entry leaves the day not met; saving a second entry that brings the total to the target makes it met, also after the app restarts |

## 10. Test specification

Dates in tests (decided on PR #29, OP-07.9): `D` is today in Asia/Bangkok. Browser and API tests use dates relative to `D` (seeded or created by the test), so the server needs no clock hook. The unit test of the calculation passes `today` as an argument.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-31 | AC-09.1, AC-09.2, AC-09.3, AC-09.4, AC-09.5 | Unit | `today` = 2026-11-10 passed as an argument; template unit minutes, min 0, max 120; target 30; goal 2026-11-01 to 2026-11-30 with entries 11-01 value 30 (met), 11-02 value 29.9 (missed), 11-03 none (empty), 11-04 value 45 (met) | Compute progress; then for a goal starting 2026-11-20; then for goal 2026-11-01 to 2026-11-05 | `daysMet` 2 of `daysSoFar` 10; then 0 of 0; then `daysSoFar` 5 and not 10 |
| TC-32 | AC-09.7 | Browser | A logged in; goal from `D-9` to `D+20`, target 30, with entries `D-9` value 30, `D-8` value 29.9, `D-6` value 45 (seeded relative to `D`) | Open the goals page | The page shows "2 of 10 days met" for that goal |
| TC-59 | AC-09.6, AC-09.7, AC-09.8 | Browser and API | Seeded Manager, Participants A and B; no template named "Sleep"; A has no goal | Journey: the Manager logs in and creates the template "Sleep" through the UI; A logs in and creates a goal starting `D` on it; A reads the goals page ("0 of 1 days met"); A records a value that meets the target for `D`; A reads the page again ("1 of 1 days met"); restart the app; read again. Also call `GET /api/goals` as Manager and with no session | The page shows "0 of 1", then "1 of 1", and "1 of 1" after the restart; Manager gets `403 FORBIDDEN`; anonymous gets `401 UNAUTHENTICATED` |
| TC-87 | AC-09.9 | Unit | `today` = 2026-11-10; goal from 2026-11-01, target 30, entries 11-01: 10 and 20; 11-02: 10 and 19.99; 11-03: 30 and 5. Second goal, target 0.8, entries 11-01: 0.7 and 0.1 | Compute progress | First goal `daysMet` 2 of 10 (11-01 and 11-03); second goal `daysMet` 1 |
| TC-88 | AC-09.10 | Browser and API | A logged in; goal starting `D` with target 30 | Record 10 for `D`, read the page; record 20, read it; restart the app; read again | "0 of 1 days met", then "1 of 1 days met", and "1 of 1" after the restart |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The progress calculation is a pure function with a unit test for every case in AC-09.1 to AC-09.5; it takes `today` as an argument (NFR-08).
- TC-59 is the complete Sprint 1 journey the handout asks for (a Manager creates a template, a Participant sets a goal, records a day and reads progress, then the saved result is read back after a restart); its output is kept for Part F.
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-09.1 | SRS A-1: does "days so far" include today while today has no entry yet | Decided on PR #29 (Q5): include today, as A-1 assumes. The streak rule in ADR 0015 is a different matter (Sprint 3) |
| OP-09.2 | Shape of the percentage: the SRS and ADR 0013 give counts only | Open (proposal): counts only ("N of M days met"), no percentage |
| OP-09.3 | `daysSoFar` for a goal whose start date is in the future | Open (proposal): 0, shown as "0 of 0 days met" |
| OP-09.4 | A visible "goal met" signal for a day that becomes met | Not in Lab 7: proposed by phittayanan in PR #143, agreed by projectnewy on 2026-11-27. Lab 7 is one bounded change, and Sprint 1 has no colours; the signal belongs with the calendar colours (FR-15, FR-16) |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
| 2026-11-07 | Review round 1 (PR #29): fixed-clock citation dropped and test dates made relative to the Bangkok today (TC-32, TC-59); TC-59 has the Manager create the template through the UI and reads the page before and after the entry; OP-09.1 decided (Q5) | pending (partner re-check) |
| 2026-11-10 | Issue #44 implementation evidence recorded in section 14 and `docs/progress-privacy-implementation-evidence.md`; requirements unchanged | projectnewy (author); teammate review pending |
| 2026-11-27 | Lab 7, Issue #139: a day is met by its day total (BR-07; AC-09.1, AC-09.2, AC-09.6 revised, AC-09.9 and AC-09.10 added; TC-87, TC-88; ADR 0061). TC-31, TC-32 and TC-59 keep their expected results | projectnewy (author); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119) |
| 2026-11-27 | Review of PR #143: the exactness example in AC-09.9 and TC-87 is now 0.7 + 0.1 against 0.8, because the old one could not fail; OP-09.4 | projectnewy (author); re-checked by phittayanan in the [re-check of eda4c6b](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777) |
| 2026-11-27 | Issue #150: days met uses the target of each day (section 3) | pending (reviewer phittayanan) |

## 14. Implementation evidence — Issue #44

Implemented from this contract. The failing-test commit `af813de` comes before the implementation commit `df8f61b`; commands, counts, AC mapping and limits are in [Progress and privacy implementation evidence](../../progress-privacy-implementation-evidence.md). No decided point was reopened.
