# F-06 Participant template view and write refusal

Sprint 1 contract (Part E, Issue #30). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-06 Participant template view and write refusal |
| Sprint | 1 |
| Requirements | FR-09, FR-23; BR-09 |
| Related | NFR-02 (F-02, TC-08), SDS 5.1; SRS A-5 (retired templates on existing goals, Sprint 2); features O-5 (the retire refusal TC-19 runs in Sprint 2); NFR-05, NFR-06 |
| Depends on | F-01, F-02, F-03 (templates exist) |
| Needed by | F-07 (the new-goal dropdown lists active templates) |
| Author / reviewer | phittayanan / projectnewy |
| Status | Draft, review round 1 applied |

## 2. Behaviour and workflow

1. A logged-in Participant opens "Templates" and sees every active template, read-only: name, unit and range (ADR 0018; SRS FR-09).
2. The page has no New, Edit or Retire control. A Participant cannot create, copy or change a template (ADR 0018).
3. If a Participant sends a create or edit request to the API anyway, it is refused with 403 and nothing changes (SRS FR-23, BR-09). The retire request is refused the same way once retire exists in Sprint 2 (features O-5).
4. The new-goal form (F-07) uses the same list for its template dropdown.

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| FR-09 | A Participant sees all active templates, read-only | SRS FR-09; ADR 0018 |
| BR-09 | A Participant cannot create, edit or retire a template | SRS BR-09; ADR 0018 |
| FR-23 | A Participant's create, edit or retire request is refused with 403 and changes nothing | SRS FR-23 |
| Active only | A template with state `RETIRED` is not shown to a Participant | SRS FR-09; SDS 5.1 ("active only, read-only") |
| Order | The role check (403) runs before validation (400) and existence (404), so a Participant always gets 403 on a template write | SDS 2.2; F-02 |

## 4. Validation and failure cases

| Case | Result | Error code |
|---|---|---|
| No valid session on any template endpoint | 401 | `UNAUTHENTICATED` |
| Participant `POST /api/templates`, with any body (valid, invalid or empty) | 403 | `FORBIDDEN` |
| Participant `PATCH /api/templates/:id` (built and tested in F-04, AC-04.7 / TC-18) | 403 | `FORBIDDEN` |
| Participant `GET /api/templates` | 200, active templates only | none |

The 403 body is the one in F-02 section 7. A refused request stores and changes nothing.

`POST /api/templates/:id/retire` does not exist in Sprint 1, so its refusal (TC-19) is tested in Sprint 2 with FR-08 (features O-5).

## 5. Permissions

| Caller | View templates | Create | Edit | Retire (Sprint 2) |
|---|---|---|---|---|
| Anonymous | 401 | 401 | 401 | 401 |
| Participant | active only, read-only | 403 | 403 | 403 |
| Manager | all (F-03) | allowed (F-03) | allowed while unused (F-04) | allowed (F-05) |

## 6. UI behaviour

- **Templates page for a Participant** (`/templates`, OP-02.3): a read-only list with Name, Unit and Range (`min–max`) for each active template, ordered as `GET /api/templates` returns them (OP-03.7). No New, Edit or Retire button, and no state column (every row is active).
- **Empty state**: "No templates yet". No New button, because a Participant cannot create (SDS 4.2: "the New button stays visible for the role that can create").
- The list fits 375 px and 1280 px wide and works with the keyboard alone (NFR-05, NFR-06; TC-47, TC-48 run on this screen).

## 7. API

Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025).

**`GET /api/templates`** as a Participant: response 200, active templates only, in the F-03 shape (OP-06.1):
```json
{ "templates": [ { "id": 3, "name": "Sleep", "unit": "hours", "minValue": 0, "maxValue": 24, "state": "ACTIVE" } ] }
```

**`POST /api/templates`** and **`PATCH /api/templates/:id`** as a Participant: response 403:
```json
{ "error": { "code": "FORBIDDEN", "message": "You do not have permission to do this." } }
```

## 8. Data

| Layer change | Detail |
|---|---|
| Table and migration | none; uses `Template` from F-03 |
| Query | For a Participant the service filters `state = ACTIVE`; for a Manager it does not |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-06.1 | A Participant's `GET /api/templates` returns every active template with name, unit, `minValue` and `maxValue`, and no retired template |
| AC-06.2 | The Participant's templates page lists the active templates read-only, with no New, Edit or Retire control; with no active templates it shows "No templates yet" and no New button |
| AC-06.3 | A Participant's `POST /api/templates` gets `403 FORBIDDEN`, with a valid, an invalid or an empty body, and no template is stored |

## 10. Test specification

Fixtures: each test starts from its own data with one Manager and Participant A (test-only passwords). A retired template is set up by writing `state = RETIRED` directly in the test database, because retire is built in Sprint 2.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-16 | AC-06.1, AC-06.2 | API and browser | Active templates "Sleep" (hours, 0 to 24) and "Reading" (pages, 0 to 500); template "Steps" set to `RETIRED` | As A: `GET /api/templates`; open the templates page. Then, with no templates at all, open the page again | The API returns "Reading" and "Sleep" with their units and ranges, and not "Steps". The page shows the same two rows and no New, Edit or Retire control. With no templates: "No templates yet" and no New button |
| TC-17 | AC-06.3 | API | A logged in; template count known | As A: `POST /api/templates` with a valid body (`"Yoga"`, minutes, 0 to 120); with `{ "name": "" }`; with `{}` | Each gets `403 FORBIDDEN`; the template count is unchanged; no "Yoga" row |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The create route uses the F-02 role middleware; the edit refusal is built and tested in F-04 (AC-04.7, TC-18); the Participant filter on `GET /api/templates` is in the service.
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points (including the Sprint 2 retire refusal) are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`. One of the two test excerpts for Part F may come from here (a forbidden operation: a Participant creating a template).

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-06.1 | Does the Participant's list carry `state` | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): yes, the same shape as the Manager's (always `ACTIVE`), so one response type serves both |
| OP-06.2 | Does a Participant see a retired template's name on their existing goals (SRS A-5) | Not reachable in Sprint 1 (retire is Sprint 2); decided in the F-05 contract. F-07's goal response embeds the template, so it is not affected by this list; scope confirmed in the [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) |
| OP-06.3 | FR-23's retire refusal cannot be tested before retire exists (features O-5) | Settled by features O-5: TC-19 runs in Sprint 2; scope confirmed in the [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) |
| OP-03.7 | Order of the list | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1) (in F-03): name A to Z |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #30) | pending |
| 2026-11-07 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): move AC-06.4 / TC-18 to F-04 as AC-04.7 / TC-18; record partner agreement on existing proposals | pending (partner re-check) |
| 2026-11-08 | Issue #36 implementation evidence recorded in `docs/template-implementation-evidence.md`. No decided point was reopened. Edit refusal stays in F-04. | pending review |
