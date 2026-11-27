# F-17 Stored reminder

Sprint 3 contract (Deliverable 2 Part C, [Issue #157](https://github.com/phittayanan/habit-tracker/issues/157)). Written before any code. Built from the merged SRS, SDS, features, traceability, the Sprint 1 and Sprint 2 contracts, ADR 0006 and ADR 0016, plus ADR 0086 to ADR 0088. Points drafted by Claude Code are marked in section 12.

## 1. Identity

| Item | Value |
|---|---|
| Feature | F-17 Stored reminder |
| Sprint | 3 (the Sprint 3 work built before 29 November, ADR 0021) |
| Requirements | FR-21; BR-14 |
| Related | BR-10; F-07; NFR-02, NFR-03, NFR-05, NFR-06 |
| Depends on | F-07 |
| Needed by | none |
| Author / reviewer | projectnewy / phittayanan. Code owner: phittayanan (#158) |
| Status | In progress in #158 (started 2026-11-27). It merges after the `v2.0` release and after #155 (ADR 0096) |

## 2. Behaviour and workflow

1. On the goals page a Participant sets a reminder on a goal that has not ended: a time of day and one or more weekdays (ADR 0086 to ADR 0088).
2. A goal has at most one reminder. Saving again replaces it. "Remove" deletes it (ADR 0086).
3. The goals page shows the stored reminder. The app sends nothing: no email, push, browser notification or other message (BR-14; ADR 0016).
4. After a goal ends, its reminder still shows and can be removed, but cannot be set or changed (ADR 0087).

## 3. Business rules

| Rule | Statement | Source |
|---|---|---|
| Stored only | A reminder is stored and shown; nothing is sent | SRS BR-14, FR-21; ADR 0016 |
| One per goal | At most one; saving replaces it | ADR 0086 |
| Time | A time of day `HH:MM`, 24-hour, `00:00` to `23:59`, meant in Asia/Bangkok | ADR 0006; OP-17.2 |
| Weekdays | At least one of `MON` to `SUN`, no repeats, stored and returned Monday first | ADR 0086; OP-17.2 |
| Which goals | Set or change while the end date is today or later; remove at any time | ADR 0087 |
| Owner | Only the goal's owner | SRS BR-10 |
| Retired template | A goal on a retired template keeps working, reminder included | ADR 0017 |

## 4. Validation and failure cases

`PUT` and `DELETE /api/goals/:id/reminder`, checks in this order:

| Order | Case | Result | Error code | Message |
|---|---|---|---|---|
| 0 | Origin refused | 403 | F-01 | F-01 |
| 1 | No valid session | 401 | `UNAUTHENTICATED` | F-01 |
| 2 | Caller is a Manager | 403 | `FORBIDDEN` | F-02 |
| 3 | Goal does not exist or is another Participant's | 404 | `GOAL_NOT_FOUND` | F-08 |
| 4 | (`PUT`) `time` missing or not `HH:MM` in range | 400 | `VALIDATION_ERROR` | "Enter a time from 00:00 to 23:59." |
| 5 | (`PUT`) `weekdays` missing, not a list, empty, with an unknown or repeated day | 400 | `VALIDATION_ERROR` | "Choose at least one weekday, each only once." |
| 6 | (`PUT`) the goal has ended | 409 | `GOAL_ENDED` | "This goal has ended and cannot be changed." |

A refused request changes nothing. When both fields are wrong, the time message is returned.

Boundaries: `00:00` and `23:59` are accepted; `24:00`, `7:30` and `07:60` are refused; one day and all seven are accepted; a goal ending today can be changed. `DELETE` on a goal with no reminder returns 204. Other body fields are ignored. Two saves at once leave one reminder.

## 5. Permissions

| Caller | Set, change, remove or read a reminder |
|---|---|
| Anonymous | 401 |
| Participant | own goals only; another's: 404 `GOAL_NOT_FOUND` |
| Manager | 403 |

## 6. UI behaviour

- Each goal on the goals page shows "Reminder: 07:30 on Mon, Wed, Fri" or "No reminder".
- A goal that has not ended has "Set reminder" (or "Change reminder"). It opens in place a time box, seven weekday checkboxes (Mon to Sun) in a labelled group, "Save" and "Cancel", and the text "The app only stores this. It sends nothing."
- A goal with a reminder has "Remove reminder", also after it ends. It removes at once, with no question (OP-17.3).
- While a request runs its button is disabled. A rejected save shows the API `message` and keeps the typed values. On success the line updates without a reload.
- 375 px and 1280 px with no horizontal scroll; keyboard only. Chosen weekdays are checked boxes, not colour alone.
- Sprint 1 goals-page tests: what they check stays the same. Only the Tab steps that pass the new controls may change.

## 7. API

Errors use the ADR 0025 body.

- **`PUT /api/goals/:id/reminder`** (Participant): request `{ "time": "07:30", "weekdays": ["MON", "WED", "FRI"] }`; response 200 `{ "reminder": { "time": "07:30", "weekdays": ["MON", "WED", "FRI"] } }`.
- **`DELETE /api/goals/:id/reminder`** (Participant): no body; response 204.
- **Goal objects of the goal endpoints** (`GET /api/goals`, the response of `POST /api/goals` and of `PATCH /api/goals/:id`, and `GET /api/goals/:id` once F-16 builds it): also `"reminder"`, the object above or `null`. `GET /api/calendar` has no `reminder` field: the calendar does not show reminders (ADR 0088). Exact-shape checks of Sprint 1 tests of a goal object gain this field.

## 8. Data

| Layer | Detail |
|---|---|
| New table `GoalReminder` | `goal_id` primary key and reference to `Goal`, `ON DELETE CASCADE` (ADR 0095); `time` text, 5 characters, not null; `weekdays` text array, not null, with at least one item |
| Migration | One additive migration; no existing table or row changes, so the previous app version still runs |
| Human step | A person reads the migration before it runs on Cloud SQL (#158) |
| Nothing sent | No mail, push or scheduler library, job or outbound request is added |

## 9. Acceptance criteria

| AC | Observable outcome |
|---|---|
| AC-17.1 | The owner stores a reminder; it is returned by `GET /api/goals` Monday first and is still there after a restart; the `POST /api/goals` and `PATCH /api/goals/:id` responses carry `reminder` (`null` when there is none); `GET /api/calendar` has no `reminder` field |
| AC-17.2 | Saving again replaces it; the goal never has two |
| AC-17.3 | The owner removes it (204), also on an ended goal; removing when there is none is 204 |
| AC-17.4 | Bad times and weekday lists get `400 VALIDATION_ERROR` with the section 4 messages and change nothing |
| AC-17.5 | Setting or changing on an ended goal gets `409 GOAL_ENDED`; on a goal ending today it is accepted |
| AC-17.6 | Anonymous gets 401, a Manager 403, another Participant 404; nothing changes |
| AC-17.7 | Storing and reading a reminder makes no outbound call, and no sending library is added |
| AC-17.8 | The goals page shows, sets, changes and removes the reminder as section 6 |
| AC-17.9 | The controls fit 375 px and 1280 px and work by keyboard only |

## 10. Test specification

`D` is today in Asia/Bangkok. Fixtures: Participants A and B, a Manager; A's goal W running `D-5` to `D+5` and goal E that ended `D-1`.

| Test | AC | Level | Precondition / input | Action | Expected result |
|---|---|---|---|---|---|
| TC-43 | AC-17.1, AC-17.7 | API | Fixtures; `fetch`, `http.request` and `https.request` replaced by recorders after login | `PUT` W `07:30` with `["FRI","MON"]`; read goals; restart; read. Then `POST /api/goals` on a template A has no goal on; `PATCH` W to another valid daily target; `GET /api/calendar` for day `D` | 200; `["MON","FRI"]` both times; the `POST` response has `reminder` `null`; the `PATCH` response has W's reminder; no goal in day `D` of the calendar has a `reminder` field; the recorders saw no call. The test client's own request to the app is not counted |
| TC-167 | AC-17.7 | Review | The PR diff and `server/package.json` | Search for mail, push, notification and scheduler libraries or jobs | None added; the reviewer records the check |
| TC-168 | AC-17.2 | API and database | W with a reminder | `PUT` another; then two `PUT` at the same time | The latest replaces the first; both 200; one row |
| TC-169 | AC-17.3 | API | W and E with reminders (E's inserted directly) | `DELETE` each twice | 204 every time; no rows |
| TC-170 | AC-17.4 | API and unit | W | `PUT` with times `24:00`, `7:30`, `07:60`, missing; weekdays `[]`, `["MONDAY"]`, `["MON","MON"]`, "MON", missing; `00:00` and `23:59` with one and seven days | The invalid ones get 400 with the section 4 message and nothing changes; the valid ones get 200 |
| TC-171 | AC-17.5 | API | E; a goal ending `D` | `PUT` on each | `409 GOAL_ENDED`; 200 |
| TC-172 | AC-17.6 | API | W with a reminder | `PUT` and `DELETE` as anonymous, the Manager and B; an unknown id | 401, 403, 404, 404; unchanged. TC-08 lists both routes |
| TC-173 | AC-17.8 | Browser | A on the goals page | Set `07:30` Mon and Fri; reload; try to save with no day; change; remove | "Reminder: 07:30 on Mon, Fri" also after reload; the API message with the typed values kept; then the new line; then "No reminder" |
| TC-174 | AC-17.8 | Browser | E with a reminder | Read E | The line shows, with "Remove reminder" and no set or change button |
| TC-175 | AC-17.9 | Browser | Both widths | Set and remove by keyboard only | No horizontal scroll; every control reachable |

## 11. Definition of done

- Every AC has a test or the recorded review (TC-167), written first and seen failing, then passing; the command, counts and tested commit are recorded.
- A person reads the migration before it reaches Cloud SQL.
- Merged into `staging` only after the `v2.0` release (#160), so it ships in `v2.1`.
- Contract, traceability and SDS are current; the PR is reviewed by the teammate.

## 12. Open points and decisions

| ID | Point | Status and answer |
|---|---|---|
| OP-17.1 | One reminder, removable; which goals; where it is set | Decided by projectnewy (ADR 0086 to ADR 0088); phittayanan agreed in the review of 95c47f8 (PR #174) |
| OP-17.2 | `HH:MM` 24-hour in Asia/Bangkok; weekday codes and Monday-first order | Drafted by Claude Code; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 95c47f8 (PR #174) |
| OP-17.3 | Check order, codes and messages; remove without a question; 204 when there is none; screen texts; table and column names; how "no outbound call" is tested | Drafted by Claude Code; accepted by projectnewy on 2026-11-27; phittayanan agreed in the review of 95c47f8 (PR #174) |
| OP-17.4 | Whether the goals inside `GET /api/calendar` carry `reminder` (question 3 of the [review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219)) | Decided by projectnewy on 2026-11-27: no; only the goal objects of the goal endpoints do (section 7); phittayanan agreed in the [approval of 33f4fbc](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089420416) of PR #174 |
| OP-17.5 | What happens to a reminder when its goal row is deleted (section 8) | Decided by phittayanan on 2026-11-27 (#158): deleted with the goal, `ON DELETE CASCADE` (ADR 0095); pending projectnewy in the #158 PR |
| OP-17.6 | `GET /api/calendar` (TC-43) is built in #155, not yet on `staging` when #158 starts | Decided by phittayanan on 2026-11-27 (#158): #158 is blocked by #155; the calendar step is committed failing and passes after #155 merges (ADR 0096); pending projectnewy in the #158 PR |

## 13. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-27 | First draft (Issue #157) | pending (reviewer phittayanan) |
| 2026-11-27 | [Review of 95c47f8](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089036219) of PR #174: phittayanan agreed to the decisions and drafted points; section 7 says which responses carry `reminder` (OP-17.4) | pending (reviewer phittayanan) |
| 2026-11-27 | [Approval of 33f4fbc](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089420416) of PR #174, finding 1: AC-17.1 and TC-43 now check `reminder` in the `POST` and `PATCH` responses and its absence from `GET /api/calendar` (section 7, OP-17.4) | pending (reviewer phittayanan) |
| 2026-11-27 | Issue #158 starts the code: status, `ON DELETE CASCADE` (section 8, OP-17.5, ADR 0095), the TC-43 calendar step waits for #155 (OP-17.6, ADR 0096) | pending (reviewer projectnewy) |
