# F-02 Role layout and endpoint protection

Sprint 1 contract (Part E, Issue #30). Written before any code. Built only from the merged `docs/srs.md`, `docs/system-sds.md`, `docs/features.md`, `docs/traceability.md` and the ADRs. Where those documents do not settle a point it is listed in section 12; each open point has a proposal and each decided point says where it was decided.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-02 Role layout and endpoint protection |
| Sprint | 1 |
| Requirements | FR-22; NFR-02 |
| Related | BR-09, BR-10 (their role checks run here), SDS 2.2, 4.1, 5.1; NFR-06 (keyboard, TC-48) |
| Depends on | F-01 (the session user and role) |
| Needed by | F-03, F-04, F-06, F-07, F-08, F-09, F-10 (every protected endpoint uses these checks) |
| Author / reviewer | phittayanan / projectnewy |
| Status | Merged contract; implementation review corrections specified |

## 2. Behaviour and workflow

1. Everyone sees one layout: a top bar with the user's display name, the role's menu items and "Log out" (ADR 0026; SDS 4.1).
2. The menu only hides what a role cannot use. The API checks every request whatever the menu shows (SRS FR-22; SDS 2.2).
3. Every protected request passes the same two checks before anything else: a valid session (else 401, F-01), then a role allowed on the route (else 403). Ownership, validation and rules come after (SDS 2.2).
4. The role is read from the session user's `User` row on each request. It never comes from the request body, URL, query, header or the cookie's content (SDS 2.2, 6.3).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| One layout | The same layout for both roles; menu items follow the role | SRS FR-22; ADR 0026 |
| Backend check | A hidden control is not authorization; the API refuses a wrong-role request with 403 | SRS FR-22; SDS 5 |
| 401 and 403 coverage | Every protected endpoint returns 401 without a session; every role-restricted endpoint returns 403 for the wrong role; every protected endpoint is covered by an automated test | SRS NFR-02 |
| Order | Session (401), then role (403), then ownership (404), validation (400) and rules | SDS 2.2 |
| Identity | The acting user and role come from the session only | SDS 2.2, 5.1; GWS §5.2 |

## 4. Validation and failure cases

| Order | Case | Result | Error code | Message (OP-02.4) |
|---|---|---|---|---|
| 1 | State-changing request with a foreign `Origin` (F-01, OP-01.2) | 403 | `ORIGIN_NOT_ALLOWED` | as F-01 |
| 2 | No valid session | 401 | `UNAUTHENTICATED` | "Please log in." |
| 3 | Valid session, role not allowed on the route | 403 | `FORBIDDEN` | "You do not have permission to do this." |

Later checks (ownership, validation, rules) never run for a request refused here. So an anonymous request to a Manager-only route gets 401, not 403; and a Participant's request to a Manager-only route gets 403 even when its body is invalid or its id does not exist (no 400 or 404).

A `role` field in a body is stripped (OP-07.7), and a header such as `X-Role` is ignored; neither changes the role.

## 5. Permissions

The Sprint 1 role matrix, per endpoint (SDS 4.4, 5.1). "Public" means no session is needed.

| Endpoint | Anonymous | Participant | Manager | Contract |
|---|---|---|---|---|
| `GET /api/health`, `GET /api/ready` | public | public | public | kit smoke test |
| `POST /api/auth/login` | public | public | public | F-01 |
| `POST /api/auth/logout` | 401 | allowed | allowed | F-01 |
| `GET /api/auth/me` | 401 | allowed | allowed | F-01 |
| `GET /api/templates` | 401 | allowed (active only) | allowed (all) | F-03, F-06 |
| `POST /api/templates` | 401 | 403 | allowed | F-03, F-06 |
| `PATCH /api/templates/:id` | 401 | 403 | allowed | F-04, F-06 |
| `GET /api/goals` | 401 | allowed (own) | 403 | F-07, F-09, F-10 |
| `POST /api/goals` | 401 | allowed (self) | 403 | F-07, F-10 |
| `POST /api/goals/:id/entries` | 401 | allowed (own goal) | 403 | F-08, F-10 |
| `GET /api/goals/:id/entries` | 401 | allowed (own goal) | 403 | F-08, F-10 |

A new protected endpoint is added to this table and to TC-08 in the PR that adds it (NFR-02, rechecked on each later endpoint).

## 6. UI behaviour

- **Top bar** on every page after login: the display name from `GET /api/auth/me`, the role's menu items, and "Log out" (ADR 0026).
- **Menu items** (OP-02.1): Manager: "Templates". Participant: "Goals", "Templates".
- **First page after login** (OP-02.1): Manager: the template list (ADR 0043 "What the Program Manager sees first"). Participant: the goals page (in Sprint 1 the calendar does not exist yet; SRS A-3).
- **No session**: opening any page other than the login screen shows the login screen. Any API answer of 401 returns the user to the login screen (SDS 4.2).
- **Wrong-role page** (OP-02.2): a Participant who types a Manager-only page address (for example `/templates/new`) sees the plain sentence "This page is not available for your role." and the top bar; the API refuses any write anyway.
- The look is plain (ADR 0044). The top bar and menu work with the keyboard alone and fit 375 px and 1280 px (NFR-05, NFR-06; TC-47, TC-48 run on the Sprint 1 screens).

## 7. API

No new endpoint. This feature adds the two checks used by every protected route in section 5, as shared middleware: "require a session" and "require role X". Errors use the body `{ "error": { "code": "...", "message": "..." } }` (ADR 0025).

Example, a Participant sends `POST /api/templates`:
```json
{ "error": { "code": "FORBIDDEN", "message": "You do not have permission to do this." } }
```
with status 403.

## 8. Data

| Layer change | Detail |
|---|---|
| Table and migration | none (`User.role` comes from F-01) |
| Role source | The role is loaded with the session's user on each request; it is not cached in the cookie or in server memory, so a role change in the database applies to the next request |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-02.1 | A Manager and a Participant see the same top bar (display name, "Log out"); the Manager's menu shows "Templates" only, the Participant's "Goals" and "Templates" |
| AC-02.2 | Each protected endpoint in section 5 gets `401 UNAUTHENTICATED` with no session, and each role-restricted endpoint gets `403 FORBIDDEN` for the wrong role, with nothing stored or returned |
| AC-02.3 | On a Manager-only route, an anonymous request gets `401 UNAUTHENTICATED`; a Participant gets `403 FORBIDDEN` even with an invalid body or an unknown id, before validation or existence checks |
| AC-02.4 | A Participant who sends `"role": "MANAGER"` in the body or an `X-Role: MANAGER` header to a Manager-only route still gets `403 FORBIDDEN`; its handler never runs and nothing is stored |
| AC-02.5 | In the browser, with no session any page shows the login screen; when the session ends during use, the next API call returns the user to the login screen |

## 10. Test specification

Fixtures: one Manager and Participants A and B created by each test with test-only passwords. At the F-02 build step, register `POST /api/test/manager/:id` only in the test app with the real session and Manager-role middleware, followed by a body validator, an existence check and a handler spy. Register a test-only page `/test/protected` using the real layout and API client; it calls `GET /api/auth/me`. Neither test route is shipped. Before feature pages exist, TC-07 checks the role layout mounted on this test page; it does not load template or goal data. Later TC-08 adds feature fixtures through their APIs as each route is built; goal dates are relative to the Bangkok today (PR #29, OP-07.9).

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-07 | AC-02.1 | Browser | App on the test database; Manager and A exist | Log in as the Manager and read the top bar; log out; log in as A and read it | Both bars show the display name and "Log out"; the Manager's menu is exactly "Templates", A's is exactly "Goals", "Templates" |
| TC-08 | AC-02.2 | API | F-02: auth routes and the test-only Manager route; later: fixtures required by each implemented feature route | Table-driven over the implemented protected routes in section 5 plus the test-only route: call each with no cookie, then as the wrong role where restricted, with a valid body | Every no-session call gets `401 UNAUTHENTICATED`; every wrong-role call gets `403 FORBIDDEN`; no protected handler runs and no data changes. Start with F-01 routes and the test-only route; each feature PR adds its routes until every protected row in section 5 is covered |
| TC-66 | AC-02.3, AC-02.4 | API | Test-only Manager route registered as above; id 1 exists, 99999 does not; validator, existence check and handler are spies | Anonymous `POST /api/test/manager/1`; as A: POST id 1 with `{}`; POST id 99999; POST id 1 with a valid body plus `"role": "MANAGER"`; the same with header `X-Role: MANAGER` | Anonymous gets `401 UNAUTHENTICATED`; each of A's four calls gets `403 FORBIDDEN`; validator, existence check and handler never run; no data changes |
| TC-67 | AC-02.5 | Browser | App on the test database; A exists; test-only protected page registered as above | Open `/test/protected` with no session; log in as A and open that page; delete A's session row in the test database; reload the page | The first visit shows the login screen; after the reload `GET /api/auth/me` answers `401 UNAUTHENTICATED` and the login screen is shown |

## 11. Definition of done

- Every AC above has at least one test in section 10, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- The session and role checks are shared middleware; no route checks the role in its own code. TC-08 independently walks the actual Express route tree under `/api`, including mounted routers and each HTTP method. Only `POST /api/auth/login`, `GET /api/health` and `GET /api/ready` are public (implicit HEAD for GET follows Express). Every other route must be registered in the protected coverage table and must return 401 without a session; registered role restrictions also get 403 for the wrong role. A deliberately uncovered test-only route must fail the audit, including when both middleware and table entry are missing. Registering a route without protecting it must also fail (NFR-02).
- Contract, `docs/traceability.md` rows (AC, Test ID, Issue and PR) and the README setup are current; open points are disclosed.
- The PR is reviewed by the teammate with a specific check, and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-02.1 | Menu item names and each role's first page in Sprint 1. ADR 0043 sets the Manager's first screen (the template list); ADR 0037 puts the calendar first for a Participant, but the calendar is Sprint 2 (SRS A-3) | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): Manager "Templates", first page the template list; Participant "Goals" and "Templates", first page the goals page until the calendar arrives |
| OP-02.2 | What a Participant sees on a Manager-only page address | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): the sentence "This page is not available for your role." with the top bar; no redirect |
| OP-02.3 | Page addresses | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `/login`, `/templates`, `/templates/new`, `/templates/:id/edit`, `/goals` |
| OP-02.4 | Message wording for 401 and 403 | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): the texts in section 4 |
| OP-02.5 | An unknown `/api` path | Decided on [PR #31 review](https://github.com/phittayanan/habit-tracker/pull/31#pullrequestreview) (projectnewy, corrected round 1): `404 NOT_FOUND` with the standard error body, with or without a session |
| OP-10.1 | F-10 repeats the 401 and 403 checks for goal and entry endpoints in TC-34 | Open on PR #29 (proposal there: yes). TC-08 here covers every endpoint either way |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 | First draft (Issue #30) | pending |
| 2026-11-07 | Review round 1 ([PR #31](https://github.com/phittayanan/habit-tracker/pull/31)): test-only protected route and page for TC-66/67; TC-08 grows with implemented endpoints; record partner agreement on existing proposals | pending (partner re-check) |

## 14. Implementation evidence

Issue #32 implements this contract's Auth build step. [Local red/green evidence](../../auth-implementation-evidence.md) records TC-07/08/66/67 and Auth TC-47/48 results. TC-08 currently covers Auth routes and the test-only Manager route; later feature Issues must extend the list. Auth-only destination headings contain no Template or Goal data. OP-10.1 remains open. Implementation review and merge remain pending.

Current review clarification (2026-11-07): TC-08 route discovery is independent of `protectedRoutes`; regression fixtures cover nested router mounts, multiple methods, exact public paths and production test-route exclusion. OP-10.1 remains open. Source: https://github.com/phittayanan/habit-tracker/pull/34#pullrequestreview-5810651960.
