# F-13 Entry edit and delete

Sprint 2 contract (Deliverable 2 Part B, [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 contracts, ADR 0009, ADR 0061 and ADR 0063 to ADR 0074, plus ADR 0080 to ADR 0083. Points drafted by Claude Code are marked in section 12.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-13 Entry edit and delete |
| Sprint | 2 |
| Requirements | FR-17; BR-11 |
| Related | BR-01, BR-03, BR-04, BR-06, BR-07, BR-10; F-09, F-11, F-12 (AC-12.4, TC-122); NFR-02, NFR-03, NFR-05, NFR-06 |
| Depends on | F-08, F-09; F-11 (#155) for the controls in the day box |
| Needed by | F-16 (streaks count entries after edits) |
| Author / reviewer | projectnewy / phittayanan. Code owner: phittayanan (#154) |
| Status | Draft for review |

## 2. Behaviour and workflow

1. A Participant presses "Edit" on one of their entries, changes the value and saves. The date and goal do not change (ADR 0080).
2. A Participant presses "Delete" on an entry and confirms (ADR 0082). The entry is removed and cannot be restored.
3. Day totals, "days met", the calendar state and the List are computed from the stored entries, so they show the new result on the next read (BR-11; ADR 0009).
4. The controls are on the goals page and in the day box or panel (ADR 0081). This works for every day of the goal's period, also after the goal has ended and after its template is retired.

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-11 | An entry may be edited or deleted on any day inside its goal's period | SRS BR-11; ADR 0009 |
| What changes | Only the value | ADR 0080 |
| BR-03 | The new value is inside the template's range; whole minutes for `TIME` | SRS BR-03; ADR 0065 |
| BR-04 | The day total after an edit or delete is not above `max_value` (equal is allowed) | ADR 0061, ADR 0083 |
| BR-10 | Only the goal's owner | SRS BR-10 |
| Order kept | An edited entry keeps its saved time, so its place in the list does not change | OP-13.2 |

## 4. Validation and failure cases

`PATCH` and `DELETE /api/goals/:id/entries/:entryId`, checks in this order (as F-08 section 4):

| Order | Case | Result | Error code | Message |
|---|---|---|---|---|
| 0 | Origin refused | 403 | F-01 | F-01 |
| 1 | No valid session | 401 | `UNAUTHENTICATED` | F-01 |
| 2 | Caller is a Manager | 403 | `FORBIDDEN` | F-02 |
| 3 | Goal does not exist or is another Participant's | 404 | `GOAL_NOT_FOUND` | F-08 (same answer for both) |
| 4 | No entry with this id on this goal | 404 | `ENTRY_NOT_FOUND` | "Entry not found." |
| 5 | (`PATCH`) `value` missing, not a number, more than 2 decimal places or outside `Decimal(10, 2)`; a fraction on a `TIME` goal | 400 | `VALIDATION_ERROR` | F-08; "Minutes must be a whole number." |
| 6 | (`PATCH`) value below `min_value` or above `max_value` | 400 | `VALUE_OUT_OF_RANGE` | F-08 |
| 7 | (`PATCH`) total of the day's other entries plus the new value is above `max_value` | 409 | `DAILY_TOTAL_ABOVE_MAX` | If `max_value` minus the other entries is above 0: "Only {left} {unit} left for {day}." Otherwise: "{Day} would be above {max} {unit}. Change other entries first." |
| 8 | (`DELETE`) total of the day's other entries is above `max_value` | 409 | `DAILY_TOTAL_ABOVE_MAX` | "{Day} would be above {max} {unit}. Change other entries first." |

`{day}` and `{Day}` are as in F-08 OP-08.14. A refused request changes nothing.

Boundaries: saving the same value is accepted; a day total equal to `max_value` is accepted and 0.01 more is refused; `entryDate` or other fields in a `PATCH` body are ignored; a second delete of the same entry gets `ENTRY_NOT_FOUND`. Create, edit and delete on one goal take the goal row lock (`SELECT ... FOR UPDATE`, F-08 section 8), and the entry and the day total are read after the lock.

## 5. Permissions

| Caller | Edit or delete an entry |
|---|---|
| Anonymous | 401 |
| Participant | own goal's entries only; another's goal: 404 `GOAL_NOT_FOUND`; another goal's entry id under an own goal: 404 `ENTRY_NOT_FOUND` |
| Manager | 403 |

## 6. UI behaviour

- Each entry has "Edit" and "Delete" with accessible names that include the value and date, for example "Delete 3 glasses on 2026-11-27". On the goals page the entry text keeps its own element, unchanged from F-08.
- In the day box and panel each entry of a card is listed with the two controls (F-11 revision of how a card shows its entries).
- "Edit" opens a number box in place, filled with the stored value, with "Save" and "Cancel". A `TIME` entry is typed in minutes with the "= 7 h 10 min" hint on the goals page (ADR 0065) and in hour and minute boxes in the day box.
- "Delete" asks `Delete 3 glasses on 2026-11-27?` with "Cancel" and "Delete" (ADR 0082), as a dialog; focus moves into it, Escape cancels, and focus returns.
- In the day box, closing with an edited value not yet saved asks as ADR 0067 does.
- While a request runs its button is disabled. A rejected request shows the API `message` by the entry and keeps the typed value. On success the list, day total, progress, sign and calendar colour update without a reload.
- 375 px and 1280 px with no horizontal scroll; keyboard only.

## 7. API

Errors use the ADR 0025 body.

- **`PATCH /api/goals/:id/entries/:entryId`** (Participant): request `{ "value": 2.5 }`; response 200 `{ "entry": { ... } }` in the F-08 shape.
- **`DELETE /api/goals/:id/entries/:entryId`** (Participant): no body; response 204.

## 8. Data

No new table, column or migration. Edit updates `Entry.value`; delete removes the row. No history of old values is kept (SRS asks for none).

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-13.1 | The owner edits an entry's value on any day of the goal period, also for an ended goal or a retired template; it persists after a restart; date and order are unchanged |
| AC-13.2 | The owner deletes an entry (204) and it is gone after a restart |
| AC-13.3 | After an edit or delete, the day total and days met are recomputed |
| AC-13.4 | A bad value, a value outside the range and a fraction of a minute are refused as section 4, changing nothing |
| AC-13.5 | An edit or delete that would leave the day total above `max_value` gets `409 DAILY_TOTAL_ABOVE_MAX` with the section 4 message; a total equal to it is accepted |
| AC-13.6 | Anonymous, Manager, another Participant and a wrong entry id get 401, 403, 404 `GOAL_NOT_FOUND` and 404 `ENTRY_NOT_FOUND`; nothing changes |
| AC-13.7 | Concurrent create and edit on one day never leave the day total above `max_value` |
| AC-13.8 | The goals page edits and deletes as section 6, asking before a delete |
| AC-13.9 | The day box and panel do the same, and the calendar colour updates |
| AC-13.10 | Both screens fit 375 px and 1280 px and work by keyboard only |

## 10. Test specification

`D` is today in Asia/Bangkok. Fixtures: Participants A and B, a Manager; template "Water" (glasses, 1 to 12); A's goal W (target 8, `D-10` to `D+10`) with 3 and 5 on `D-1`.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-38 | AC-13.1 to AC-13.3 | API and unit | Fixtures | Read progress; edit 5 to 4; read; delete 3; read; restart and read. Unit: progress from the entries before and after | `D-1` met, then not met (7), then not met (4); the results persist; date and order unchanged |
| TC-144 | AC-13.1 | API | W's template retired; a second goal of A ended `D-1` with an entry | Edit one entry of each | Both 200 |
| TC-145 | AC-13.4 | API | Fixtures; a `TIME` goal with an entry of 45 | Edit with `{}`, "x", 2.555, 0 and 13; edit the `TIME` entry to 45.5 | `{}`, "x", 2.555 and 45.5: `400 VALIDATION_ERROR`; 0 and 13: `400 VALUE_OUT_OF_RANGE`; nothing changes |
| TC-146 | AC-13.5 | API | `D-1` has 3 and 5. A template -5 to 24 with -5, 24 and 5 on one day (saved in that order) | Edit 5 to 9, then to 9.01; on the second: delete -5; edit -5 to 0; edit 24 to 23 | 200 (12); 409 "Only 9 glasses left for {day}."; delete 409; edit to 0 409 with the "would be above" message; edit to 23 200 |
| TC-147 | AC-13.6 | API | Fixtures; B's goal with an entry | `PATCH` and `DELETE` as anonymous, Manager, B on W's entry, A with B's entry id under W, A with id 99999 and `abc`; delete one entry twice | 401; 403; `GOAL_NOT_FOUND`; `ENTRY_NOT_FOUND` for the last cases and the second delete; no other change. TC-08 lists both routes |
| TC-148 | AC-13.7 | API and database | `D-1` total 8 | At the same time edit 5 to 9 and create 4 | Exactly one succeeds; the total is at most 12 |
| TC-149 | AC-13.8 | Browser | A on the goals page | Edit 5 to 20 (rejected), then to 4; press Delete on 3, Cancel; Delete again, confirm; reload | Message shown and 20 kept; then total 7; after Cancel nothing changes; then "Day total: 4 glasses" and days met updated |
| TC-150 | AC-13.9 | Browser (cross-feature) | F-11 merged; `D-1` met | Open `D-1`; edit and delete as TC-149; close once with an unsaved edit | Card, sign and colour update without a reload; the ADR 0067 question appears |
| TC-151 | AC-13.10 | Browser | Both screens, 375 px and 1280 px | Edit and delete by keyboard only | No horizontal scroll; focus moves into the dialog and back |

TC-122 (F-12) runs once this feature is merged.

## 11. Definition of done

- Every AC has a test, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- Sprint 1 goals-page tests change only where the new buttons force a more exact locator for the same entry text; what they check stays the same.
- If F-11 is not merged yet, AC-13.9 and TC-150 are listed as "not run" and the feature is not complete.
- Contract, traceability and SDS are current; the PR is reviewed and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-13.1 | Value only; both places (F-11 OP-11.10); delete confirmation; day-total cap | Decided by projectnewy (ADR 0080 to ADR 0083); phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-13.2 | An edit keeps the entry's saved time and order | Drafted by Claude Code; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-13.3 | Codes (`ENTRY_NOT_FOUND`, 204), messages, check order, in-place editing, labels, and ADR 0067 applying to an unsaved edit | Drafted by Claude Code; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-13.4 | Wording of the ADR 0067 question for an unsaved edit in the day box | Proposed by Claude Code in #154: ask only when the typed value differs from the stored one, "Discard the edit to 4 glasses?" (ADR 0101); chosen by phittayanan on 2026-11-27 |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #150) | pending (reviewer phittayanan) |
| 2026-11-27 | [Review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171: phittayanan agreed to the decisions and drafted points (section 12) | pending (reviewer phittayanan) |
| 2026-11-27 | Issue #154: OP-13.4 and ADR 0101 (unsaved-edit question); the day box lists a card's entries as a list with Edit and Delete | phittayanan (ADR 0101); projectnewy pending (PR review) |
