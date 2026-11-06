# F-08 Daily entry recording

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

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
| Status | Draft, review round 1 applied |

## 2. Behaviour and workflow

1. A logged-in Participant chooses one of their goals, a day and a number (ADR 0039). The goal's unit is shown next to the box.
2. On Save the API checks the request (section 4). If it passes, one Entry row is stored for that goal and day.
3. The goals page shows the saved value after the page is reloaded and after the app restarts.
4. An entry cannot be edited or deleted in Sprint 1 (editing is FR-17, Sprint 2). A wrong same-day entry cannot be fixed yet (SRS BR-04, A-11).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-01 | The entry date is today or earlier, and inside the goal's start and end dates (both inclusive). Anything else is rejected | SRS BR-01; ADR 0005 |
| BR-02 | A day is a date in Asia/Bangkok for every user. "Today" is computed on the server, and the UI's default date uses the same zone | SRS BR-02; ADR 0006; SDS 2.3 |
| BR-03 | The value lies within the template's `min_value` and `max_value`, inclusive | SRS BR-03; ADR 0007 |
| BR-04 | At most one entry per goal per day. A second entry for the same day is rejected | SRS BR-04; ADR 0008 |
| BR-06 | An entry dated after an Ended goal's end date is rejected by BR-01. An entry dated inside the period of a goal that has already ended is still accepted, because BR-01 accepts it (decided, OP-08.6) | SRS BR-06; ADR 0012 |

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): session (401), role (403), ownership (404), validation (400), then the rules below in this order (OP-08.7). The status codes for rule rejections follow the SDS proposal S-16, which is still open (OP-08.1).

| Order | Case | Result | Error code |
|---|---|---|---|
| 1 | No valid session | 401 | `UNAUTHENTICATED` |
| 2 | Caller is a Manager | 403 | `FORBIDDEN` |
| 3 | Goal does not exist, or belongs to another Participant | 404 | `GOAL_NOT_FOUND` (the same answer for both) |
| 4 | `entryDate` missing or not `YYYY-MM-DD`; `value` missing or not a number | 400 | `VALIDATION_ERROR` |
| 5 | `entryDate` after today (Asia/Bangkok) | 400 | `ENTRY_DATE_IN_FUTURE` |
| 6 | `entryDate` before the goal's start date or after its end date | 400 | `ENTRY_DATE_OUTSIDE_GOAL` |
| 7 | `value` below `min_value` or above `max_value` | 400 | `VALUE_OUT_OF_RANGE` |
| 8 | An entry already exists for this goal and day | 409 | `ENTRY_ALREADY_EXISTS` |

When a request breaks more than one rule, the first one in this table is returned. Example: with today `D`, a goal ending `D+5` and an entry for `D+10`, the date is both in the future and outside the goal; the answer is `ENTRY_DATE_IN_FUTURE`.

Unknown body fields are stripped and do not cause an error (decided, OP-07.7).

Boundaries: a value equal to `min_value` or `max_value` is accepted; `entryDate` equal to today, to the start date or to the end date is accepted; an entry dated after the end date is rejected. Two requests for the same day at the same time give one stored entry and one 409 (the database unique constraint decides).

## 5. Permissions

| Caller | Record an entry | List entries |
|---|---|---|
| Anonymous | 401 | 401 |
| Participant | on own goal only | own goal only |
| Manager | 403 | 403 |

Another Participant's goal gives 404 (SDS S-7). The acting user is always the session user.

## 6. UI behaviour

- On the plain goals page (Sprint 1 has no calendar; SRS A-3) each goal row has a **date box** next to a **number box** that shows the template's unit, and a Save control. The date box defaults to today in Asia/Bangkok, not the browser's local date (BR-02); the Participant can pick another day (decided, OP-08.8).
- The browser may check the date and the range first for a faster message; the API still decides.
- A rejected request shows the API `message` next to the box and keeps the typed value. While it runs, Save is disabled. Nothing is shown as saved until the API answers 201.
- Empty state for a goal with no entries: "No entries yet".
- 375 px and 1280 px wide with no horizontal scroll; the boxes and Save work with the keyboard alone (NFR-05, NFR-06).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025). Decimal values travel as JSON numbers (OP-07.8).

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

