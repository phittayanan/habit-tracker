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
| Status | Revised for Lab 7 (Issue #139, ADR 0061): several entries per day with a day-total maximum. First version agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119); later changes re-checked and approved by phittayanan in the [re-check of eda4c6b](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777). Implemented in Issue #140 ([evidence](../../labs/lab-07/implementation.md)) |

## 2. Behaviour and workflow

1. A logged-in Participant chooses one of their goals, a day and a number (ADR 0039). The goal's unit is shown next to the box.
2. On Save the API checks the request (section 4). If it passes, one more Entry row is stored for that goal and day.
3. The goals page shows the saved value after the page is reloaded and after the app restarts.
4. A Participant may save further entries for the same day; each one is added to that day (ADR 0061). An entry cannot be edited or deleted (editing is FR-17, Sprint 2), so a wrong entry cannot be fixed yet (SRS BR-04, A-11).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-01 | The entry date is today or earlier, and inside the goal's start and end dates (both inclusive). Anything else is rejected | SRS BR-01; ADR 0005 |
| BR-02 | A day is a date in Asia/Bangkok for every user. "Today" is computed on the server, and the UI's default date uses the same zone | SRS BR-02; ADR 0006; SDS 2.3 |
| BR-03 | The value lies within the template's `min_value` and `max_value`, inclusive. The value has at most 2 decimal places and lies within `Decimal(10, 2)` (up to 99,999,999.99); a number with more places is refused, never rounded | SRS BR-03; ADR 0007; F-03 OP-03.3, OP-03.4 |
| BR-04 | Several entries per goal per day are allowed. The sum of a goal's values on one day (the day total) is not above the template's `max_value`; equal is accepted. Values are added exactly to 2 decimal places. The sum is per goal and per day. `min_value` limits each entry (BR-03), not the total | SRS BR-04; ADR 0061 |
| BR-06 | An entry dated after an Ended goal's end date is rejected by BR-01. An entry dated inside the period of a goal that has already ended is still accepted, because BR-01 accepts it (decided, OP-08.6) | SRS BR-06; ADR 0012 |

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): session (401), role (403), ownership (404), validation (400), then the rules below in this order (OP-08.7). The status codes for rule rejections follow the SDS proposal S-16, which is still open (OP-08.1).

| Order | Case | Result | Error code |
|---|---|---|---|
| 1 | No valid session | 401 | `UNAUTHENTICATED` |
| 2 | Caller is a Manager | 403 | `FORBIDDEN` |
| 3 | Goal does not exist, or belongs to another Participant | 404 | `GOAL_NOT_FOUND` (the same answer for both) |
| 4 | `entryDate` missing or not `YYYY-MM-DD`; `value` missing or not a number, with more than 2 decimal places, or above 99,999,999.99 or below -99,999,999.99 (outside `Decimal(10, 2)`) | 400 | `VALIDATION_ERROR` (decided, F-03 OP-03.3 and OP-03.4) |
| 5 | `entryDate` after today (Asia/Bangkok) | 400 | `ENTRY_DATE_IN_FUTURE` |
| 6 | `entryDate` before the goal's start date or after its end date | 400 | `ENTRY_DATE_OUTSIDE_GOAL` |
| 7 | `value` below `min_value` or above `max_value` | 400 | `VALUE_OUT_OF_RANGE` |
| 8 | The day total, including this value, would be above `max_value` | 409 | `DAILY_TOTAL_ABOVE_MAX` (OP-08.9); message (OP-08.14): "Only {left} {unit} left for {day}." where `left` is `max_value` minus the stored day total; when that is 0, "{Day} is full ({max} {unit})." `{day}` is "today" when the entry date is today, otherwise the date; `{Day}` is the same with a capital first letter |

When a request breaks more than one rule, the first one in this table is returned. Example: with today `D`, a goal ending `D+5` and an entry for `D+10`, the date is both in the future and outside the goal; the answer is `ENTRY_DATE_IN_FUTURE`.

Because row 4 comes before row 7, a value with more than 2 decimal places gets `VALIDATION_ERROR` even when it is also out of range. Example: 24.555 for a template with maximum 24 gets `400 VALIDATION_ERROR`, not `VALUE_OUT_OF_RANGE`.

