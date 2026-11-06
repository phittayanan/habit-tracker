# F-07 Goal creation

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12 as an open point; nothing was guessed.

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
| Status | Draft |

## 2. Behaviour and workflow

1. A logged-in Participant opens the goals page and presses "+ New goal" (ADR 0049).
2. The form asks for a template (dropdown of active templates), a daily target, a start date and an end date.
3. On Save the API checks the request (section 4). If it passes, one Goal row is stored for the session user and the page shows the new goal.
4. A goal is a daily target on one template, with a start date and an end date (ADR 0010). It has no stored state: Active or Ended is computed from the dates (section 3).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-05 | A Participant has at most one active goal per template. "Active" means not Ended | SRS BR-05; ADR 0010 |
| BR-06 | A goal is Active until its end date passes, then Ended. The state is computed from dates | SRS BR-06; ADR 0012 |
| Target | `daily_target` is above 0 and not above the template's `max_value` | SRS A-4 (decided on PR #23); SDS 3.2 |
| Dates | `end_date` is on or after `start_date`. A day is a date in Asia/Bangkok | SDS 3.2; ADR 0006 |
| Owner | The goal belongs to the session user. The owner is never read from the request | SDS 2.2, 3.3; GWS §5.2 |

State by date (today is the Asia/Bangkok date): Active when `today <= end_date` (this includes a goal that starts in the future and the end date itself); Ended when `today > end_date`.

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): session (401), role (403), validation (400), rules (409).

| Case | Result | Error code |
|---|---|---|
| No valid session | 401 | `UNAUTHENTICATED` |
| Caller is a Manager | 403 | `FORBIDDEN` |
| `templateId` missing, not an integer, or no such template | 400 | `VALIDATION_ERROR` (see OP-07.1) |
| `dailyTarget` missing, not a number, 0 or negative | 400 | `VALIDATION_ERROR` |
| `dailyTarget` above the template's `max_value` | 400 | `TARGET_ABOVE_TEMPLATE_MAX` |
| `startDate` or `endDate` missing or not `YYYY-MM-DD` | 400 | `VALIDATION_ERROR` |
| `endDate` before `startDate` | 400 | `VALIDATION_ERROR` |
| The caller already has a goal on this template that is not Ended | 409 | `ACTIVE_GOAL_EXISTS` |

Boundaries: a target equal to `max_value` is accepted; `startDate` equal to `endDate` is accepted (a one-day goal); an end date in the past is allowed by the rules above (the goal is Ended at once, see OP-07.2).

## 5. Permissions

| Caller | Create a goal | List goals |
|---|---|---|
| Anonymous | 401 | 401 |
| Participant | allowed, for self only | own goals only |
| Manager | 403 | 403 |

The request may carry no owner. A user or participant ID in the body is ignored, so a Participant cannot create a goal for someone else (checked by TC-55 and in F-10).

## 6. UI behaviour

- **Goals page** (plain page in Sprint 1; SRS A-3): lists the caller's goals and has a "+ New goal" button. Empty state: "No goals yet" with the button visible.
- **New goal form** (ADR 0049): template dropdown (active templates only), daily target (number), start date, end date, Save. The unit of the chosen template is shown next to the target.
- The form may repeat the rules for a faster message, but the API decides.
- A rejected request shows the API's `message` next to the form and keeps what the user typed. While the request runs the Save button is disabled.
- At 375 px and 1280 px wide there is no horizontal scroll, and the form works with the keyboard alone (NFR-05, NFR-06; TC-47, TC-48 run on this screen).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025). Field names are camelCase in the API (OP-07.3).

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