**`GET /api/goals/:id/entries`** (Participant, own goal): returns `{ "entries": [ ... ] }` in the shape above, newest date first (ADR 0014; OP-08.3). Errors: 401, 403, 404.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `Entry` | `id` integer primary key; `goal_id` not null, reference to Goal, on delete restrict; `entry_date` date not null; `value` decimal not null (2 decimal places, OP-07.8); `created_at` timestamp not null (SDS 3.2) |
| Constraints | **unique (`goal_id`, `entry_date`)**, which enforces BR-04 even under two requests at once. The value range and the date rules compare other tables or "today", so the service enforces them |
| Migration | One additive Prisma migration that creates `Entry`. It changes no existing table |
| Ownership | An Entry belongs to a Participant through its Goal (`participant_id`) |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-08.1 | A valid request gets 201 and the entry; `GET /api/goals/:id/entries` returns it, also after the app restarts, and the goals page shows the value with the template's unit |
| AC-08.2 | A date after today (Asia/Bangkok) gets 400 `ENTRY_DATE_IN_FUTURE` and nothing is stored, also when the date is outside the goal as well (this rule is checked first) |
| AC-08.3 | A date before the goal's start or after its end gets 400 `ENTRY_DATE_OUTSIDE_GOAL`, including an entry dated after the end of an Ended goal |
| AC-08.4 | Today, the start date and the end date are accepted |
| AC-08.5 | Today is the Asia/Bangkok date: at 23:59:59 Bangkok on 2026-11-10 an entry for 2026-11-11 gets 400 `ENTRY_DATE_IN_FUTURE`; at 00:00:00 on 2026-11-11 the same entry is accepted. This holds whatever time zone the server process uses |
| AC-08.6 | A value below `min_value` or above `max_value` gets 400 `VALUE_OUT_OF_RANGE`; values equal to either limit are accepted |
| AC-08.7 | A second entry for the same goal and day gets 409 `ENTRY_ALREADY_EXISTS`, and the stored entry is not changed |
| AC-08.8 | A missing or malformed date or value gets 400 `VALIDATION_ERROR` and nothing is stored |
| AC-08.9 | An anonymous caller gets 401 `UNAUTHENTICATED`, a Manager 403 `FORBIDDEN`, and another Participant's or an unknown goal 404 `GOAL_NOT_FOUND`; nothing is stored |
| AC-08.10 | The browser shows the API message for a rejected entry and keeps the typed value |
| AC-08.11 | An entry dated inside the period of a goal that has already ended (and not in the future) is accepted |
| AC-08.12 | The date box on the goals page defaults to today in Asia/Bangkok, whatever the browser's time zone |

## 10. Test specification

