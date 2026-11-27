# F-12 Calendar day colours

Sprint 2 contract (Deliverable 2 Part B, [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 contracts and the ADRs, plus ADR 0070 (phittayanan, 2026-11-27). Points drafted by Claude Code are marked as such in section 12, with phittayanan's acceptance.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-12 Calendar day colours |
| Sprint | 2 |
| Requirements | FR-16; BR-15 |
| Related | NFR-06 (non-colour signal, TC-49); BR-07 (day met), BR-12 (target that day), BR-11 (edit and delete recompute) |
| Depends on | F-11 (the calendar and `GET /api/calendar`); F-14 for the target that day (#153) |
| Needed by | F-15 (the List shows the same sign) |
| Author / reviewer | phittayanan (contract) / projectnewy. Code owner: projectnewy (#156) |
| Status | Draft for review |

## 2. Behaviour and workflow

1. For each day of the shown month the server computes one state from the caller's goals active that day (section 3). `GET /api/calendar` returns it as `state` (F-11 section 7).
2. The calendar paints each day by its state and adds a sign, so colour is never the only signal (ADR 0040, NFR-06).
3. The day box or panel (F-11) shows the same state as a chip ("½ Some goals met"), and the List (F-15) shows it on each day heading.
4. Today's state is live: it is computed from today's entries so far and changes with each save (ADR 0070).
5. Any change to a day's entries (a new entry, F-13's edit or delete) or to the target valid that day (F-14) changes the state the next time it is read; the screen reads again after each save (F-11 AC-11.10).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| Goals counted | Only the caller's goals whose start and end dates include the day | ADR 0069, ADR 0070 |
| Met | A goal is met on a day when the sum of that day's entries is at least the target valid that day; equal counts as met. Sums are exact to 2 decimal places | SRS BR-07, BR-12; ADR 0061 |
| Recorded | A goal is recorded on a day when it has at least one entry that day, whatever its value (an entry of 0 counts) | OP-12.2 |
| `ALL_MET` (green, ✓) | Every counted goal is met | SRS BR-15; ADR 0045 |
| `SOME_MET` (yellow, ½) | At least one counted goal is met and at least one is not, including a goal with nothing recorded | ADR 0046, ADR 0070 |
| `NONE_MET` (red, ✗) | At least one counted goal is recorded and none is met | SRS BR-15; ADR 0070 |
| `NOTHING` (grey, –) | Goals are counted and none is recorded | SRS BR-15; ADR 0070 |
| `null` (no colour, no sign) | No goal is counted, or the day is after today | ADR 0070 |
| Today | Computed the same way from today's entries so far (live) | ADR 0070 |

The rule is one pure function: input the counted goals of one day, each with its target and its entry values, and whether the day is after today; output one of the five states.

## 4. Validation and failure cases

F-12 adds no request. Its inputs are validated by F-08 (entries), F-07 and F-14 (targets) and F-11 (`month`). The state function's boundaries:

| Case | State |
|---|---|
| One counted goal, total equal to the target | `ALL_MET` |
| One counted goal, total 0.01 below the target | `NONE_MET` |
| Two counted goals, one met, the other with no entry | `SOME_MET` |
| Two counted goals, one with an entry below target, the other with no entry | `NONE_MET` |
| Counted goals, no entries | `NOTHING` |
| No counted goal (before the first goal, or between goals) | `null` |
| A day after today, with counted goals | `null` |
| Today, all counted goals met so far | `ALL_MET` |

## 5. Permissions

As F-11 section 5: a Participant's states come only from their own goals and entries (NFR-03); a Manager gets 403; anonymous 401.

## 6. UI behaviour

- Colours: green, yellow, red and grey in the shades of the F-11 prototype (ADR 0063 keeps the current look); a `null` day has no fill.
- Signs inside the day cell: ✓ (all met), ½ (some), ✗ (none met), – (nothing recorded). A legend under the calendar repeats them in words: "✓ all met, ½ some, ✗ none, – nothing".
- Each day button's accessible name has the state in words: "all goals met", "some goals met", "no goal met", "nothing recorded"; a `null` past day has only the date; a future day "… future" (F-11).
- Today has an outline as well as its colour.
- The same words and signs appear on the F-11 chip and the F-15 day headings.

## 7. API

No new endpoint. `state` in `GET /api/calendar` (F-11 section 7) carries the result: `ALL_MET`, `SOME_MET`, `NONE_MET`, `NOTHING` or `null`.

## 8. Data

No new table or column. The state is computed on each read and never stored, so edits, deletes and goal changes cannot leave a stale colour (SRS BR-11).

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-12.1 | The state function returns the state of section 3 for every case of section 4 |
| AC-12.2 | Every coloured day shows its sign and has its state in words in its accessible name; the legend is shown (NFR-06) |
| AC-12.3 | Saving an entry changes the day's colour and sign when the state changes (cross-feature with F-08 and F-11) |
| AC-12.4 | Editing or deleting an entry (F-13) changes the day's state when the total crosses the target |
| AC-12.5 | A past day is judged against the target valid on that day after a goal change (F-14) |
| AC-12.6 | Today's state is live: it changes from `NOTHING` to `SOME_MET` or `ALL_MET` as entries are saved today |

## 10. Test specification

Fixtures as F-11 section 10 (goals W, count target 8; S, time target 420).

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-37 | AC-12.1 | Unit | The state function | Run every case of section 4 | Each returns its listed state |
| TC-49 | AC-12.2 | Browser and markup review | A with days in each state in the shown month | Read each day cell and its accessible name; read the legend | Every coloured day has ✓, ½, ✗ or – and the words; a `null` day has no sign; the legend is present. The reviewer records the markup check in the PR |
| TC-117 | AC-12.3, AC-12.6 | Browser | See F-11 | See F-11 | See F-11 (½ turns ✓ without a reload) |
| TC-122 | AC-12.4 | API | W has 8 on `D-1` (`ALL_MET` with S met as well); F-13 merged | Edit the W entry to 5; read `GET /api/calendar`; delete it; read again | `SOME_MET`, then `SOME_MET` with W not recorded (S still met). Runs once F-13 (#154) is merged |
| TC-123 | AC-12.5 | Unit and API | W's target was 8 until `D-1` and 6 from `D` (F-14); 7 on `D-2`, 7 on `D` | Read the states of `D-2` and `D` with S met on both | `D-2` `SOME_MET` (7 < 8); `D` `ALL_MET` (7 ≥ 6). Runs once F-14 (#153) is merged |
| TC-124 | AC-12.6 | API | A; nothing on `D`; S has 420 on `D` later | Read `D`'s state; save 420 on S; read again; save 8 on W; read again | `NOTHING`, then `SOME_MET`, then `ALL_MET` |

## 11. Definition of done

- TC-37 has a unit test per case of section 4, written first and seen failing, then passing.
- TC-49's markup review is recorded in the PR review.
- TC-122 and TC-123 run once their prerequisite Issues are merged; until then they are listed as "not run" with that reason.
- Contract and `docs/traceability.md` rows are current; the PR is reviewed and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-12.1 | Edge cases and today's colour | Decided by phittayanan (Q7): ADR 0070; agreement by projectnewy pending in review |
| OP-12.2 | An entry of 0 counts as recorded (so a day with only a 0 entry is red, not grey) | Drafted by Claude Code; accepted as drafted by phittayanan on 2026-11-27 (Q13) |
| OP-12.3 | Exact colour shades and the today outline | The prototype's shades and outline (ADR 0063 keeps the current look). Drafted by Claude Code; accepted as drafted by phittayanan on 2026-11-27 (Q13) |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #151) | pending (reviewer projectnewy) |
