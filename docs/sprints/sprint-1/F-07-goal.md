# F-07 Goal creation

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-07 Goal creation |
| Sprint | 1 |
| Requirements | FR-10; BR-05, BR-06 |
| Related | NFR-02, NFR-03 (checked across features), SRS A-4 (decided on PR #23) |
| Depends on | F-03 (templates exist), F-06 (a Participant can see templates), F-01, F-02 (login and role checks) |
| Needed by | F-08, F-09, F-10 |
| Author / reviewer | projectnewy / phittayanan |
| Status | Draft, review round 1 applied |

## 2. Behaviour and workflow

1. A logged-in Participant opens the goals page and presses "+ New goal" (ADR 0049).
2. The form asks for a template (dropdown of active templates), a daily target, a start date and an end date.
3. On Save the API checks the request (section 4). If it passes, one Goal row is stored for the session user and the page shows the new goal.
4. A goal is a daily target on one template, with a start date and an end date (ADR 0010). It has no stored state: Active or Ended is computed from the dates (section 3).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-05 | A Participant has at most one active goal per template. "Active" means not Ended, so a goal that starts in the future counts as active | SRS BR-05; ADR 0010; OP-07.5 |
| BR-06 | A goal is Active until its end date passes, then Ended. The state is computed from dates | SRS BR-06; ADR 0012 |
| Target | `daily_target` is above 0 and not above the template's `max_value` | SRS A-4 (decided on PR #23); SDS 3.2 |
| Dates | `end_date` is on or after `start_date`. A day is a date in Asia/Bangkok | SDS 3.2; ADR 0006 |
| Owner | The goal belongs to the session user. The owner is never read from the request | SDS 2.2, 3.3; GWS §5.2 |

State by date (today is the Asia/Bangkok date): Active when `today <= end_date` (this includes a goal that starts in the future and the end date itself); Ended when `today > end_date`.

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): session (401), role (403), validation (400), rules (409). The status codes for rule rejections follow the SDS proposal S-16, which is still open: `409 ACTIVE_GOAL_EXISTS` follows that proposal, and `400 TARGET_ABOVE_TEMPLATE_MAX` is the code for the decided A-4 rule, which S-16 does not cover (OP-07.6).

| Case | Result | Error code |
|---|---|---|
| No valid session | 401 | `UNAUTHENTICATED` |
| Caller is a Manager | 403 | `FORBIDDEN` |
| `templateId` missing, not an integer, or no such template | 400 | `VALIDATION_ERROR` (decided, OP-07.1) |
| `dailyTarget` missing, not a number, 0 or negative | 400 | `VALIDATION_ERROR` |
| `dailyTarget` above the template's `max_value` | 400 | `TARGET_ABOVE_TEMPLATE_MAX` |
| `startDate` or `endDate` missing or not `YYYY-MM-DD` | 400 | `VALIDATION_ERROR` |
| `endDate` before `startDate` | 400 | `VALIDATION_ERROR` |
| The caller already has a goal on this template that is not Ended | 409 | `ACTIVE_GOAL_EXISTS` |

Unknown body fields (for example `participantId` or `userId`) are stripped by the validation schema and do not cause an error (decided, OP-07.7).

Boundaries: a target equal to `max_value` is accepted; `startDate` equal to `endDate` is accepted (a one-day goal); an end date in the past is accepted (the goal is Ended at once; decided, OP-07.2).

## 5. Permissions

| Caller | Create a goal | List goals |
|---|---|---|
| Anonymous | 401 | 401 |
| Participant | allowed, for self only | own goals only |
| Manager | 403 | 403 |

The request carries no owner. A user or participant ID in the body is stripped, so a Participant cannot create a goal for someone else (checked by TC-20, TC-55 and, across features, TC-33).

## 6. UI behaviour