Dates in tests (decided on PR #29, OP-07.9): `D` is today in Asia/Bangkok. Tests that go through the running server use dates relative to `D`, so the server needs no clock hook. Unit tests of the rule code pass the current instant as an argument. Each test starts with its own fixtures, so the goals named G to G6 are separate per test and BR-05 (one active goal per template) does not interfere between them.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-23 | AC-08.1 | API and browser | A's goal G (start `D-9`, end `D+20`) on template T (min 0, max 24, unit hours) | `POST` value 7.5 for `D`; then read the goals page | 201; the entry is listed; the page shows "7.5 hours" |
| TC-24 | AC-08.2 | Unit and API | G as above; a second goal G2 ending `D+5` on another template | `POST` for `D+1` on G; `POST` for `D+10` on G2 | Both get `400 ENTRY_DATE_IN_FUTURE` (the second is also outside G2, and the future rule comes first); no row stored |
| TC-25 | AC-08.3 | Unit and API | Goal G3 (`D-15` to `D+5`); Ended goal G4 (`D-15` to `D-5`) on another template | `POST` for `D-16` on G3; `POST` for `D-4` on G4 | Each gets `400 ENTRY_DATE_OUTSIDE_GOAL`; no row stored |
| TC-26 | AC-08.4 | Unit and API | Goal G5 (`D-15` to `D`) | `POST` for `D-15` (the start) and for `D` (today, which is the end date) | Both 201 |
| TC-27 | AC-08.5, AC-08.12 | Unit | Process time zone set to `TZ=UTC`; a goal whose period is 2026-11-01 to 2026-11-30; the instant is passed as an argument | At 2026-11-10T16:59:59Z (23:59:59 Bangkok) check an entry for 2026-11-11 and the UI's default-date helper; at 2026-11-10T17:00:00Z (00:00:00 on 11-11 Bangkok) check them again | First instant: today is 2026-11-10, the entry gets `ENTRY_DATE_IN_FUTURE`, the helper returns 2026-11-10. Second instant: today is 2026-11-11, the entry is accepted, the helper returns 2026-11-11. An implementation that uses the machine's local zone fails the first check |
| TC-28 | AC-08.6 | Unit and API | Goal G6 (`D-15` to `D+5`) on template T (min 0, max 24) | `POST` -0.5 for `D-15` and 24.5 for `D-15` (both rejected); then 0 for `D-15` (accepted) and 24 for `D-14` (accepted) | -0.5 and 24.5 get `400 VALUE_OUT_OF_RANGE` with no row stored; 0 and 24 get 201 (each accepted value has its own day) |
| TC-29 | AC-08.7 | API | An entry already exists for G on `D` | `POST` again for `D` (and two requests at once) | `409 ENTRY_ALREADY_EXISTS`; one row; the first value unchanged |
| TC-30 | AC-08.3, AC-08.11 | Unit and API | Ended goal G4 (`D-15` to `D-5`) | `POST` for `D-4`; then `POST` for `D-10` | `D-4` gets `400 ENTRY_DATE_OUTSIDE_GOAL`; `D-10` (inside the period, in the past) gets 201 |
| TC-56 | AC-08.8, AC-08.9 | API | A logged in; A's goal G | Send bodies with no date, bad date format, no value, value "abc" (all to G). Send a valid body as Manager and as anonymous. Send a valid body to B's goal and to goal id 99999 | Bad bodies get `400 VALIDATION_ERROR`; Manager `403 FORBIDDEN`; anonymous `401 UNAUTHENTICATED`; B's goal and 99999 get `404 GOAL_NOT_FOUND`; no row stored |
| TC-58 | AC-08.1 | API and database | A's goal G; entry saved | Restart the app (new process and connection); `GET /api/goals/:id/entries` | The same entry is returned (data survives a restart) |
| TC-61 | AC-08.10 | Browser | A logged in on the goals page | Type 30 (above max 24) and Save; then a valid value | The first shows the API message and keeps 30; the second saves |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The migration is additive; the unique constraint exists in the database and TC-29 proves it under two requests at once.
- Rule code for BR-01 to BR-04 and BR-06 is unit tested, and the rule code takes the current instant as an argument so TC-24 to TC-27 do not depend on the real date; TC-27 runs with `TZ=UTC` (NFR-08).
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points and the Sprint 1 limit (no edit) are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-08.1 | Codes for rule rejections (SDS S-16 is open) | Open (proposal): 400 for BR-01 and BR-03, 409 for BR-04, as in the SDS proposal |
| OP-08.2 | May `entryDate` be left out of the request (default today) | Open (proposal): required in the API; the UI fills in the date |
| OP-08.3 | Order of `GET /api/goals/:id/entries` | Settled by ADR 0014 ("newest first"): newest date first |
| OP-08.4 | A value above the daily target is allowed | Open (proposal): yes, only the template range limits the value (BR-03) |
| OP-08.5 | Decimal scale of `value` | Decided on PR #29 (Q8): 2 decimal places for all four decimal columns; see OP-07.8 |
| OP-08.6 | An entry dated inside the period of a goal that has already ended | Decided on PR #29 (Q1): allowed (ADR 0012, BR-01); AC-08.11, TC-30 |
| OP-08.7 | Which code when a request breaks several rules | Open (proposal from review point 10): `ENTRY_DATE_IN_FUTURE`, then `ENTRY_DATE_OUTSIDE_GOAL`, then `VALUE_OUT_OF_RANGE`, then `ENTRY_ALREADY_EXISTS` |
| OP-08.8 | How the Sprint 1 goals page chooses the day | Decided on PR #29 (Q9): a date box next to the value box, defaulting to today in Asia/Bangkok |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
| 2026-11-07 | Review round 1 (PR #29): TC-28 gives each accepted value its own day; codes in TC-56; test dates relative to the Bangkok today; AC-08.5 and TC-27 reworded (TZ=UTC, goal period); AC-08.11 and AC-08.12 added; order of rule checks; date box named; decimal scale; decisions Q1, Q8, Q9 recorded | pending (partner re-check) |
