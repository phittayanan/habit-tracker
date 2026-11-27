# F-16 Streaks

Sprint 3 contract (Deliverable 2 Part C, [Issue #157](https://github.com/phittayanan/habit-tracker/issues/157)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 and Sprint 2 contracts, ADR 0015 and ADR 0042, plus ADR 0089 to ADR 0091. Points drafted by Claude Code are marked in section 12.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-16 Streaks |
| Sprint | 3 |
| Requirements | FR-20; BR-13 |
| Related | BR-07, BR-10, BR-11, BR-12; SRS A-10; F-09, F-11, F-13, F-14; NFR-02, NFR-03, NFR-05, NFR-06 |
| Depends on | F-08, F-09, F-13; F-14 (target of a day); F-11 for the streak on the calendar |
| Needed by | none |
| Author / reviewer | projectnewy / phittayanan |
| Status | Planned: no code Issue yet, no test written |

## 2. Behaviour and workflow

1. The goals page shows each goal's current streak while the goal has not ended (ADR 0089, ADR 0090).
2. The calendar's day box or panel shows the current streak on each goal card only when the chosen day is today (ADR 0090).
3. Each goal on the goals page has a "Details" link to its detail page, which shows a short summary with the best streak (ADR 0042, ADR 0091).
4. Streaks are computed from the entries and targets on every read, so a new, edited or deleted entry and a target change show on the next read (BR-11).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| Day met | The day's total is at least the target of that day | SRS BR-07, BR-12 |
| Streak | A run of consecutive met days inside the goal's period. A day not met ends it | SRS BR-13; ADR 0015 |
| Today | While today is not met (no entry, or a total below the target) it does not end the run: the current streak is the run that ends yesterday. Once today is met it is counted | SRS BR-13 |
| Current streak | For a goal that has not ended. 0 when the goal has not started, or when the run is empty | ADR 0089; OP-16.2 |
| Ended goal | No current streak (`null` in the API, nothing on screen) | ADR 0089 |
| Best streak | The longest run from the start date to the earlier of today and the end date | ADR 0042; OP-16.2 |
| Stored | Never; computed on each read | SDS 3.5; BR-11 |

The rule is one pure function: input the goal's dates, the target of each day, the entries and today; output the current streak (or none) and the best streak. Sums are exact to 2 decimal places (as F-09).

## 4. Validation and failure cases

`GET /api/goals/:id`, checks in this order:

| Order | Case | Result | Error code |
|---|---|---|---|
| 1 | No valid session | 401 | `UNAUTHENTICATED` |
| 2 | Caller is a Manager | 403 | `FORBIDDEN` |
| 3 | Goal does not exist, the id is not a whole number, or it is another Participant's | 404 | `GOAL_NOT_FOUND` (the same answer) |

Boundaries: the first day of a goal; the last day, today; the day after the end date (the goal has ended); a one-day goal. Entries outside the goal's period cannot exist (BR-01).

## 5. Permissions

| Caller | Streaks and goal detail |
|---|---|
| Anonymous | 401 |
| Participant | own goals only |
| Manager | 403 |

## 6. UI behaviour

- Goals page: "Current streak: 3 days" ("1 day", "0 days") under "N of M days met". An ended goal has no such line.
- Calendar: the same line on each goal card when the chosen day is today; no line for another day.
- "Details" link on each goal, with an accessible name that includes the goal, for example "Details of Sleep". It opens `/goals/:id`.
- Detail page: the template name as heading, the current daily target, start and end dates, state, "N of M days met", "Current streak" (only while the goal has not ended), "Best streak: 5 days", and a link back to "Goals". Time targets show hours and minutes (ADR 0065).
- An unknown or other user's goal shows "Goal not found." A Manager sees "This page is not available for your role."
- Loading and error states as SDS 4.2; 375 px and 1280 px with no horizontal scroll; keyboard only.
- Sprint 1 goals-page tests: what they check stays the same. Only the Tab steps that pass the new link may change.

## 7. API

Errors use the ADR 0025 body.

- **`GET /api/goals`** (F-07, F-09): each goal also has `"currentStreak": 3`, or `null` for an ended goal.
- **`GET /api/goals/:id`** (Participant): 200 `{ "goal": { ...the GET /api/goals item, "bestStreak": 5 } }`.
- **`GET /api/calendar`** (F-11): in the item of today only, each goal also has `currentStreak`.

## 8. Data

No new table, column or migration.

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-16.1 | The streak function gives the current streak of section 3: a run, a miss, today not met and today met |
| AC-16.2 | The best streak is the longest run, also when it is not the latest one |
| AC-16.3 | Each day is judged against its own target after a target change |
| AC-16.4 | A new, edited or deleted entry changes both streaks on the next read |
| AC-16.5 | A goal not yet started has 0 and 0; an ended goal has no current streak and keeps its best streak |
| AC-16.6 | `GET /api/goals` and `GET /api/goals/:id` return the fields of section 7; anonymous 401, Manager 403, another Participant or a bad id 404 |
| AC-16.7 | The goals page and the detail page show section 6 |
| AC-16.8 | The calendar shows the current streak for today only |
| AC-16.9 | The new screen parts fit 375 px and 1280 px and work by keyboard only |

## 10. Test specification

`D` is today in Asia/Bangkok. Unit tests pass `today` as an argument.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-41 | AC-16.1, AC-16.2 | Unit | `today` 2026-11-10; goal 2026-11-01 to 2026-11-30, target 30. Met on 11-01 to 11-03, 11-05, 11-06, 11-08, 11-09; 11-04 has 29.99; 11-07 has nothing | Compute (a) with nothing today; (b) with 29 today; (c) with 30 today; (d) as (a) with 11-09 removed | (a) current 2, best 3. (b) current 2, best 3. (c) current 3, best 3. (d) current 0, best 3 |
| TC-160 | AC-16.5 | Unit | `today` 2026-11-10 | A goal starting 11-11; a goal 11-01 to 11-05 met 11-04 and 11-05; a one-day goal today, met and not met | 0 and 0; no current streak, best 2; 1 and 1, then 0 and 0 |
| TC-161 | AC-16.3 | Unit | Goal from 11-01; target 30 from 11-01 and 20 from 11-09; 25 on 11-08, 11-09 and 11-10; `today` 11-10 | Compute | current 2, best 2 |
| TC-162 | AC-16.4 | API (cross-feature) | A's goal with met days `D-3` to `D-1`; F-13 merged | Read; edit the `D-2` entry below target; read; edit it back; delete it; read | (current and best) 3 and 3; after the first edit 1 and 1; after editing it back 3 and 3; after the delete 1 and 1 |
| TC-163 | AC-16.6 | API | A with a running and an ended goal; B; a Manager | Read the list and the detail as A, B, the Manager and anonymous; read ids 99999 and `abc` | Section 7 fields, `null` for the ended goal; 404, 403, 401; 404, 404. TC-08 lists the new route |
| TC-42 | AC-16.7 | Browser | A with a running goal (best 3, current 1) and an ended goal | Read the goals page; open each "Details" | The running goal shows "Current streak: 1 day", the ended one none; details show the section 6 summary and "Best streak: 3 days" |
| TC-164 | AC-16.7 | Browser | B's goal id; a Manager | A opens B's detail address; the Manager opens `/goals/1` | "Goal not found."; "This page is not available for your role." |
| TC-165 | AC-16.8 | Browser | F-11 merged; A with a running goal | Choose today, then yesterday | The card shows the current streak for today and no streak line for yesterday |
| TC-166 | AC-16.9 | Browser | Both widths | Open "Details" and return by keyboard only | No horizontal scroll; every control reachable |

## 11. Definition of done

- Every AC has a test, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The streak function has a unit test per rule row of section 3.
- A test that waits for another feature is listed as "not run" with that reason until the feature is merged.
- Contract, traceability and SDS are current; the PR is reviewed and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-16.1 | Ended goals; where the current streak shows; detail page content (SRS A-10) | Decided by projectnewy (ADR 0089 to ADR 0091); phittayanan agreed in the review of 95c47f8 (PR #174) |
| OP-16.2 | 0 for a goal not started; best streak counted up to today or the end date; a day total equal to the target counts | Drafted by Claude Code from BR-07 and BR-13; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 95c47f8 (PR #174) |
| OP-16.3 | API fields and shapes, the address `/goals/:id`, the "Details" link, screen texts | Drafted by Claude Code (the endpoint is in SDS 4.4); accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 95c47f8 (PR #174) |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #157) | pending (reviewer phittayanan) |
| 2026-11-27 | [Review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219) of PR #174: phittayanan agreed to the decisions and drafted points | pending (reviewer phittayanan) |
