# F-03 Template creation and Manager list

Sprint 1 contract (Part E, Issue #30). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-03 Template creation and Manager list |
| Sprint | 1 |
| Requirements | FR-05, FR-06; BR-03 (minimum below maximum) |
| Related | BR-08 (the FR-06 row of `docs/traceability.md`; the Edit action is F-04, Retire is F-05 in Sprint 2), SDS S-4, S-5, S-16; features O-4 (Retire hidden in Sprint 1, decided 2026-11-07); NFR-05, NFR-06 |
| Depends on | F-01, F-02 |
| Needed by | F-04, F-06, F-07 (a goal needs a template), F-09 (TC-59 journey) |
| Author / reviewer | phittayanan / projectnewy |
| Status | Draft |

## 2. Behaviour and workflow

1. A logged-in Manager opens "Templates" and sees the template table (ADR 0043; SRS FR-06).
2. "New" opens the template form: name, unit (free text), minimum and maximum per entry (ADR 0007; SRS FR-05).
3. On Save the API checks the request (section 4). If it passes, one Template row is stored with state `ACTIVE`, and the table shows it.
4. Any Manager sees and may edit every template, including one another Manager made (SDS S-5). `created_by` records who made it and gives no extra right.
5. The table shows New and, per row, Edit (F-04). There is no Retire control in Sprint 1 (features O-4; SRS FR-06).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-03 (template part) | A template's minimum is below its maximum. Equal is refused | SRS BR-03; ADR 0007 ("the minimum must be below the maximum") |
| Unit | Free text; spelling is not checked | ADR 0007; SRS 1.3 |
| Unique name | Two templates cannot have the same name; a duplicate is refused with 409 | SDS 3.2, S-4 |
| Decimal scale | `min_value` and `max_value` have 2 decimal places, sent as JSON numbers | Decided on PR #29 (OP-07.8) |
| New state | A new template is `ACTIVE`; the state column exists from the start, retire comes in Sprint 2 | SDS 3.2 |
| Creator | `created_by` is the session user, never read from the request | SDS 2.2, 3.2 |

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): Origin (403, F-01), session (401), role (403), validation (400), then the rules in this order. The status codes for rule rejections follow the SDS proposal S-16, which is still open: 400 for BR-03, 409 for a duplicate name (S-4, decided).

| Order | Case | Result | Error code | Message (OP-03.6) |
|---|---|---|---|---|
| 1 | No valid session | 401 | `UNAUTHENTICATED` | F-01 |
| 2 | Caller is a Participant | 403 | `FORBIDDEN` | F-02 (tested in F-06) |
| 3 | `name` or `unit` missing, not a string, empty after trimming, or longer than the limit (OP-03.2); `minValue` or `maxValue` missing, not a number, more than 2 decimal places, or outside the column range (OP-03.3, OP-03.4) | 400 | `VALIDATION_ERROR` | names the field, for example "Maximum must be a number with at most 2 decimal places." |
| 4 | `minValue` equal to or above `maxValue` | 400 | `MIN_NOT_BELOW_MAX` | "Minimum must be below maximum." |
| 5 | A template with the same name already exists (OP-03.1) | 409 | `TEMPLATE_NAME_EXISTS` | "A template with this name already exists." |

When a request breaks more than one rule, the first one in this table is returned. Example: a new template named like an existing one with minimum 5 and maximum 5 gets `400 MIN_NOT_BELOW_MAX`.

