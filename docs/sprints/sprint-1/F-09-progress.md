# F-09 Progress (days met)

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12 as an open point; nothing was guessed.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-09 Progress (days met) |
| Sprint | 1 |
| Requirements | FR-12; BR-07 |
| Related | NFR-05, NFR-06, NFR-08; SRS A-1 (open: what "days so far" means) |
| Depends on | F-08 (entries exist), F-07, F-01, F-02 |
| Needed by | Sprint 2 features F-11, F-13, F-14 |
| Author / reviewer | projectnewy / phittayanan |
| Status | Draft |

## 2. Behaviour and workflow

1. A Participant opens the goals page. Each of their goals shows its progress as "N of M days met".
2. The API computes the numbers from the goal and its entries each time they are asked for. No progress value is stored (ADR 0009, SDS 3.5).
3. After a new entry is saved, the next read shows the new numbers.

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-07 | Progress is days met: the count of days whose value reached the daily target, out of the days so far | SRS BR-07; ADR 0013 |
| Day met | A day is met when its entry's `value` is greater than or equal to the goal's `daily_target`. There is at most one entry per day (BR-04), so the day's value is that entry's value | ADR 0013; SRS BR-04 |
| Days so far | The number of days from the goal's start date up to today, or up to the end date if the goal has ended. Both ends are included. Before the start date it is 0 | SRS A-1 (assumed, open, see OP-09.1) |
| Day | A day is an Asia/Bangkok date | ADR 0006 |

Missed day: a day so far whose entry is below the target. Empty day: a day so far with no entry. Both count in `daysSoFar` and not in `daysMet`.

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
- Empty state: a goal with no entries shows "0 of M days met"; a goal that has not started shows "0 of 0 days met".
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
| AC-09.1 | A day whose value is equal to or above the daily target counts in `daysMet` and in `daysSoFar` |
| AC-09.2 | A day with a value below the target counts in `daysSoFar` but not in `daysMet` |
| AC-09.3 | A day with no entry counts in `daysSoFar` but not in `daysMet` |
| AC-09.4 | For a goal that has not started, `daysSoFar` is 0 and `daysMet` is 0 |
| AC-09.5 | For an Ended goal, `daysSoFar` counts the days from the start date to the end date, and does not grow after that |
| AC-09.6 | After a new entry is saved, the next `GET /api/goals` shows the updated numbers, also after the app restarts |
| AC-09.7 | The goals page shows "N of M days met" for each goal, with the same numbers as the API |
| AC-09.8 | An anonymous caller gets 401 and a Manager gets 403 on `GET /api/goals` |

## 10. Test specification

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-31 | AC-09.1, AC-09.2, AC-09.3, AC-09.4, AC-09.5 | Unit | Fixed clock 2026-11-10; template unit minutes, min 0, max 120; target 30; goal 2026-11-01 to 2026-11-30 with entries 11-01 value 30 (met), 11-02 value 29.9 (missed), 11-03 none (empty), 11-04 value 45 (met) | Compute progress; then with a goal starting 2026-11-20; then with goal 2026-11-01 to 2026-11-05 and clock 2026-11-10 | `daysMet` 2 of `daysSoFar` 10; then 0 of 0; then `daysSoFar` 5 and not 10 |
| TC-32 | AC-09.7 | Browser | A logged in with the goal and entries from TC-31 seeded | Open the goals page | The page shows "2 of 10 days met" for that goal |
| TC-59 | AC-09.6, AC-09.7, AC-09.8 | Browser and API | Seeded Manager, Participants A and B and a template; A has no goal | Journey: Manager creates a template (or uses the seed); A logs in, creates a goal, records a value that meets the target, reads the goals page; restart the app; read again. Also call `GET /api/goals` as Manager and as anonymous | The page shows "1 of 1 days met" (clock fixed on the goal's first day); the same after the restart; Manager gets 403 and anonymous 401 |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The progress calculation is a pure function with a unit test for every case in AC-09.1 to AC-09.5; the clock is injectable (NFR-08).
- TC-59 is the complete Sprint 1 journey the handout asks for (UI, API and database, then the saved result read back); its output is kept for Part F.
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points

| ID | Open point | Proposal |
|---|---|---|
| OP-09.1 | SRS A-1: does "days so far" include today while today has no entry yet | Include today, as the SRS assumption says "to today"; the streak rule in ADR 0015 is a different matter (Sprint 3) |
| OP-09.2 | Shape of the percentage: the SRS and ADR 0013 give counts only | Show counts only ("N of M days met"), no percentage |
| OP-09.3 | `daysSoFar` for a goal whose start date is in the future | 0, shown as "0 of 0 days met" |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