Unknown body fields are stripped and do not cause an error (decided, OP-07.7).

Boundaries: a value equal to `min_value` or `max_value` is accepted; `entryDate` equal to today, to the start date or to the end date is accepted; an entry dated after the end date is rejected. A value that makes the day total equal to `max_value` is accepted; 0.01 more is refused. Requests for the same goal at the same time are checked one after another (the goal row lock, section 8), so the stored day total is never above `max_value`.

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
- The goal's list shows every entry, newest date first and, within a day, newest saved first, and shows for each day that has entries "Day total: {total} {unit}" (OP-08.10, OP-08.11). After a save the total updates.
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

**`GET /api/goals/:id/entries`** (Participant, own goal): returns `{ "entries": [ ... ] }` in the shape above, newest date first (ADR 0014; OP-08.3) and, for the same date, newest saved first (OP-08.10). Errors: 401, 403, 404.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `Entry` | `id` integer primary key; `goal_id` not null, reference to Goal, on delete restrict; `entry_date` date not null; `value` decimal not null (`Decimal(10, 2)`; OP-07.8, F-03 OP-03.4); `created_at` timestamp not null (SDS 3.2) |
| Constraints | An index on (`goal_id`, `entry_date`), **not unique** (ADR 0061). The value range, the date rules and the day-total rule are enforced by the service |
| Day-total lock | In one transaction the service locks the goal row (`SELECT ... FOR UPDATE`), sums that day's entries in the database as decimals, checks the template maximum and inserts. The template maximum cannot change meanwhile, because a template that a goal uses cannot be edited (BR-08) |
| Migration | Sprint 1: one additive migration creates `Entry`. Lab 7: a second migration drops the unique index on (`goal_id`, `entry_date`) and adds the non-unique index. It changes no row. Existing data has at most one in-range entry per day, so it already meets the day-total rule. It is not additive: code from `v1.4` relies on the unique index, so after this migration a rollback of the app to `v1.4` would accept further same-day entries with no day-total check |
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
| AC-08.7 | (Revised, Lab 7) A second entry for the same goal and day whose day total is not above `max_value` gets 201; both entries are stored and the earlier one is not changed |
| AC-08.8 | A missing or malformed date or value, a value with more than 2 decimal places, or a value outside `Decimal(10, 2)` gets 400 `VALIDATION_ERROR` (also when it is out of the template range as well) and nothing is stored |
| AC-08.9 | An anonymous caller gets 401 `UNAUTHENTICATED`, a Manager 403 `FORBIDDEN`, and another Participant's or an unknown goal 404 `GOAL_NOT_FOUND`; nothing is stored |
| AC-08.10 | The browser shows the API message for a rejected entry and keeps the typed value |
| AC-08.11 | An entry dated inside the period of a goal that has already ended (and not in the future) is accepted |
| AC-08.12 | The date box on the goals page defaults to today in Asia/Bangkok, whatever the browser's time zone |
| AC-08.13 | A value that makes the day total equal to `max_value` is accepted. A value that would make it above `max_value`, even by 0.01, gets 409 `DAILY_TOTAL_ABOVE_MAX` with the message of section 4, and nothing is stored. Other days of the goal and other goals do not count towards the total |
| AC-08.14 | The day total is exact to 2 decimal places: with `max_value` 0.3, entries 0.1 and then 0.2 are both accepted |
| AC-08.15 | The day-total check and the insert run in one transaction that locks the goal row: while another transaction holds a `FOR UPDATE` lock on the goal, the request waits and then counts the entries committed meanwhile. Of two requests at once that fit one at a time but not together, one gets 201 and one 409 |
| AC-08.16 | The day-total rule is checked last: a request that also fails an earlier row of section 4 gets that row's answer (for example 25 with `max_value` 24 gets `400 VALUE_OUT_OF_RANGE`, whatever the day already holds) |
| AC-08.17 | The goals page and `GET /api/goals/:id/entries` show every entry of a day in the order of section 7, and the page shows that day's total with the unit |
| AC-08.18 | The Lab 7 migration keeps every existing `Entry` row unchanged, removes the unique index and keeps "a goal with entries cannot be deleted" |
| AC-08.19 | On a template that allows negative values, only the upper limit is checked on the day total: a negative entry inside the template range is accepted and lowers the total, and further entries are checked against the lowered total (OP-08.12) |