- **Goals page** (plain page in Sprint 1; SRS A-3): lists the caller's goals and has a "+ New goal" button. Empty state: "No goals yet" with the button visible.
- **New goal form** (ADR 0049): template dropdown (active templates only), daily target (number), start date, end date, Save. The unit of the chosen template is shown next to the target. The default start date is today in Asia/Bangkok, not the browser's local date (BR-02).
- The form may repeat the rules for a faster message, but the API decides.
- A rejected request shows the API's `message` next to the form and keeps what the user typed. While the request runs the Save button is disabled.
- At 375 px and 1280 px wide there is no horizontal scroll, and the form works with the keyboard alone (NFR-05, NFR-06; TC-47, TC-48 run on this screen).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025). Field names are camelCase in the API (OP-07.3). Decimal values travel as JSON numbers (OP-07.8).

**`POST /api/goals`** (Participant)

Request:
```json
{ "templateId": 3, "dailyTarget": 30, "startDate": "2026-11-10", "endDate": "2026-12-10" }
```
Response 201:
```json
{ "goal": { "id": 12, "templateId": 3, "dailyTarget": 30, "startDate": "2026-11-10",
            "endDate": "2026-12-10", "state": "ACTIVE",
            "template": { "id": 3, "name": "Sleep", "unit": "hours", "minValue": 0, "maxValue": 24 } } }
```
Errors: 400, 401, 403, 409 as in section 4.