Unknown body fields (for example `state`, `createdBy` or `id`) are stripped and do not cause an error (decided on PR #29, OP-07.7). Names and units are stored trimmed.

Boundaries: a minimum just below the maximum (0 and 0.01) is accepted; negative numbers are accepted (OP-03.5). Two requests with the same new name at the same time give one stored template and one `409 TEMPLATE_NAME_EXISTS` (the database unique constraint decides).

## 5. Permissions

| Caller | Create a template | List templates |
|---|---|---|
| Anonymous | 401 | 401 |
| Participant | 403 (F-06) | active templates only (F-06) |
| Manager | allowed | all templates, active and retired |

## 6. UI behaviour

- **Template list** (Manager's first page; ADR 0043, OP-02.1): a table with the columns Name, Unit, Range (`min–max`), State (`Active` or `Retired`), a "New" button above it, and an "Edit" button on each row. No Retire button in Sprint 1 (features O-4). The state is shown as a word, not by colour (NFR-06).
- **Empty state**: "No templates yet", with "New" visible (SDS 4.2).
- **Template form** (`/templates/new`, OP-02.3): Name, Unit, Minimum, Maximum (number boxes), Save, Cancel. The form may check "minimum below maximum" first for a faster message; the API decides.
- A rejected request shows the API `message` next to the form and keeps the typed values. While the request runs Save is disabled. On 201 the table is shown with the new row.
- The table and the form fit 375 px and 1280 px wide with no horizontal scroll, and work with the keyboard alone (NFR-05, NFR-06; TC-47, TC-48 run on these screens).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025). Field names are camelCase in the API (OP-07.3). Decimal values travel as JSON numbers (OP-07.8).

**`POST /api/templates`** (Manager)

Request:
```json
{ "name": "Reading", "unit": "pages", "minValue": 0, "maxValue": 500 }
```
Response 201:
```json
{ "template": { "id": 5, "name": "Reading", "unit": "pages", "minValue": 0, "maxValue": 500, "state": "ACTIVE" } }
```
Errors: 400, 401, 403, 409 as in section 4.

**`GET /api/templates`** (Manager or Participant): returns `{ "templates": [ ... ] }` in the shape above, ordered by name A to Z (OP-03.7). A Manager gets every template; a Participant gets active templates only (F-06). Errors: 401.

## 8. Data

| Layer change | Detail |
|---|---|
| Table `Template` | `id` integer primary key; `name` text not null unique; `unit` text not null; `min_value` decimal not null; `max_value` decimal not null; `state` enum `ACTIVE` or `RETIRED` not null default `ACTIVE`; `created_by` not null, reference to User; `created_at` timestamp not null (SDS 3.2) |
| Constraints | check `min_value < max_value` (BR-03, SDS 3.4); unique `name` (S-4) |
| Decimal scale | `min_value` and `max_value` use 2 decimal places (OP-07.8), precision 10 (OP-03.4). Prisma returns `Decimal` as a string by default, so the service converts it to a JSON number |
| Migration | One additive Prisma migration that creates `Template` and its enum. It changes no existing table. F-07's migration relies on this one for the template scale (F-07 section 8) |
| Seed | When `SEED_DEMO_DATA` is true, the seed also upserts a few synthetic templates by name, safe to run twice (SDS 3.6, 7.1) |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-03.1 | A Manager who sends a valid request gets 201 and a template with `state` `ACTIVE`; it then appears in the Manager's `GET /api/templates` and is still there after the app restarts. Unknown fields such as `"state": "RETIRED"` are stripped, and the request is accepted |
| AC-03.2 | A minimum equal to or above the maximum gets `400 MIN_NOT_BELOW_MAX` and nothing is stored; a minimum just below the maximum is accepted |
| AC-03.3 | A missing, empty or non-string `name` or `unit`, a name or unit over the length limit, and a missing or non-numeric `minValue` or `maxValue`, or one with more than 2 decimal places, get `400 VALIDATION_ERROR` and nothing is stored |
| AC-03.4 | A name that already exists gets `409 TEMPLATE_NAME_EXISTS` and nothing is stored; when the same request also has a minimum not below the maximum, the answer is `400 MIN_NOT_BELOW_MAX` |
| AC-03.5 | An anonymous `POST /api/templates` or `GET /api/templates` gets `401 UNAUTHENTICATED` and nothing is stored |
| AC-03.6 | The Manager's template page lists every template, active and retired, with name, unit, range and state in words, a "New" button and an "Edit" button per row, and no Retire control; with no templates it shows "No templates yet" and "New" |
| AC-03.7 | The New template form creates the template through the API; a rejected request shows the API message and keeps the typed values |

## 10. Test specification

Fixtures: each test starts from its own data with one Manager and Participant A (test-only passwords). No two accepted requests in one test use the same template name.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-09 | AC-03.1 | API | Manager logged in; no templates | `POST /api/templates` with `{ "name": "Reading", "unit": "pages", "minValue": 0, "maxValue": 500, "state": "RETIRED" }`; restart the app; `GET /api/templates` as the Manager | 201; the template has `state` `ACTIVE` and `minValue` 0, `maxValue` 500 as numbers; it is listed after the restart; `created_by` is the Manager |
| TC-10 | AC-03.2 | Unit and API | Manager logged in; no templates | Unit: the range rule for (5, 5), (6, 5), (0, 0.01). API: `POST` "Water" with min 5 max 5, then min 6 max 5, then min 0 max 0.01 | Unit: refused, refused, accepted. API: the first two get `400 MIN_NOT_BELOW_MAX` with no row stored; the third gets 201 |
| TC-68 | AC-03.3, AC-03.5 | API | Manager logged in | Send each bad body: no `name`; `name` "   "; `name` 7; a 101-character name; no `unit`; `minValue` "abc"; no `maxValue`; `maxValue` 10.555. Then send a valid body and `GET /api/templates` with no session | Every bad body gets `400 VALIDATION_ERROR`; both anonymous calls get `401 UNAUTHENTICATED`; the template count stays 0 |
| TC-69 | AC-03.4 | API | Template "Walk" (min 0, max 100) exists | `POST` "Walk" with min 0 max 50; `POST` "Walk" with min 5 max 5; two `POST` "Swim" at the same time | First: `409 TEMPLATE_NAME_EXISTS`. Second: `400 MIN_NOT_BELOW_MAX`. "Swim": one 201 and one `409 TEMPLATE_NAME_EXISTS`. One "Walk" and one "Swim" row |
| TC-11 | AC-03.6 | Browser | Manager; no templates at first. Then templates "Sleep" (active) and "Steps" (set to `RETIRED` directly in the test database, since retire is Sprint 2) | Open the template page before and after the templates exist | Before: "No templates yet" and "New". After: two rows with name, unit, range and the words "Active" and "Retired"; "New" above, "Edit" on each row; no "Retire" anywhere |
| TC-70 | AC-03.7 | Browser | Manager logged in; no templates | Open "New"; enter "Stretching", "minutes", 10, 5 and Save; change the minimum to 0 and Save | First Save: the message "Minimum must be below maximum." and the typed values stay. Second: the table shows "Stretching" |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The migration is additive; the check `min_value < max_value` and the unique `name` exist in the database, and TC-69 proves the unique constraint under two requests at once.
- The range rule is unit tested (TC-10).
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-03.1 | Is the unique name compared with or without case ("Sleep" and "sleep") | Open (proposal): exact match after trimming, as the database unique constraint compares; case-insensitive would need a functional index |
| OP-03.2 | Length limits for `name` and `unit` | Open (proposal): name 1 to 100 characters, unit 1 to 30, after trimming |
| OP-03.3 | A number with more than 2 decimal places: refuse or round. The scale was decided on PR #29 (OP-07.8); the handling of extra places was not, and F-07 and F-08 do not say it either | Open (proposal): refuse with `400 VALIDATION_ERROR`, never round silently. The same answer should apply to `dailyTarget` and `value` (note for F-07 and F-08 on this PR) |
| OP-03.4 | Precision of the four decimal columns (SDS S-2 sets "a fixed precision") | Open (proposal): `Decimal(10, 2)`, so values up to 99,999,999.99; a value outside it gets `400 VALIDATION_ERROR` |
| OP-03.5 | May a minimum be negative | Open (proposal): yes; ADR 0007 sets no lower bound and units are free text |
| OP-03.6 | Message wording | Open (proposal): the texts in section 4 |
| OP-03.7 | Order of `GET /api/templates` | Open (proposal): name A to Z (no ADR sets it) |
| OP-03.8 | Code for a minimum not below the maximum (BR-03). SDS S-16 proposes 400 for BR-03 but no code name | Open (proposal): `400 MIN_NOT_BELOW_MAX` |
| OP-03.9 | Code for a duplicate name (SDS S-4 fixes 409, not the code) | Open (proposal): `409 TEMPLATE_NAME_EXISTS` |
| OP-07.7 | Unknown body fields | Decided on PR #29 (Q3): stripped, the request is accepted |
| OP-07.8 | Decimal scale | Decided on PR #29 (Q8): 2 decimal places for all four decimal columns; JSON numbers |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #30) | pending |