## 10. Test specification

Dates in tests (decided on PR #29, OP-07.9): `D` is today in Asia/Bangkok. Tests that go through the running server use dates relative to `D`, so the server needs no clock hook. Unit tests of the rule code pass the current instant as an argument. Each test starts with its own fixtures, so the goals named G to G6 are separate per test and BR-05 (one active goal per template) does not interfere between them.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-23 | AC-08.1 | API and browser | A's goal G (start `D-9`, end `D+20`) on template T (min 0, max 24, unit hours) | `POST` value 7.5 for `D`; then read the goals page | 201; the entry is listed; the page shows "7.5 hours" |
| TC-24 | AC-08.2 | Unit and API | G as above; a second goal G2 ending `D+5` on another template | `POST` for `D+1` on G; `POST` for `D+10` on G2 | Both get `400 ENTRY_DATE_IN_FUTURE` (the second is also outside G2, and the future rule comes first); no row stored |
| TC-25 | AC-08.3 | Unit and API | Goal G3 (`D-15` to `D+5`); Ended goal G4 (`D-15` to `D-5`) on another template | `POST` for `D-16` on G3; `POST` for `D-4` on G4 | Each gets `400 ENTRY_DATE_OUTSIDE_GOAL`; no row stored |
| TC-26 | AC-08.4 | Unit and API | Goal G5 (`D-15` to `D`) | `POST` for `D-15` (the start) and for `D` (today, which is the end date) | Both 201 |
| TC-27 | AC-08.5, AC-08.12 | Unit | Process time zone set to `TZ=UTC`; a goal whose period is 2026-11-01 to 2026-11-30; the instant is passed as an argument | At 2026-11-10T16:59:59Z (23:59:59 Bangkok) check an entry for 2026-11-11 and the UI's default-date helper; at 2026-11-10T17:00:00Z (00:00:00 on 11-11 Bangkok) check them again | First instant: today is 2026-11-10, the entry gets `ENTRY_DATE_IN_FUTURE`, the helper returns 2026-11-10. Second instant: today is 2026-11-11, the entry is accepted, the helper returns 2026-11-11. An implementation that uses the machine's local zone fails the second check (with `TZ=UTC`, 17:00:00Z is still 11-10 locally) |
| TC-28 | AC-08.6 | Unit and API | Goal G6 (`D-15` to `D+5`) on template T (min 0, max 24) | `POST` -0.5 for `D-15` and 24.5 for `D-15` (both rejected); then 0 for `D-15` (accepted) and 24 for `D-14` (accepted) | -0.5 and 24.5 get `400 VALUE_OUT_OF_RANGE` with no row stored; 0 and 24 get 201 (each accepted value has its own day) |
| TC-29 | AC-08.7 | API | An entry of 3 already exists for G on `D` (max 24) | `POST` 9 for `D`; then `GET` the entries | (Revised, Lab 7; before: `409 ENTRY_ALREADY_EXISTS`) 201; two rows for `D` with 9 and 3 in that order; the first row is unchanged |
| TC-30 | AC-08.3, AC-08.11 | Unit and API | Ended goal G4 (`D-15` to `D-5`) | `POST` for `D-4`; then `POST` for `D-10` | `D-4` gets `400 ENTRY_DATE_OUTSIDE_GOAL`; `D-10` (inside the period, in the past) gets 201 |
| TC-56 | AC-08.8, AC-08.9 | API | A logged in; A's goal G | Send bodies with no date, bad date format, no value, value "abc", value 7.555, value 24.555 (above the max of 24 and with 3 decimal places), value 100000000 (all to G). Send a valid body as Manager and as anonymous. Send a valid body to B's goal and to goal id 99999 | Bad bodies get `400 VALIDATION_ERROR`; Manager `403 FORBIDDEN`; anonymous `401 UNAUTHENTICATED`; B's goal and 99999 get `404 GOAL_NOT_FOUND`; no row stored |
| TC-58 | AC-08.1 | API and database | A's goal G; entry saved | Restart the app (new process and connection); `GET /api/goals/:id/entries` | The same entry is returned (data survives a restart) |
| TC-61 | AC-08.10 | Browser | A logged in on the goals page; template unit hours, max 24 | Type 30 (above max 24) and Save; then 7.5; then 17 for the same day (total 24.5) | The first shows the API message and keeps 30; 7.5 saves; (revised, Lab 7; before: a second entry showed "already exists") 17 shows "Only 16.5 hours left for today." and keeps 17 |
| TC-82 | AC-08.13 | Unit and API | Template T (min 0, max 24, unit hours); goals G (T) and H (another template); entry 20 on G for `D` | On G for `D`: `POST` 4.01, then 4, then 0.01, then 0. Then 24 on G for `D-1`, and a value in range on H for `D` | 4.01 gets `409 DAILY_TOTAL_ABOVE_MAX` with "Only 4 hours left for today." and no row; 4 gets 201 (total 24); 0.01 gets 409 with "Today is full (24 hours)."; 0 gets 201 (total stays 24); `D-1` and H are accepted |
| TC-83 | AC-08.14 | Unit and API | Template with min 0, max 0.3; goal on it | `POST` 0.1, then 0.2, then 0.01 for `D` | 201, 201, then `409 DAILY_TOTAL_ABOVE_MAX`. Adding the values as binary floating point (0.1 + 0.2 > 0.3) fails the second check |
| TC-84 | AC-08.15 | API and database | G (max 24) with 20 on `D` | (a) Send 3 and 3 at once. (b) With fresh data (20 on `D`), open a transaction that locks the goal row `FOR UPDATE`; start `POST` 3 without waiting; after 500 ms check it has not finished; insert an entry of 2 for `D` in the open transaction and commit | (a) One 201 and one 409; total 23. (b) The request waits, then gets `409 DAILY_TOTAL_ABOVE_MAX`; total 22 |
| TC-85 | AC-08.16 | Unit and API | G (max 24) with 24 on `D` | `POST` 25 for `D`; 1 for `D+1`; 1.555 for `D`; 1 for `D` | `VALUE_OUT_OF_RANGE`, `ENTRY_DATE_IN_FUTURE`, `VALIDATION_ERROR`, `DAILY_TOTAL_ABOVE_MAX` |
| TC-86 | AC-08.17 | Browser | A logged in; goal on a template with unit hours, max 24 | Save 3 then 4.5 for today; reload | Both entries show, 4.5 first, and "Day total: 7.5 hours", before and after the reload |
| TC-89 | AC-08.18 | API and database | A database at the migrations of `v1.4` with entries on several goals and days | Apply the Lab 7 migration; read the rows and the indexes; try to delete a goal that has entries | The rows are identical; no unique index on (`goal_id`, `entry_date`), a non-unique one exists; the delete is refused. The schema test in `server/test/entry.test.js` that expects the unique index is revised to this |
| TC-90 | AC-08.19 | API | Template with min -5, max 24; goal on it | `POST` 24, then -5, then 5, then 0.01 for `D` | 201, 201, 201 (total 24), then `409 DAILY_TOTAL_ABOVE_MAX` |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- Sprint 1: the migration is additive. Lab 7: the migration of section 8 keeps every row; TC-84 proves the day total under two requests at once.
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
| OP-08.5 | Decimal scale and precision of `value`; a value with more than 2 decimal places | Decided on PR #29 (Q8): 2 decimal places for all four decimal columns; see OP-07.8. Precision `Decimal(10, 2)` and the refusal of extra places with `400 VALIDATION_ERROR`, never rounding: decided in F-03 (OP-03.3, OP-03.4, PR #31 review) and applied here by Issue #38 |
| OP-08.6 | An entry dated inside the period of a goal that has already ended | Decided on PR #29 (Q1): allowed (ADR 0012, BR-01); AC-08.11, TC-30 |
| OP-08.7 | Which code when a request breaks several rules | Open (proposal from review point 10): `ENTRY_DATE_IN_FUTURE`, then `ENTRY_DATE_OUTSIDE_GOAL`, then `VALUE_OUT_OF_RANGE`, then `DAILY_TOTAL_ABOVE_MAX` (Lab 7; before: `ENTRY_ALREADY_EXISTS`) |
| OP-08.8 | How the Sprint 1 goals page chooses the day | Decided on PR #29 (Q9): a date box next to the value box, defaulting to today in Asia/Bangkok |
| OP-08.9 | Code and status for a day total above the maximum | Decided by projectnewy on 2026-11-27 (Lab 7); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119): `409 DAILY_TOTAL_ABOVE_MAX`, because the request conflicts with stored entries (SDS S-16) |
| OP-08.10 | Order of several entries on one date | Decided by projectnewy on 2026-11-27 (Lab 7); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119): newest saved first |
| OP-08.11 | How the goals page shows a day with several entries | Decided by projectnewy on 2026-11-27 (Lab 7); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119): every entry, plus "Day total: {total} {unit}" for each day |
| OP-08.12 | Templates may allow negative values (F-03 OP-03.5), so a later entry can lower a day total | Decided by projectnewy on 2026-11-27 (Lab 7); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119): only the upper limit is checked on the total; each entry stays inside the template range. A day that was met can then become not met |
| OP-08.13 | Whether a day may exceed the template maximum, and whether the daily target rule changes | Decided by projectnewy on 2026-11-27 (ADR 0061): the day total is not above `max_value`; the target rule (SRS A-4) is unchanged. Agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119) |
| OP-08.14 | Wording of the day-total message | Proposed by phittayanan in [PR #143](https://github.com/phittayanan/habit-tracker/pull/143), accepted by projectnewy on 2026-11-27: the wording of section 4, row 8 |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
| 2026-11-07 | Review round 1 (PR #29): TC-28 gives each accepted value its own day; codes in TC-56; test dates relative to the Bangkok today; AC-08.5 and TC-27 reworded (TZ=UTC, goal period); AC-08.11 and AC-08.12 added; order of rule checks; date box named; decimal scale; decisions Q1, Q8, Q9 recorded | pending (partner re-check) |
| 2026-11-07 | Wording fix in TC-27: a local-zone implementation fails the second check, not the first (partner's note on PR #29) | pending |
| 2026-11-08 | Revision for Issue #38 (before the code is built): a `value` with more than 2 decimal places or outside `Decimal(10, 2)` is `400 VALIDATION_ERROR`, and validation wins over `VALUE_OUT_OF_RANGE` (sections 3, 4, 8, AC-08.8, TC-56, OP-08.5) | pending (partner review of the Issue #38 PR) |
| 2026-11-09 | Issue #42 implementation evidence recorded in section 14 and `docs/entry-implementation-evidence.md`; requirements unchanged | projectnewy (author); teammate review pending |
| 2026-11-27 | Lab 7, Issue #139: several entries per goal and day with a day-total maximum (BR-04 replaced; sections 2 to 4, 6 to 12; AC-08.7 revised, AC-08.13 to AC-08.18; TC-29 and TC-61 revised, TC-82 to TC-86 and TC-89 added; ADR 0061) | projectnewy (author); agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119) |
| 2026-11-27 | Review of PR #143: day-total message wording (section 4, TC-61, TC-82, OP-08.14); AC-08.19 and TC-90 for negative values; agreement recorded | projectnewy (author); re-checked by phittayanan in the [re-check of eda4c6b](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777) |
| 2026-11-27 | Issue #140: TC-61 names the template unit (hours) in its Given, as asked in the [re-check of eda4c6b](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777); the expected result is unchanged | phittayanan (author); review in the Issue #140 PR |

## 14. Implementation evidence — Issue #42

Implemented from this contract and its decimal revision (PR #39). The failing-test commit `d43f160` comes before the implementation commit `7d2979b`; commands, counts, AC mapping and limits are in [Entry implementation evidence](../../entry-implementation-evidence.md). No decided point was reopened.
