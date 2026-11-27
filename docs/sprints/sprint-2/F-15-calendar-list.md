# F-15 Calendar and List history

Sprint 2 contract (Deliverable 2 Part B, [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 contracts and the ADRs, plus ADR 0068, ADR 0071 and ADR 0072 (phittayanan, 2026-11-27). Points drafted by Claude Code are marked as such in section 12, with phittayanan's acceptance.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-15 Calendar and List history |
| Sprint | 2 |
| Requirements | FR-19 |
| Related | NFR-03, NFR-05, NFR-06; F-12 (the day signs) |
| Depends on | F-11 (the screen, the month arrows and `GET /api/calendar`) |
| Needed by | none |
| Author / reviewer | phittayanan (contract) / projectnewy. Code owner: projectnewy (#156) |
| Status | Draft for review |

## 2. Behaviour and workflow

1. Two buttons, "Calendar" and "List", sit above the calendar, next to "+ New goal" (ADR 0048). "+ New goal" opens the form at `/goals/new` (ADR 0102). Calendar is selected after login.
2. List replaces the calendar with the records of the same month; Calendar brings the calendar back. The month arrows work in both views, and switching keeps the month (ADR 0068). On desktop the day panel stays beside the List, and a save there updates the List (ADR 0103).
3. The List shows the days of the month that are today or earlier and have at least one goal active, newest day first (FR-19, ADR 0071). Each day has a heading with the date and the F-12 sign and words ("Thu 27 Nov · ½ some met").
4. Under each heading of a day with at least one entry, one row per goal active that day: the goal name, total / target with the unit, ✓ when met, and the day's entries in brackets, newest saved first ("Water 5 / 8 glasses (3 · 2)"). Time values show as hours and minutes (ADR 0065).
5. A day with active goals but no entries shows only "No entries" under its heading, with no goal rows (ADR 0104).
6. A month with no goal active on any day so far shows "No goals in this month."

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| Same month | The List shows the month the calendar shows | SRS FR-19; ADR 0048, ADR 0068 |
| Order | Days newest first; entries within a day newest saved first | SRS FR-19; ADR 0071; F-08 OP-08.10 |
| Days shown | Days up to today that have at least one active goal | ADR 0069, ADR 0071 |
| Own records | Only the caller's goals and entries | SRS FR-13, BR-10; NFR-03 |
| Time format | Whole minutes shown as "7 h 10 min", "45 min" or "7 h" | ADR 0065 |

## 4. Validation and failure cases

The List reads `GET /api/calendar` (F-11 section 7) and adds no request; its failure cases are F-11 section 4. If the read fails, the List shows the API `message` and keeps the switch usable.

## 5. Permissions

As F-11 section 5.

## 6. UI behaviour

- "Calendar" and "List" are buttons with `aria-pressed` showing the selected one.
- Day headings are headings (`h3`), so a screen-reader user can jump between days.
- 375 px and 1280 px wide with no horizontal scroll; the switch, the month arrows and the list work with the keyboard alone (NFR-05, NFR-06).

## 7. API

No new endpoint. The List takes `days` from `GET /api/calendar`, drops the days after today and the days with no goals, and shows the rest in reverse order (ADR 0072).

## 8. Data

No change.

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-15.1 | "Calendar" and "List" buttons are above the calendar; Calendar is selected after login; each button shows its view and marks itself pressed |
| AC-15.2 | The List shows the shown month's days up to today that have an active goal, newest first, each with its sign and words, one row per active goal with total / target, ✓ when met, and its entries newest first |
| AC-15.3 | A day with active goals and no entries shows "No entries"; a month with no active goal shows "No goals in this month." |
| AC-15.4 | The month arrows work in the List, and switching views keeps the month |
| AC-15.5 | Time values show as hours and minutes |
| AC-15.6 | The List shows only the caller's records |

## 10. Test specification

Fixtures as F-11 section 10.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-40 | AC-15.1, AC-15.4 | Browser | A logged in | Read the buttons; press List; press ‹; press Calendar | Calendar pressed at first; List shows the list; ‹ shows the previous month's list; Calendar shows that previous month's calendar |
| TC-125 | AC-15.2, AC-15.3 | Browser | A; W entries 3 then 2 on `D`, S 430 on `D`; nothing on `D-1`; W 3 on `D-2` | Open List | First heading `D` "½ some met": "Water 5 / 8 glasses (2 · 3)", "Sleep 7 h 10 min / 7 h ✓ (7 h 10 min)"; then `D-1` "– nothing" with "No entries"; then `D-2` "✗ none met" with "Water 3 / 8 glasses (3)"; no day after `D` |
| TC-126 | AC-15.5 | Unit | The time format helper | Format 0, 45, 60, 420, 430, 1439 | "0 min", "45 min", "1 h", "7 h", "7 h 10 min", "23 h 59 min" |
| TC-121 | AC-15.6 | API | See F-11 | See F-11 | B's goals never appear in A's response |
| TC-47, TC-48 | AC-15.1 to AC-15.4 | Browser | A logged in | Run the NFR-05 and NFR-06 checks on the List | No horizontal scroll at 375 and 1280 px; the switch, arrows and list work by keyboard |

## 11. Definition of done

- Every AC has a test, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- Contract and `docs/traceability.md` rows are current; the PR is reviewed and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-15.1 | List shape | Decided by phittayanan (Q8): grouped by day (ADR 0071); agreement by projectnewy pending in review |
| OP-15.2 | One endpoint for calendar and List | Drafted by Claude Code, accepted as drafted by phittayanan (Q11): ADR 0072 |
| OP-15.3 | The texts "No entries" and "No goals in this month.", and that a List day is not clickable | Drafted by Claude Code; accepted as drafted by phittayanan on 2026-11-27 (Q13) |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #151) | pending (reviewer projectnewy) |
| 2026-11-27 | Issue #156: "+ New goal" on the calendar page (ADR 0102), the desktop panel stays with the List (ADR 0103), a day with no entry has no goal rows (ADR 0104); section 2 | projectnewy; phittayanan agreed in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) of PR #185 |
