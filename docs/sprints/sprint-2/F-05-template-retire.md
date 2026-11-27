# F-05 Template retire

Sprint 2 contract (Deliverable 2 Part B, [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 contracts and ADR 0017, plus the decisions of ADR 0078 and ADR 0079. Points drafted by Claude Code are marked in section 12.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-05 Template retire |
| Sprint | 2 |
| Requirements | FR-08, FR-23 (retire refusal); BR-08 (retire part), BR-09 |
| Related | FR-06, FR-09; SRS A-5; SDS S-5; NFR-02, NFR-05, NFR-06 |
| Depends on | F-03, F-07 |
| Needed by | none |
| Author / reviewer | projectnewy / phittayanan. Code owner: projectnewy (#152) |
| Status | Draft for review |

## 2. Behaviour and workflow

1. On the template list a Manager presses "Retire" on an active row and confirms (ADR 0078).
2. The template's state becomes `RETIRED`. This cannot be undone, and its name stays taken (ADR 0078).
3. A retired template is not offered to Participants and cannot start a new goal. Existing goals continue: entries, progress, the calendar and a target change work as before (ADR 0017).
4. The Manager's row stays, shows "Retired" and has no Edit or Retire button (ADR 0079).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| Which templates | Any active template, used by a goal or not, by any Manager | SRS FR-08; SDS S-5; OP-05.2 |
| New goals | A retired template cannot start a new goal | SRS BR-08; ADR 0017 |
| Existing goals | They continue unchanged and keep showing the template's name and unit | ADR 0017, ADR 0079 |
| No edit | A retired template cannot be edited | ADR 0079 |
| Permanent | No request makes it active again | ADR 0078 |

## 4. Validation and failure cases

`POST /api/templates/:id/retire`, checks in this order: Origin (403), session, role, validation, existence, rule.

| Order | Case | Result | Error code | Message |
|---|---|---|---|---|
| 1 | No valid session | 401 | `UNAUTHENTICATED` | F-01 |
| 2 | Caller is a Participant | 403 | `FORBIDDEN` | F-02 |
| 3 | `:id` not a positive integer | 400 | `VALIDATION_ERROR` | "Template id must be a positive whole number." |
| 4 | No template with this id | 404 | `TEMPLATE_NOT_FOUND` | "Template not found." |
| 5 | Already retired | 409 | `TEMPLATE_RETIRED` | "This template is already retired." |

Changes to other requests:

- **`POST /api/goals` (F-07)** on a retired template: `409 TEMPLATE_RETIRED`, "This template is retired and cannot be used for a new goal." It is checked after all validation rows and before the other rule rows. Nothing is stored.
- **`PATCH /api/templates/:id` (F-04)** on a retired template: `409 TEMPLATE_RETIRED`, "This template is retired and cannot be edited." It comes after `TEMPLATE_NOT_FOUND` and before `TEMPLATE_IN_USE`.

Boundaries: retire and goal creation lock the same template row (`SELECT ... FOR UPDATE`, as F-04 OP-04.4), so either the goal is created first and continues, or it is refused. Two retire requests at once give one 200 and one 409.

## 5. Permissions

| Caller | Retire a template |
|---|---|
| Anonymous | 401 |
| Participant | 403, also for an unknown id; nothing changes (FR-23) |
| Manager | allowed for any active template |

## 6. UI behaviour

- Each active row of the Manager's table has "Edit" and "Retire". A retired row has neither (ADR 0079).
- "Retire" asks: `Retire "Sleep"? New goals cannot use it. This cannot be undone.` with "Cancel" and "Retire". The question is a dialog; focus moves into it, Escape cancels, and focus returns to the row's button.
- While the request runs the confirm button is disabled. On 200 the row shows "Retired". A rejected request shows the API `message`.
- The "+ New goal" list and the Participant's templates page do not show the template. A form opened earlier that submits it shows the API message and keeps the typed values.
- 375 px and 1280 px with no horizontal scroll; keyboard only (NFR-05, NFR-06).

## 7. API

Errors use `{ "error": { "code": "...", "message": "..." } }` (ADR 0025).

**`POST /api/templates/:id/retire`** (Manager), no body. Response 200: `{ "template": { ... "state": "RETIRED" } }` in the F-03 shape.

## 8. Data

No new table or column: `Template.state` already exists (F-03). No migration.

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-05.1 | A Manager retires an active template, used or unused, and gets 200 with `state` `RETIRED`; it stays retired after a restart |
| AC-05.2 | A Participant's `GET /api/templates` and the "+ New goal" list do not contain it |
| AC-05.3 | A new goal on it gets `409 TEMPLATE_RETIRED` and nothing is stored |
| AC-05.4 | An existing goal on it still takes entries and shows its name, unit and progress |
| AC-05.5 | A second retire and an edit get `409 TEMPLATE_RETIRED`; an unknown id gets 404; a bad id gets 400; nothing changes |
| AC-05.6 | Anonymous gets 401 and a Participant 403, and the template stays active |
| AC-05.7 | The browser asks before retiring; "Cancel" changes nothing; after "Retire" the row shows "Retired" with no Edit or Retire button |
| AC-05.8 | When a retire and a goal creation on one template arrive together, either the goal is created and the template is then retired, or the goal gets `409 TEMPLATE_RETIRED`. When two retire requests arrive together, one gets 200 and the other `409 TEMPLATE_RETIRED` |

## 10. Test specification

Fixtures: one Manager and Participant A (test-only passwords); templates "Sleep" (hours, 0 to 24, with A's active goal) and "Steps" (unused). `D` is today in Asia/Bangkok.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-14 | AC-05.1, AC-05.2 | API | Fixtures | Retire "Sleep" and "Steps"; restart; list as A | Both 200 `RETIRED`; A's list has neither |
| TC-15 | AC-05.3, AC-05.4 | API | "Sleep" and "Steps" retired | A creates a goal on "Steps"; A records an entry on the "Sleep" goal; A reads goals | `409 TEMPLATE_RETIRED`, no goal stored; entry 201; the goal shows "Sleep", "hours" and its progress |
| TC-19 | AC-05.6 | API | Fixtures; no template 99999 | Retire "Sleep" and 99999 as A; retire "Sleep" with no session | 403, 403, 401; "Sleep" stays `ACTIVE` |
| TC-140 | AC-05.5 | API | "Steps" retired | Retire it again; `PATCH` it; retire `99999` and `abc` | 409, 409 (`TEMPLATE_RETIRED`), 404, 400; "Steps" unchanged |
| TC-141 | AC-05.7 | Browser | Manager on the template list | Press Retire on "Sleep", Cancel; press it again, Retire; then log in as A and open "+ New goal" | After Cancel still "Active"; then "Retired" with no Edit or Retire on that row; "Sleep" is not in A's list; A's goal still shows "Sleep" |
| TC-142 | AC-05.8 | API and database | Besides the fixtures, three unused active templates: "Water", "Juice" and "Tea" | (a) Hold a lock on "Water" in a test transaction; start the retire of "Water" and see it wait; commit. (b) Send the retire of "Juice" and A's goal creation on "Juice" at the same time. (c) Send two retire requests for "Tea" at the same time | (a) The retire waits for the lock, then returns 200. (b) Either the goal is 201 and the retire 200, or the retire is 200 and the goal `409 TEMPLATE_RETIRED`. (c) One 200 and one `409 TEMPLATE_RETIRED`; "Tea" is `RETIRED` |
| TC-143 | AC-05.7 | Browser | Manager, 375 px and 1280 px | Retire by keyboard only, once cancelling with Escape | No horizontal scroll; focus moves into the dialog and back |
| TC-08 | AC-05.6 | API | Route audit | Run it | `POST /api/templates/:id/retire` is listed as protected |

## 11. Definition of done

- Every AC has a test, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The Sprint 1 test that expects no "Retire" control (TC-11) is changed only in that expectation (F-03 revision).
- Contract, `docs/traceability.md` rows and the SDS are current; the PR is reviewed and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-05.1 | Undo and confirmation; screens after retire (SRS A-5, F-04 OP-04.8, F-06 OP-06.2) | Decided by projectnewy (ADR 0078, ADR 0079); phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-05.2 | An unused template can also be retired | Drafted by Claude Code from FR-08 ("A Manager retires a template"); accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-05.3 | Error code `TEMPLATE_RETIRED`, check order, message and dialog texts | Drafted by Claude Code; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 507ba1c (PR #171) |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #150) | pending (reviewer phittayanan) |
| 2026-11-27 | [Review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171: two retires at once added to AC-05.8 and TC-142; AC-05.8 reworded. phittayanan agreed to ADR 0078, ADR 0079 and the drafted points | pending (reviewer phittayanan) |
| 2026-11-27 | [Review of 3048963](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6088156899) of PR #171: TC-142 names its own unused templates and gives the status of step (a); review links corrected | pending (reviewer phittayanan) |
