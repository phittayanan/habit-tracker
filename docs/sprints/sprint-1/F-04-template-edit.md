# F-04 Template edit

Sprint 1 contract (Part E, Issue #30). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-04 Template edit |
| Sprint | 1 |
| Requirements | FR-07, FR-23; BR-08 (edit part), BR-09 (edit refusal) |
| Related | BR-03 (range after the edit), SDS S-4, S-5, S-16; SRS A-2 (edit stays in Sprint 1); features O-6 (needs F-07 to test); NFR-05, NFR-06 |
| Depends on | F-03 (the template and its form), F-07 (a goal that uses the template) |
| Needed by | no later Sprint 1 feature; owns the Participant edit refusal (TC-18), after F-07 exists |
| Author / reviewer | phittayanan / projectnewy |
| Status | Draft, review round 1 applied; implementation Issue #53 adds the two-request race to TC-13 and lists the edit-page details as OP-04.9 |

## 2. Behaviour and workflow

1. On the template list a Manager presses "Edit" on a row. The template form opens filled with the current name, unit, minimum and maximum.
2. On Save the API checks the request (section 4). If no goal uses the template and the new values pass, the template is changed and the table shows the new values.
3. Once any goal uses the template, the edit is refused and nothing changes. Such a template can only be retired, which comes in Sprint 2 (ADR 0017; SRS BR-08, FR-08).
4. Any Manager may edit any template, including one another Manager made (SDS S-5).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-08 (edit part) | A Manager may edit a template only while no goal uses it | SRS BR-08, FR-07; ADR 0017 |
| "Uses" | A template is used when at least one Goal row refers to it, whoever owns the goal and whether it is Active or Ended (OP-04.1). ADR 0017 gives the reason: "Saved entries never fall outside a changed range" | ADR 0017; OP-04.1 |
| BR-03 | After the edit the minimum is still below the maximum | SRS BR-03; ADR 0007 |
| Unique name | The new name must not belong to another template | SDS 3.2, S-4 |
| Decimal scale | 2 decimal places, JSON numbers | Decided on PR #29 (OP-07.8) |
| Not editable | `state`, `createdBy` and `id` cannot be changed by an edit (stripped, OP-07.7). Retire is Sprint 2 | SDS 3.2; features O-4 |

Because a used template cannot be edited, an edit can never put a goal's daily target above a new maximum (SRS A-4) or an entry outside a new range.

## 4. Validation and failure cases

Checks run in this order (SDS 2.2): Origin (403, F-01), session (401), role (403), validation (400), existence (404), then the rules in this order (OP-04.3). The status codes for rule rejections follow the SDS proposal S-16, which is still open: 409 for BR-08 and a duplicate name, 400 for BR-03.

| Order | Case | Result | Error code | Message (OP-04.5) |
|---|---|---|---|---|
| 1 | No valid session | 401 | `UNAUTHENTICATED` | F-01 |
| 2 | Caller is a Participant | 403 | `FORBIDDEN` | F-02 (tested here in TC-18) |
| 3 | `:id` not a positive integer; body has none of `name`, `unit`, `minValue`, `maxValue` (OP-04.2); a field present with a wrong type, empty, too long or with more than 2 decimal places (as F-03 section 4) | 400 | `VALIDATION_ERROR` | names the field |
| 4 | No template with this id | 404 | `TEMPLATE_NOT_FOUND` | "Template not found." |
| 5 | A goal uses the template | 409 | `TEMPLATE_IN_USE` | "This template is used by a goal and cannot be edited." |
| 6 | After merging the sent fields with the stored ones, the minimum is not below the maximum | 400 | `MIN_NOT_BELOW_MAX` | "Minimum must be below maximum." |
| 7 | The new name belongs to another template | 409 | `TEMPLATE_NAME_EXISTS` | "A template with this name already exists." |

When a request breaks more than one rule, the first one in this table is returned. Example: an edit of a used template that also sets the minimum above the maximum gets `409 TEMPLATE_IN_USE`.

Unknown body fields are stripped and do not cause an error (decided on PR #29, OP-07.7).

Boundaries: sending the template's own current name is accepted (not a duplicate); a template whose only goal is Ended is still used. The check "no goal uses it" and the update run in one transaction that first locks the template row (`SELECT ... FOR UPDATE`); goal creation takes the same lock (F-07 AC-07.10), so the two cannot interleave (OP-04.4).

## 5. Permissions

| Caller | Edit a template |
|---|---|
| Anonymous | 401 |
| Participant | 403 (F-06), also for an unknown id or an invalid body (F-02) |
| Manager | allowed while no goal uses the template; any template, whoever created it |

## 6. UI behaviour

- "Edit" on a template row opens `/templates/:id/edit` (OP-02.3): the F-03 form, filled with the stored values, with Save and Cancel.
- Save sends the changed fields. On 200 the table shows the new values.
- A rejected request shows the API `message` next to the form and keeps the typed values. While it runs Save is disabled.
- The Edit button is shown on every row, used or not; the API answer explains a refusal (OP-04.6).
- The form fits 375 px and 1280 px wide and works with the keyboard alone (NFR-05, NFR-06; TC-47, TC-48 run on this screen).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025). Field names are camelCase (OP-07.3). Decimal values travel as JSON numbers (OP-07.8).

**`PATCH /api/templates/:id`** (Manager)

Request (any non-empty subset of the four fields):
```json
{ "unit": "pages read", "maxValue": 300 }
```
Response 200:
```json
{ "template": { "id": 5, "name": "Reading", "unit": "pages read", "minValue": 0, "maxValue": 300, "state": "ACTIVE" } }
```
Errors: 400, 401, 403, 404, 409 as in section 4.

## 8. Data

| Layer change | Detail |
|---|---|
| Table and migration | none; uses `Template` from F-03 and `Goal` from F-07 |
| In-use check | Inside one transaction the service locks the template row (`SELECT ... FOR UPDATE`), counts Goal rows with this `template_id`, checks the merged range and updates the template (OP-04.4) |
| Constraints | The database check `min_value < max_value` and the unique `name` (F-03) are the last guard |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-04.1 | A Manager who edits an unused template (any subset of name, unit, minimum, maximum) gets 200 with the new values, and `GET /api/templates` then shows them |
| AC-04.2 | An edit of a template used by any goal, Active or Ended, gets `409 TEMPLATE_IN_USE`, and the template is unchanged |
| AC-04.3 | An edit whose merged minimum is not below the maximum gets `400 MIN_NOT_BELOW_MAX`; a new name that belongs to another template gets `409 TEMPLATE_NAME_EXISTS`; sending the template's own name is accepted; a rejected edit changes nothing |
| AC-04.4 | An empty body, a field with a wrong type or more than 2 decimal places, and a non-integer id get `400 VALIDATION_ERROR`; an unknown id gets `404 TEMPLATE_NOT_FOUND`; an anonymous edit gets `401 UNAUTHENTICATED`; nothing changes |
| AC-04.5 | An edit of a used template that also breaks the range rule gets `409 TEMPLATE_IN_USE` |
| AC-04.6 | In the browser, Edit opens the filled form, a valid change shows in the table, and a refused change shows the API message and keeps the typed values |
| AC-04.7 | A Participant's `PATCH /api/templates/:id` gets `403 FORBIDDEN`, for an existing and for an unknown id, and the template is unchanged |

## 10. Test specification

Fixtures: each test starts from its own data with one Manager and Participant A (test-only passwords). Goals are created through `POST /api/goals` as A (F-07), with dates relative to `D`, today in Asia/Bangkok (decided on PR #29, OP-07.9). A goal with an end date in the past is allowed and is Ended at once (OP-07.2).

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-12 | AC-04.1 | API | Unused template "Reading" (pages, 0 to 500) | `PATCH` `{ "unit": "pages read", "maxValue": 300 }`; then `PATCH` `{ "name": "Reading time", "minValue": 1 }`; `GET /api/templates` | Both 200; the list shows "Reading time", "pages read", 1 to 300 |
| TC-13 | AC-04.2, AC-04.5 | API and database | Template "Sleep" with A's Active goal (start `D`, end `D+30`); template "Steps" with A's Ended goal only (start `D-10`, end `D-1`). Race part (OP-04.4, F-07 OP-07.11): an unused template "Water" (0 to 24) | `PATCH` "Sleep" `{ "maxValue": 12 }`; `PATCH` "Sleep" `{ "minValue": 50 }` (also above the max); `PATCH` "Steps" `{ "unit": "km" }`. Race: (a) in the test, open a transaction that locks "Water" (`FOR UPDATE`) and inserts A's goal; start `PATCH` "Water" `{ "maxValue": 10 }`; check it waits on the lock; commit. (b) Send `PATCH` "Water" `{ "maxValue": 10 }` and A's `POST /api/goals` (target 20) at the same time | All three get `409 TEMPLATE_IN_USE`; both templates are unchanged. (a) The edit waits, then gets `409 TEMPLATE_IN_USE`; "Water" keeps max 24. (b) Either order is valid: goal first, then the edit gets `409 TEMPLATE_IN_USE` and max stays 24; or edit first, then the goal gets `400 TARGET_ABOVE_TEMPLATE_MAX` and no goal is stored. Never both a stored goal and an edited range |
| TC-71 | AC-04.4 | API | Unused template T; no template with id 99999 | `PATCH` T with `{}`; `{ "minValue": "abc" }`; `{ "maxValue": 10.555 }`; `PATCH /api/templates/abc` with a valid body; `PATCH /api/templates/99999` with a valid body; `PATCH` T with no session | `{}`, "abc", 10.555 and the id "abc" get `400 VALIDATION_ERROR`; 99999 gets `404 TEMPLATE_NOT_FOUND`; anonymous gets `401 UNAUTHENTICATED`; T is unchanged |
| TC-72 | AC-04.3 | Unit and API | Unused templates "Walk" (0 to 100) and "Swim" (0 to 50) | Unit: the merged range for stored (0, 100) with sent `minValue` 100. API: `PATCH` "Walk" `{ "minValue": 100 }`; `PATCH` "Walk" `{ "name": "Swim" }`; `PATCH` "Walk" `{ "name": "Walk", "unit": "steps" }` | Unit: refused. API: `400 MIN_NOT_BELOW_MAX`; `409 TEMPLATE_NAME_EXISTS`; 200 with unit "steps". "Walk" keeps min 0 and max 100 after the first two |
| TC-73 | AC-04.6 | Browser | Manager; unused template "Reading" (0 to 500); template "Sleep" with A's Active goal (created through the API before the test) | Edit "Reading": maximum 300, Save. Edit "Sleep": maximum 12, Save | "Reading" shows 0–300 in the table. "Sleep": the message "This template is used by a goal and cannot be edited." and the typed 12 stays |
| TC-18 | AC-04.7 | API | A logged in; template "Sleep" (hours, 0 to 24); no template with id 99999 | As A: `PATCH` "Sleep" `{ "maxValue": 12 }`; `PATCH /api/templates/99999` `{ "unit": "x" }` | Both get `403 FORBIDDEN`; "Sleep" still has max 24 |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The in-use check and the update run in one transaction; the merged-range rule is unit tested (TC-72).
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-04.1 | Does an Ended goal still "use" a template (ADR 0017, BR-08 say "while no goal uses it") | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): yes, any goal row counts, so saved entries never fall outside a changed range (the reason in ADR 0017) |
| OP-04.2 | Partial edit or full replace; an empty body | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `PATCH` with any non-empty subset of the four fields; `{}` gets `400 VALIDATION_ERROR` |
| OP-04.3 | Which code wins when an edit breaks several rules | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): the order in section 4: `TEMPLATE_NOT_FOUND`, then `TEMPLATE_IN_USE`, then `MIN_NOT_BELOW_MAX`, then `TEMPLATE_NAME_EXISTS`. A used template is refused first because no edit of it can succeed |
| OP-04.4 | Race between an edit and a new goal on the same template (SDS S-6 puts BR-05 in a transaction but says nothing about this pair) | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): both the edit (here) and goal creation (F-07) lock the template row (`SELECT ... FOR UPDATE`) inside their transactions, so a goal cannot be created between the in-use check and the update. F-07 does not say this yet; note on this PR for F-07's author |
| OP-04.5 | Message wording | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): the texts in section 4 |
| OP-04.6 | Hide or disable Edit on a used template | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): keep it shown and let the API refuse; hiding it would need an "in use" field in `GET /api/templates` |
| OP-04.7 | Code for an unknown template id | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `404 TEMPLATE_NOT_FOUND`. A template is not private (SDS 3.3), so 404 here reveals nothing |
| OP-04.8 | Editing a Retired template that no goal uses | Not reachable in Sprint 1 (retire is Sprint 2); decided in the F-05 contract; scope confirmed in the [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) |
| OP-04.9 | Edit-page details the contract does not name: the page heading, the message for a body with none of the four fields, and a direct visit to `/templates/:id/edit` for an id that does not exist | Open (proposal, Issue #53): heading "Edit template" (like F-03's "New template"); empty body message "Change at least one of name, unit, minimum or maximum."; an unknown id shows "Template not found." (the section 4 message) with Cancel back to the list. Reviewer to confirm or change |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #30) | pending |
| 2026-11-07 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): own Participant edit refusal as AC-04.7 / TC-18; remove circular dependency; record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-10 | Implementation Issue #53, before the code: the edit locks the template row (sections 4 and 8, as OP-04.4 decided); TC-13 adds the edit-versus-goal race that F-07 OP-07.11 deferred to F-04; OP-04.9 lists the edit-page details as a proposal | pending (partner review of the Issue #53 PR) |