**`GET /api/goals`** (Participant): returns `{ "goals": [ ... ] }`, the caller's own goals in the shape above, newest first (OP-07.4). F-09 adds a `progress` object to each goal.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `Goal` | `id` integer primary key; `participant_id` not null, reference to User; `template_id` not null, reference to Template; `daily_target` decimal not null; `start_date` date not null; `end_date` date not null; `created_at` timestamp not null (SDS 3.2) |
| Constraints | check `daily_target > 0`; check `end_date >= start_date`. The rule "not above `max_value`" compares two tables, so the service enforces it |
| BR-05 | The service checks and inserts inside one transaction (SDS S-6) |
| Migration | One additive Prisma migration that creates `Goal` (SDS 3.6). It changes no existing table |
| State | Not stored; computed from the dates |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-07.1 | A Participant who sends a valid request gets 201 and a goal whose `state` is `ACTIVE`; the goal then appears in `GET /api/goals` and is still there after the app restarts |
| AC-07.2 | The stored goal's owner is the session user, whatever user or participant ID the body carries |
| AC-07.3 | A second request for the same template while the first goal is not Ended gets 409 `ACTIVE_GOAL_EXISTS`, and no second row is stored |
| AC-07.4 | A new goal is accepted when the earlier goal on the same template is Ended, when the template differs, and when the other goal belongs to another Participant |
| AC-07.5 | The state is `ACTIVE` on the start day, on the end day, and before the start day; it is `ENDED` the day after the end day |
| AC-07.6 | A missing or invalid field, `endDate` before `startDate`, or a target of 0 or less gets 400 `VALIDATION_ERROR` and nothing is stored |
| AC-07.7 | A target above the template's `max_value` gets 400 `TARGET_ABOVE_TEMPLATE_MAX`; a target equal to it is accepted |
| AC-07.8 | A Manager gets 403 and an anonymous caller gets 401; nothing is stored |
| AC-07.9 | The "+ New goal" form creates the goal through the API, shows the rejection message for a rule failure and keeps the typed values |

## 10. Test specification

Levels: unit, API (with the database), browser. "Fixed clock" means the test sets today's date (SDS 2.3).

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-20 | AC-07.1, AC-07.2 | API | Participant A logged in; template T (min 0, max 24); body has a different `participantId` | `POST /api/goals` with valid data; restart the app; `GET /api/goals` | 201; goal returned with `state` ACTIVE; listed after restart; stored owner is A |
| TC-21 | AC-07.3 | API | A has an active goal on T | `POST /api/goals` for T again | 409 `ACTIVE_GOAL_EXISTS`; goal count for A on T is still 1 |
| TC-22 | AC-07.5 | Unit | Fixed clock; goals with start 2026-11-10, end 2026-11-12 | Compute state on 11-09, 11-10, 11-12, 11-13 | ACTIVE, ACTIVE, ACTIVE, ENDED |
| TC-53 | AC-07.6, AC-07.8 | API | A logged in | Send each bad body: missing field, bad date format, end before start, target 0, target -1; send as Manager; send with no session | 400 for the bad bodies, 403 for Manager, 401 for anonymous; no row stored in any case |
| TC-54 | AC-07.7 | API and unit | Template max 24 | Send target 24, then 24.5 | 24 accepted (201); 24.5 gets 400 `TARGET_ABOVE_TEMPLATE_MAX` |
| TC-55 | AC-07.2, AC-07.4 | API | Goal G1 for A on T1 with end date in the past; B has a goal on T1 | A creates a goal on T1; A creates a goal on T2; body carries B's ID | Both of A's requests accepted (201); stored owner is A, never B |
| TC-60 | AC-07.9 | Browser | A logged in; T exists | Open the form, submit a valid goal, then submit a second goal on T | First goal appears; second shows the API message and keeps the typed values |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The migration is additive and applies on a clean database; the seed still runs twice without error.
- The rules (BR-05, BR-06, target and date checks) are unit tested; coverage of the rule code meets NFR-08.
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points

| ID | Open point | Proposal |
|---|---|---|
| OP-07.1 | Which code for an unknown `templateId`: 400 or 404. The SDS (S-16) leaves rule-rejection codes open | 400 `VALIDATION_ERROR`, because the request body is what is invalid |
| OP-07.2 | May a goal be created with an end date already in the past (it is Ended at once) | Allowed, since no document forbids it; confirm |
| OP-07.3 | API field names in camelCase against the snake_case columns | camelCase in JSON, mapped by Prisma |
| OP-07.4 | Order of `GET /api/goals` | Newest first, matching the list order in ADR 0014 |
| OP-07.5 | "Active" for BR-05 includes a goal whose start date is in the future | Yes (not Ended); confirm, because ADR 0012 gives only "Active, then Ended" |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
