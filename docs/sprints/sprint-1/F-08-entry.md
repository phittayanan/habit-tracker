# F-08 Daily entry recording

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12 as an open point; nothing was guessed.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-08 Daily entry recording |
| Sprint | 1 |
| Requirements | FR-11; BR-01, BR-02, BR-03, BR-04, BR-06 |
| Related | NFR-02, NFR-03, NFR-05, NFR-06, NFR-08; SRS A-11 (known Sprint 1 limit) |
| Depends on | F-07 (a goal exists), F-01, F-02 |
| Needed by | F-09, F-10 |
| Author / reviewer | projectnewy / phittayanan |
| Status | Draft |

## 2. Behaviour and workflow

1. A logged-in Participant chooses one of their goals and a day, and types a number (ADR 0039). The goal's unit is shown next to the box.
2. On Save the API checks the request (section 4). If it passes, one Entry row is stored for that goal and day.
3. The goals page shows the saved value after the page is reloaded and after the app restarts.
4. An entry cannot be edited or deleted in Sprint 1 (editing is FR-17, Sprint 2). A wrong same-day entry cannot be fixed yet (SRS BR-04, A-11).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-01 | The entry date is today or earlier, and inside the goal's start and end dates (both inclusive). Anything else is rejected | SRS BR-01; ADR 0005 |
| BR-02 | A day is a date in Asia/Bangkok for every user. "Today" is computed on the server | SRS BR-02; ADR 0006; SDS 2.3 |
| BR-03 | The value lies within the template's `min_value` and `max_value`, inclusive | SRS BR-03; ADR 0007 |
| BR-04 | At most one entry per goal per day. A second entry for the same day is rejected | SRS BR-04; ADR 0008 |
| BR-06 | An entry to an Ended goal is rejected by BR-01 (its date is after the end date, or the day is outside the period) | SRS BR-06 |

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): session (401), role (403), ownership (404), validation (400), rules (400 for BR-01 and BR-03, 409 for BR-04; SDS S-16 is still open, see OP-08.1).

| Case | Result | Error code |
|---|---|---|
| No valid session | 401 | `UNAUTHENTICATED` |
| Caller is a Manager | 403 | `FORBIDDEN` |
| Goal does not exist, or belongs to another Participant | 404 | `GOAL_NOT_FOUND` (the same answer for both) |
| `entryDate` missing or not `YYYY-MM-DD`; `value` missing or not a number | 400 | `VALIDATION_ERROR` |
| `entryDate` after today (Asia/Bangkok) | 400 | `ENTRY_DATE_IN_FUTURE` |
| `entryDate` before the goal's start date or after its end date | 400 | `ENTRY_DATE_OUTSIDE_GOAL` |
| `value` below `min_value` or above `max_value` | 400 | `VALUE_OUT_OF_RANGE` |
| An entry already exists for this goal and day | 409 | `ENTRY_ALREADY_EXISTS` |

Boundaries: a value equal to `min_value` or `max_value` is accepted; `entryDate` equal to today, to the start date or to the end date is accepted; an entry on the day after the end date is rejected (the goal is Ended). Two requests for the same day at the same time give one stored entry and one 409 (the database unique constraint decides).

## 5. Permissions

| Caller | Record an entry | List entries |
|---|---|---|
| Anonymous | 401 | 401 |
| Participant | on own goal only | own goal only |
| Manager | 403 | 403 |

Another Participant's goal gives 404 (SDS S-7). The acting user is always the session user.

## 6. UI behaviour

- On the plain goals page each goal row has a number box with the template's unit and a Save control for the chosen day (today by default). Sprint 1 has no calendar (SRS A-3).
- The browser may check the date and the range first for a faster message; the API still decides.
- A rejected request shows the API `message` next to the box and keeps the typed value. While it runs, Save is disabled. Nothing is shown as saved until the API answers 201.
- Empty state for a goal with no entries: "No entries yet".
- 375 px and 1280 px wide with no horizontal scroll; the box and Save work with the keyboard alone (NFR-05, NFR-06).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025).

**`POST /api/goals/:id/entries`** (Participant, own goal)

Request:
```json
{ "entryDate": "2026-11-10", "value": 7.5 }
```
Response 201:
```json
{ "entry": { "id": 41, "goalId": 12, "entryDate": "2026-11-10", "value": 7.5 } }
```
Errors: 400, 401, 403, 404, 409 as in section 4. The date is required in the API; the UI fills in today (OP-08.2).

