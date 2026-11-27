# F-14 Goal change

Sprint 2 contract (Deliverable 2 Part B, [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 contracts, ADR 0011, ADR 0054 and ADR 0065, plus ADR 0075 to ADR 0077, ADR 0084, ADR 0086 and ADR 0087. Points drafted by Claude Code are marked in section 12.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-14 Goal change |
| Sprint | 2 |
| Requirements | FR-18; BR-12 |
| Related | BR-07, BR-10, BR-15; SRS A-4; F-09, F-11, F-12 (AC-12.5, TC-123); NFR-02, NFR-03, NFR-05, NFR-06 |
| Depends on | F-07, F-09 |
| Needed by | F-12; F-16 |
| Author / reviewer | projectnewy / phittayanan. Code owner: phittayanan (#153) |
| Status | Draft for review |

## 2. Behaviour and workflow

1. On the goals page a Participant presses "Change target" on a goal that has not ended, types the new target and saves (ADR 0076, ADR 0084).
2. The new target applies from today (Asia/Bangkok), or from the start date if the goal has not started. Earlier days keep the target they had (BR-12; ADR 0076).
3. Only the daily target changes. The template and dates cannot change.
4. "Days met", the calendar and the List judge each day against its own target.

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| BR-12 | A change applies from today on; earlier days keep the old target | SRS BR-12; ADR 0011 |
| Which goals | End date today or later | ADR 0076 |
| Effective date | The later of today and the start date | ADR 0076 |
| One per date | A second change with the same effective date replaces it | ADR 0077 |
| Range | Above the template's `min_value` and not above `max_value`; at most 2 decimal places; whole minutes for `TIME` | SRS A-4; ADR 0054, ADR 0065 |
| Target of a day | The version with the latest effective date on or before the day; with none, `daily_target` | ADR 0075 |
| Current target | `daily_target` always holds the latest target | ADR 0075 |
| Retired template | An existing goal can still change its target | ADR 0017 |

## 4. Validation and failure cases

`PATCH /api/goals/:id`, checks in this order:

| Order | Case | Result | Error code | Message |
|---|---|---|---|---|
| 0 | Origin refused | 403 | F-01 | F-01 |
| 1 | No valid session | 401 | `UNAUTHENTICATED` | F-01 |
| 2 | Caller is a Manager | 403 | `FORBIDDEN` | F-02 |
| 3 | Goal does not exist or is another Participant's | 404 | `GOAL_NOT_FOUND` | F-08 |
| 4 | `dailyTarget` missing or invalid as in F-07; a fraction on a `TIME` goal | 400 | `VALIDATION_ERROR` | F-07; "Target must be whole minutes." |
| 5 | The goal has ended | 409 | `GOAL_ENDED` | "This goal has ended and cannot be changed." |
| 6 | Above `max_value` | 400 | `TARGET_ABOVE_TEMPLATE_MAX` | F-07 |
| 7 | Not above `min_value` | 400 | `TARGET_NOT_ABOVE_TEMPLATE_MIN` | F-07 |

A refused request changes nothing.

Boundaries: a goal ending today can change; the day after, it cannot. A target equal to `max_value` is accepted and one equal to `min_value` is refused. Sending the current target gets 200 and writes nothing. Other body fields are ignored.

## 5. Permissions

| Caller | Change a target |
|---|---|
| Anonymous | 401 |
| Participant | own goals only; another's: 404 `GOAL_NOT_FOUND` |
| Manager | 403 |

## 6. UI behaviour

- Each goal that has not ended has "Change target" on the goals page; an ended goal has none.
- It opens in place a number box filled with the current target, "Save" and "Cancel", and the text "Applies from today. Earlier days keep their target." For a goal not yet started: "Applies from {start date}."
- A `TIME` target is typed in minutes with the "= 7 h" hint (ADR 0065).
- While saving, Save is disabled. A rejected change shows the API `message` and keeps the typed value. On 200 the page shows the new target and the recomputed "N of M days met" without a reload.
- "Daily target" on the goals page shows the current target. Earlier targets are not listed.
- 375 px and 1280 px with no horizontal scroll; keyboard only.

## 7. API

Errors use the ADR 0025 body.

**`PATCH /api/goals/:id`** (Participant): request `{ "dailyTarget": 6 }`; response 200 `{ "goal": { ... } }` in the F-07 shape, where `dailyTarget` is the latest target. `GET /api/goals` keeps its shape.

## 8. Data

| Layer | Detail |
|---|---|
| New table `GoalTarget` | `id`; `goal_id` reference to `Goal`, not null; `effective_from` date, not null; `daily_target` decimal(10, 2), not null; unique (`goal_id`, `effective_from`) |
| `Goal.daily_target` | Kept, not changed by the migration, updated to the latest target on every change (ADR 0075) |
| Migration | One additive migration: create the table and insert, for every goal, (`goal_id`, `start_date`, `daily_target`) |
| Goal creation (F-07) | Also inserts the first row, in the same transaction |
| A change | In one transaction with the goal row locked: if no row is effective on the start date (a goal created while the app was rolled back), first insert (start date, old `daily_target`); then insert or replace the row of the effective date; then update `daily_target` |
| Delete | `goal_id` is `ON DELETE CASCADE`: versions go with their goal (ADR 0086) |
| Human step | A person reads the migration before it runs on Cloud SQL (#153) |

**Rollback (ADR 0075).** The previous app version still runs on the new schema. It ignores `GoalTarget` and judges all days against `daily_target`, so days before a change are shown wrongly until the roll forward. Goals it creates have no version row and use `daily_target`.

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-14.1 | The owner changes the target of a running goal; the response and `GET /api/goals` show it, also after a restart |
| AC-14.2 | Days before the change are judged against the old target; today and later against the new one |
| AC-14.3 | For a goal not yet started the new target applies from the start date |
| AC-14.4 | Two changes on one day leave one version for that date, with the last value |
| AC-14.5 | An ended goal, a bad value and an out-of-range target are refused as section 4, changing nothing |
| AC-14.6 | Anonymous gets 401, a Manager 403, another Participant 404; nothing changes |
| AC-14.7 | The migration keeps every goal and its `daily_target`, and gives each goal one version from its start date; progress is the same before and after |
| AC-14.8 | A new goal has a first version; a goal with no version row uses `daily_target`, and its first change keeps the old target for earlier days |
| AC-14.9 | The goals page changes the target as section 6, with no button on an ended goal, at 375 px and 1280 px and by keyboard only |

## 10. Test specification

`D` is today in Asia/Bangkok. Fixtures: Participants A and B, a Manager; template "Water" (glasses, 1 to 12); A's goal W (target 8, `D-10` to `D+10`) with 7 on `D-2` and 7 on `D`.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-39 | AC-14.2 | Unit | Versions 8 from `D-10`, 6 from `D`; entries as fixtures | Compute progress | `D-2` not met, `D` met |
| TC-152 | AC-14.1, AC-14.2, AC-14.4 | API and database | Fixtures | Change to 5, then to 6; read goals; restart; read | Target 6; rows: 8 from `D-10`, 6 from `D`; days met 1 |
| TC-153 | AC-14.3 | API and database | A goal starting `D+3`, target 8 | Change to 6 | One row, 6 from `D+3` |
| TC-154 | AC-14.5 | API | A second goal ended `D-1`; a goal ending `D`; a `TIME` goal | (a) Change the ended goal to 6. (b) Change the goal ending `D` to 6. (c) Send W targets 0, "x", 2.555, 13 and 1. (d) Send the `TIME` goal 420.5. (e) Send W 12, then 12 again | (a) `409 GOAL_ENDED`. (b) 200. (c) 0, "x" and 2.555: `400 VALIDATION_ERROR`; 13: `TARGET_ABOVE_TEMPLATE_MAX`; 1: `TARGET_NOT_ABOVE_TEMPLATE_MIN`; nothing changes. (d) `400 VALIDATION_ERROR`. (e) Both 200; the second writes no row |
| TC-155 | AC-14.6 | API | Fixtures | Change W as anonymous, Manager, B; an unknown id | 401, 403, 404, 404; unchanged. TC-08 lists the route |
| TC-156 | AC-14.7 | API and database | A database at the `v1.5` migrations with goals and entries | Apply the migration; compare the rows and the progress | `Goal` rows identical; one version per goal from its start date; same progress |
| TC-157 | AC-14.8 | API and database | One goal created through the API; one inserted without a version row | Read both; change the second to 6 | The first has one row; the second uses `daily_target`, then has the old target from its start date and 6 from today |
| TC-158 | AC-14.9 | Browser | A on the goals page; also an ended goal | Change W to 13 (rejected), then 6 | Message and 13 kept; then "Daily target: 6 glasses" and updated days met; no button on the ended goal |
| TC-159 | AC-14.9 | Browser | 375 px and 1280 px | Change the target by keyboard only | No horizontal scroll; every control reachable |

TC-123 (F-12) runs once this feature is merged.

## 11. Definition of done

- Every AC has a test, written first and seen failing, then passing; the command, counts and tested commit are recorded.
- Unit tests cover the target-of-a-day rule.
- TC-156 passes before the migration reaches Cloud SQL, and a person has read the migration.
- Contract, traceability and SDS are current; the PR is reviewed and merged into `staging`.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-14.1 | The `daily_target` column (Issue #150: both students decide) | projectnewy chose keep and update (ADR 0075); phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-14.2 | Which goals, same-day changes, the control | Decided by projectnewy (ADR 0076, ADR 0077, ADR 0084); phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-14.3 | The current value writes nothing; `GOAL_ENDED`; check order; screen texts; table and column names; the baseline row for a goal without versions; no list of earlier targets | Drafted by Claude Code; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 507ba1c (PR #171) |
| OP-14.4 | What deleting a goal does to its versions; when the `TIME` whole-minutes check and "= 7 h" hint are built, since `Template.kind` comes with #168 | phittayanan chose CASCADE (ADR 0086) and the same #153 PR, merged after #168 (ADR 0087), on 2026-11-27 |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #150) | pending (reviewer phittayanan) |
| 2026-11-27 | [Review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6087598169) of PR #171: phittayanan agreed to the decisions and drafted points (section 12) | pending (reviewer phittayanan) |
| 2026-11-27 | Issue #153: ADR 0086 (versions deleted with their goal) and ADR 0087 (`TIME` check after #168) | phittayanan; projectnewy reviews the #153 PR |