**`GET /api/goals`** (Participant): returns `{ "goals": [ ... ] }`, the caller's own goals in the shape above, newest `created_at` first (OP-07.4). F-09 adds a `progress` object to each goal.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `Goal` | `id` integer primary key; `participant_id` not null, reference to User; `template_id` not null, reference to Template; `daily_target` decimal not null; `start_date` date not null; `end_date` date not null; `created_at` timestamp not null (SDS 3.2) |
| Constraints | check `daily_target > 0`; check `end_date >= start_date`. The rule "not above `max_value`" compares two tables, so the service enforces it |
| BR-05 | The service checks and inserts inside one transaction (SDS S-6) |
| Decimal scale | All four decimal columns (`min_value`, `max_value`, `daily_target`, `value`) use 2 decimal places (decided, OP-07.8). Prisma returns `Decimal` as a string by default, so the service converts it to a JSON number |
| Migration | One additive Prisma migration that creates `Goal`. It changes no existing table (the scale for the Template columns is part of F-03's migration) |
| State | Not stored; computed from the dates |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-07.1 | A Participant who sends a valid request gets 201 and a goal whose `state` is `ACTIVE`; the goal then appears in `GET /api/goals` and is still there after the app restarts |
| AC-07.2 | The stored goal's owner is the session user. Unknown fields such as a user or participant ID in the body are stripped, and the request is accepted |
| AC-07.3 | A second request for the same template while the first goal is not Ended gets 409 `ACTIVE_GOAL_EXISTS`, and no second row is stored |
| AC-07.4 | A new goal is accepted when the earlier goal on the same template is Ended, when the template differs, and when another Participant has an active goal on the same template |
| AC-07.5 | The state is `ACTIVE` on the start day, on the end day, and before the start day; it is `ENDED` the day after the end day |
| AC-07.6 | A missing or invalid `templateId` (missing, not an integer, unknown), a missing or non-numeric `dailyTarget`, a target of 0 or less, a missing or badly formatted date, or `endDate` before `startDate` gets 400 `VALIDATION_ERROR` and nothing is stored |
| AC-07.7 | A target above the template's `max_value` gets 400 `TARGET_ABOVE_TEMPLATE_MAX`; a target equal to it is accepted |
| AC-07.8 | A Manager gets 403 `FORBIDDEN` and an anonymous caller gets 401 `UNAUTHENTICATED`; nothing is stored |
| AC-07.9 | The "+ New goal" form creates the goal through the API, shows the rejection message for a rule failure and keeps the typed values |

## 10. Test specification

Dates in tests (decided on PR #29, OP-07.9): `D` is today in Asia/Bangkok. Tests that go through the running server use dates relative to `D` (for example `D+1`), so the server needs no clock hook. Unit tests of the rule code pass `today` as an argument.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-20 | AC-07.1, AC-07.2 | API | Participant A logged in; template T (min 0, max 24); the body also carries `"participantId": 99` | `POST /api/goals` with valid data (start `D`, end `D+30`); restart the app; `GET /api/goals` | 201; goal returned with `state` ACTIVE; listed after the restart; stored owner is A, not 99 |
| TC-21 | AC-07.3 | API | A has an active goal on T | `POST /api/goals` for T again | 409 `ACTIVE_GOAL_EXISTS`; A's goal count on T is still 1 |
| TC-22 | AC-07.5 | Unit | `today` passed as an argument; goal start 2026-11-10, end 2026-11-12 | Compute the state for today = 11-09, 11-10, 11-12, 11-13 | ACTIVE, ACTIVE, ACTIVE, ENDED |
| TC-53 | AC-07.6, AC-07.8 | API | A logged in; template T | Send each bad body: no `templateId`, `templateId` "abc", `templateId` 99999, no `dailyTarget`, `dailyTarget` "abc", `dailyTarget` 0, `dailyTarget` -1, bad date format, missing dates, end before start. Then send a valid body as Manager and with no session | Every bad body gets `400 VALIDATION_ERROR`; Manager gets `403 FORBIDDEN`; anonymous gets `401 UNAUTHENTICATED`; no row is stored in any case |
| TC-54 | AC-07.7 | API and unit | Template max 24 | Send target 24, then 24.5 | 24 accepted (201); 24.5 gets `400 TARGET_ABOVE_TEMPLATE_MAX` |
| TC-55 | AC-07.2, AC-07.4 | API | A has an Ended goal G1 on T1 (end `D-1`); B has an **active** goal on T1 | A creates a goal on T1; A creates a goal on T2; the body of one request carries B's ID | Both of A's requests accepted (201); stored owner is A, never B |
| TC-60 | AC-07.9 | Browser | A logged in; T exists | Open the form, submit a valid goal, then submit a second goal on T | The first goal appears; the second shows the API message and keeps the typed values |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The migration is additive and applies on a clean database; the seed still runs twice without error.
- The rules (BR-05, BR-06, target and date checks) are unit tested; coverage of the rule code meets NFR-08.
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-07.1 | Code for an unknown `templateId` | Decided on PR #29 (review question Q7): 400 `VALIDATION_ERROR` |
| OP-07.2 | A goal with an end date already in the past | Decided on PR #29 (Q6): allowed; the goal is Ended at once |
| OP-07.3 | API field names in camelCase against the snake_case columns | Open (proposal): camelCase in JSON, mapped by Prisma |
| OP-07.4 | Order of `GET /api/goals` | Open (proposal): newest `created_at` first (ADR 0014 covers the entry list, not this list) |
| OP-07.5 | Does a goal that starts in the future count as active for BR-05 | Decided on PR #29 (Q4): yes, not Ended counts as active |
| OP-07.6 | Code for a target above the template maximum (A-4); SDS S-16 does not cover it | Open (proposal): 400 `TARGET_ABOVE_TEMPLATE_MAX` |
| OP-07.7 | Unknown body fields (for example `participantId`): ignore or refuse. SDS 4.3 leaves it to the first contract | Decided on PR #29 (Q3): stripped, the request is accepted. Applies to every Sprint 1 contract |
| OP-07.8 | Decimal scale for `min_value`, `max_value`, `daily_target` and `value` (SDS S-2) | Decided on PR #29 (Q8): 2 decimal places for all four; JSON numbers |
| OP-07.9 | How tests fix "today" | Decided on PR #29 (Q2): dates relative to the real Bangkok today for tests through the server; unit tests pass `today` as an argument |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
| 2026-11-07 | Review round 1 (PR #29): codes in TC-53, active B goal in TC-55, test dates relative to the Bangkok today, S-16 note and OP-07.6, unknown fields stripped (OP-07.7), decimal scale (OP-07.8), order of the goals list, decisions Q4, Q6, Q7 recorded | pending (partner re-check) |
