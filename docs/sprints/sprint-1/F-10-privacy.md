# F-10 Participant data privacy

Sprint 1 contract (Part E, Issue #28). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-10 Participant data privacy |
| Sprint | 1 |
| Requirements | FR-13, FR-14; BR-10; NFR-03 |
| Related | NFR-02 (401 and 403 coverage, owned by F-02 and TC-08), ADR 0019, SDS section 5 |
| Depends on | F-01, F-02, F-07, F-08 |
| Needed by | the whole Sprint 1 release (this is the access-restriction evidence the handout asks for) |
| Author / reviewer | projectnewy / phittayanan |
| Status | Draft, review round 1 applied |

## 2. Behaviour and workflow

F-10 adds no screen and no endpoint. It is the rule, built into the Sprint 1 goal and entry endpoints (F-07, F-08, F-09), that a Participant's goals, entries and progress are private:

1. A Participant sees and changes only records whose `participant_id` is their own (BR-10).
2. Another Participant gets 404, so the record's existence is not revealed (SDS S-7).
3. A Manager gets 403 on every goal and entry endpoint, because the role may not use them. A Manager sees templates only (ADR 0019).
4. The acting user always comes from the session, never from the request (GWS §5.2). Unknown body fields, such as a participant ID, are stripped (OP-07.7).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-10 | A Participant's goals and entries are private. A Manager and any other Participant are refused access (no sharing) | SRS BR-10; ADR 0019 |
| NFR-03 | Across two Participant accounts and one Manager account, 0 reads or writes of another account's goals or entries succeed | SRS NFR-03 |
| Order of checks | session (401), role (403), ownership (404), then validation and rules | SDS 2.2 |
| Identity | The owner is the session user; a user or participant ID in a request body or path is never trusted | SDS 2.2, 5.1; GWS §5.2 |

## 4. Validation and failure cases

Applies to each Sprint 1 goal and entry endpoint:

| Endpoint | Anonymous | Manager | Participant B on A's record | Unknown id |
|---|---|---|---|---|
| `POST /api/goals` | `401 UNAUTHENTICATED` | `403 FORBIDDEN` | creates a goal for B only (A's ID in the body is stripped) | n/a |
| `GET /api/goals` | `401 UNAUTHENTICATED` | `403 FORBIDDEN` | returns only B's goals | n/a |
| `POST /api/goals/:id/entries` | `401 UNAUTHENTICATED` | `403 FORBIDDEN` | `404 GOAL_NOT_FOUND`, nothing stored | `404 GOAL_NOT_FOUND`, same body |
| `GET /api/goals/:id/entries` | `401 UNAUTHENTICATED` | `403 FORBIDDEN` | `404 GOAL_NOT_FOUND` | `404 GOAL_NOT_FOUND`, same body |

A request for another Participant's goal and a request for a goal id that does not exist give the same status and the same body, so a caller cannot find out which ids exist.

## 5. Permissions

This feature is the permission rule for goals and entries. The full role matrix is `docs/system-sds.md` 5.1; the rows that apply in Sprint 1 are:

| Operation | Anonymous | Participant | Manager | Records it may touch |
|---|---|---|---|---|
| Create a goal | 401 | allowed | 403 | for self only |
| View goals and progress | 401 | own only | 403 | `participant_id` equal to the session user |
| Record an entry | 401 | own goal only | 403 | goals owned by the session user |
| View entries | 401 | own goal only | 403 | entries of own goals |

## 6. UI behaviour

No new screen. The goals page (F-07, F-08, F-09) loads only the caller's goals, because the API returns only those. The menu follows the role (FR-22), and a Manager who calls the API anyway gets 403. Hiding a control is not authorization (SDS section 5).

## 7. API

No new path. The behaviour in section 4 applies to the existing endpoints. Error bodies use `{ "error": { "code": "...", "message": "..." } }` (ADR 0025) with codes `UNAUTHENTICATED` (401), `FORBIDDEN` (403) and `GOAL_NOT_FOUND` (404).

## 8. Data

| Layer change | Detail |
|---|---|
| Table and migration | none |
| Ownership link | `Goal.participant_id` from F-07; an Entry is owned through its Goal |
| Service | every goal and entry query filters on the session user's id, or loads the goal and compares `participant_id` before any other check |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-10.1 | Participant B's `GET /api/goals` contains none of A's goals, and Participant A's contains none of B's |
| AC-10.2 | Participant B's `POST` or `GET` on A's goal entries gets `404 GOAL_NOT_FOUND`, and no entry is stored or returned |
| AC-10.3 | A Manager's `GET /api/goals`, `POST /api/goals`, and `POST` or `GET` entries each get `403 FORBIDDEN`, and nothing is stored or returned |
| AC-10.4 | An anonymous caller gets `401 UNAUTHENTICATED` on each goal and entry endpoint, and nothing is stored or returned |
| AC-10.5 | A request for another Participant's goal and a request for an unknown goal id give the same status and the same body |
| AC-10.6 | A goal created by B with A's id in the body belongs to B (the field is stripped and the request is accepted), and A's data is unchanged |
| AC-10.7 | The goals page shows only the signed-in Participant's goals and progress |

## 10. Test specification

Dates in tests (decided on PR #29, OP-07.9): `D` is today in Asia/Bangkok, and tests use dates relative to `D`. Fixtures: Participants A and B and one Manager, each with a goal or entry where needed (the names of seeded accounts are SRS A-9; tests use fixtures).

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-33 | AC-10.1, AC-10.2, AC-10.6 | API | A has goal GA with an entry; B has goal GB | As B: `GET /api/goals`; `GET` and `POST` `/api/goals/GA/entries`; `POST /api/goals` with A's id in the body | B's list holds only GB; both entries calls get `404 GOAL_NOT_FOUND` with nothing stored or returned; the new goal is accepted (201) and belongs to B; A's data unchanged |
| TC-34 | AC-10.3, AC-10.4 | API | Same data | As Manager and as anonymous: each goal and entry endpoint (read and write) | Manager gets `403 FORBIDDEN` and anonymous `401 UNAUTHENTICATED` on every call; nothing stored or returned |
| TC-35 | AC-10.7 | API and browser | A and B each with a goal and entries | Open the goals page as A, then as B | Each page lists only that Participant's goals, entries and progress |
| TC-57 | AC-10.5 | API | A's goal GA; no goal with id 99999 | As B: `GET /api/goals/GA/entries` and `GET /api/goals/99999/entries` | Both give `404 GOAL_NOT_FOUND` with identical status and body |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- TC-33, TC-34 and TC-57 cover every Sprint 1 goal and entry endpoint, in a table-driven test, so a new endpoint that skips the checks fails it (NFR-03).
- The ownership check lives in one place in the service, not in each route.
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`. One of the two test excerpts for Part F comes from here (a role or ownership restriction).

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-10.1 | NFR-02 (401 and 403 on every protected endpoint) is owned by F-02 and TC-08. Does F-10 repeat it for goal and entry endpoints | Open (proposal): yes, TC-34 repeats it for these endpoints, so a gap shows in this feature too |
| OP-10.2 | Template endpoints and the Manager's access to `GET /api/templates` are not part of F-10 | Open (proposal): covered by F-03 and F-06 (BR-09, FR-23) |
| OP-10.3 | Unknown body fields: ignore or refuse | Decided on PR #29 (Q3): stripped, the request is accepted; recorded once in F-07 as OP-07.7 |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #28) | pending |
| 2026-11-07 | Review round 1 (PR #29): error codes added to every expected result, "ignored" changed to "stripped" with OP-10.3, menu wording corrected | pending (partner re-check) |