**`GET /api/goals/:id/entries`** (Participant, own goal): returns `{ "entries": [ ... ] }` in the shape above, newest date first (OP-08.3). Errors: 401, 403, 404.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `Entry` | `id` integer primary key; `goal_id` not null, reference to Goal, on delete restrict; `entry_date` date not null; `value` decimal not null; `created_at` timestamp not null (SDS 3.2) |
| Constraints | **unique (`goal_id`, `entry_date`)**, which enforces BR-04 even under two requests at once. The value range and the date rules compare other tables or "today", so the service enforces them |
| Migration | One additive Prisma migration that creates `Entry`. It changes no existing table |
| Ownership | An Entry belongs to a Participant through its Goal (`participant_id`) |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-08.1 | A valid request gets 201 and the entry; `GET /api/goals/:id/entries` returns it, also after the app restarts, and the goals page shows the value with the template's unit |
| AC-08.2 | A date after today (Asia/Bangkok) gets 400 `ENTRY_DATE_IN_FUTURE` and nothing is stored |
| AC-08.3 | A date before the goal's start or after its end gets 400 `ENTRY_DATE_OUTSIDE_GOAL`; an entry to an Ended goal on a day after its end date is rejected the same way |
| AC-08.4 | Today, the start date and the end date are accepted |
| AC-08.5 | Two entries a few seconds either side of midnight Asia/Bangkok are treated as two different days |
| AC-08.6 | A value below `min_value` or above `max_value` gets 400 `VALUE_OUT_OF_RANGE`; values equal to either limit are accepted |
| AC-08.7 | A second entry for the same goal and day gets 409 `ENTRY_ALREADY_EXISTS`, and the stored entry is not changed |
| AC-08.8 | A missing or malformed date or value gets 400 `VALIDATION_ERROR` and nothing is stored |
| AC-08.9 | An anonymous caller gets 401, a Manager 403, and another Participant's or an unknown goal 404; nothing is stored |
| AC-08.10 | The browser shows the API message for a rejected entry and keeps the typed value |

## 10. Test specification

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-23 | AC-08.1 | API and browser | Fixed clock 2026-11-10; A's goal G (2026-11-01 to 2026-11-30) on template T (min 0, max 24, unit hours) | `POST` value 7.5 for 2026-11-10; then read the goals page | 201; the entry is listed; the page shows "7.5 hours" |
| TC-24 | AC-08.2 | Unit and API | Same fixed clock | `POST` for 2026-11-11 | 400 `ENTRY_DATE_IN_FUTURE`; no row stored |
| TC-25 | AC-08.3 | Unit and API | Goal 2026-11-05 to 2026-11-20 | With clock 2026-11-10 `POST` for 11-04 (before the start); with clock 2026-11-25 `POST` for 11-21 (after the end) | Each gets 400 `ENTRY_DATE_OUTSIDE_GOAL`; no row stored |
| TC-26 | AC-08.4 | Unit and API | Goal 2026-11-05 to 2026-11-20; clock 2026-11-20 | `POST` for 11-05 and for 11-20 | Both 201 |
| TC-27 | AC-08.5 | Unit | Clock set to 2026-11-10T16:59:59Z (23:59:59 in Bangkok), then 2026-11-10T17:00:00Z (00:00:00 on 11-11 in Bangkok) | Compute "today" and accept or reject a 11-11 entry | At the first instant today is 11-10 and 11-11 is rejected; at the second today is 11-11 and 11-11 is accepted |
| TC-28 | AC-08.6 | Unit and API | Template min 0, max 24 | `POST` values -0.5, 0, 24, 24.5 | -0.5 and 24.5 get 400 `VALUE_OUT_OF_RANGE`; 0 and 24 get 201 |
| TC-29 | AC-08.7 | API | An entry already exists for G on 2026-11-10 | `POST` again for that day (and two at once) | 409 `ENTRY_ALREADY_EXISTS`; one row; the first value unchanged |
| TC-30 | AC-08.3 | Unit and API | Goal ended 2026-11-20; clock 2026-11-25 | `POST` for 11-21 | 400 `ENTRY_DATE_OUTSIDE_GOAL`; no row stored |
| TC-56 | AC-08.8, AC-08.9 | API | A logged in | Send bodies with no date, bad date format, no value, `"abc"`; send as Manager, as anonymous, to B's goal and to goal id 99999 | 400 for bad bodies; 403, 401, 404, 404; no row stored |
| TC-58 | AC-08.1 | API and database | A's goal G; entry saved | Restart the app (new process and connection); `GET /api/goals/:id/entries` | The same entry is returned (data survives a restart) |
| TC-61 | AC-08.10 | Browser | A logged in on the goals page | Type 30 (above max 24) and Save; then a valid value | The first shows the API message and keeps 30; the second saves |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The migration is additive; the unique constraint exists in the database and TC-29 proves it under two requests at once.
- Rule code for BR-01 to BR-04 and BR-06 is unit tested, and the clock is injectable so TC-24 to TC-27 do not depend on the real date (NFR-08).
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points and the Sprint 1 limit (no edit) are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points

| ID | Open point | Proposal |
|---|---|---|
| OP-08.1 | Codes for rule rejections (SDS S-16 is open) | 400 for BR-01 and BR-03, 409 for BR-04, as in the SDS proposal |
| OP-08.2 | Whether `entryDate` may be left out of the request (default today) | Required in the API; the UI fills in today |
| OP-08.3 | Order of `GET /api/goals/:id/entries` | Newest date first, matching ADR 0014; confirm |
| OP-08.4 | A value of exactly the daily target counts as "day met" later (F-09). Is an entry above the daily target allowed | Yes, only the template range limits the value (BR-03) |
| OP-08.5 | Decimal precision of `value` (SDS S-2: fixed, scale set in the contracts) | Two decimal places; confirm |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
