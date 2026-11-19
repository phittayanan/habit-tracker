# UAT-04 State and persistence: a used template is locked, goal state follows the dates, data survives logout and reload

Lab 6 Part A, Issue #102. Sprint 1 scope only. This case is written for the UAT Team (the partner team). A tester needs no verbal explanation: every step has an exact expected result, and every message is quoted as the screen shows it. The Product Team's version, URL and account labels are in the handoff package (Issue #103); no password appears here.

| Field | Value |
|---|---|
| Case ID | UAT-04 |
| Category | State, history and persistence |
| Requirements | FR-04, FR-05, FR-07, FR-10, FR-11, FR-12; BR-05, BR-06, BR-07, BR-08 |
| Acceptance criteria | AC-01.4, AC-01.10, AC-03.1, AC-04.1, AC-04.2, AC-04.6, AC-07.1, AC-07.4, AC-07.5, AC-08.1, AC-08.4, AC-08.11, AC-09.5, AC-09.6, AC-09.7 (contracts: `docs/sprints/sprint-1/F-01-login.md`, `F-03-template-create.md`, `F-04-template-edit.md`, `F-07-goal.md`, `F-08-entry.md`, `F-09-progress.md`) |
| Purpose | Show that a template can be edited while no goal uses it and cannot be edited once a goal uses it (even a goal that has already ended); that a goal is Active up to and including its end date and Ended the day after, and that an Ended goal does not block a new goal on the same template; and that goals, entries, progress text and the template survive a page reload and a logout followed by a new login. |
| Roles | Manager, account label **M1**; Participant, account label **P1** |
| Test type | Manual, in the browser |

## Preconditions

1. The deployed release and URL are the ones named in the handoff; write the version you see into the result table.
2. No template is named **UAT-04 Stretch**. This case makes its own template, so it does not depend on the demo data or on any other case. If the template already exists (an earlier run of this case), the Product Team resets the data as the handoff says before you start.
3. Today is `D`, the date in Asia/Bangkok (the rules use this date whatever the tester's browser time zone). Write the real dates in the result table; for example, if `D` is 2026-11-20, then `D-5` is 2026-11-15, `D-4` is 2026-11-16, `D-2` is 2026-11-18 and `D-1` is 2026-11-19.
4. Run the parts in order A, B, C, D, E, F in one sitting, and **finish before 24:00 Asia/Bangkok on day `D`**: after midnight the goal that ends on `D` becomes **Ended** (correct behaviour, but no longer the expected text). This case needs only its own template and its own two goals, so it can run before or after UAT-01, UAT-02 and UAT-03. P1 may already have goals from those cases; this case never touches them, and the steps name each goal by its template and dates.

## Synthetic inputs

| Item | Value |
|---|---|
| Template (Part A) | name `UAT-04 Stretch`, unit `minutes`, minimum 1, maximum 50, then edited to maximum 60 |
| Edit tried after a goal uses it | Maximum 55 (Part C), name `UAT-04 Stretch 2` (Part F) |
| Goal 1 (Part B), already Ended | target 10, start `D-5`, end `D-1` |
| Goal 1 entries | `D-5` value 10, `D-4` value 9, `D-1` value 30 |
| Goal 2 (Part D), Active on its end day | target 20, start `D-2`, end `D` |
| Goal 2 entries | `D-2` value 25, `D-1` value 19, `D` value 20 |

## Steps and expected results

### Part A: an unused template can be edited (Manager M1; AC-03.1, AC-04.1, AC-04.6)

| Step | Action | Expected result |
|---|---|---|
| A1 | Open the application URL in a browser that has no session (a private window) and log in as **M1** with the credentials from the private handoff. | The Templates page opens (a Manager's first page) with a table (Name, Unit, Range, State, Edit) and a "New" button. There is no row named UAT-04 Stretch. |
| A2 | Press "New". Type **Name** `UAT-04 Stretch`, **Unit** `minutes`, **Minimum** `1`, **Maximum** `50`. Press **Save**. | The Templates page opens. The table has a row `UAT-04 Stretch`, `minutes`, `1–50`, `Active`, with an Edit button. |
| A3 | In that row press **Edit**. | A page with the heading **"Edit template"** opens. The form is filled with `UAT-04 Stretch`, `minutes`, `1` and `50`. |
| A4 | Change **Maximum** to `60`. Press **Save**. | The Templates page opens. The row now shows `UAT-04 Stretch`, `minutes`, `1–60`, `Active`. No message was shown: nothing uses the template yet, so the edit is allowed. |
| A5 | Press "Log out". | The login screen shows again. |

### Part B: an already-ended goal with three entries (Participant P1; AC-07.5, AC-08.4, AC-08.11, AC-09.5)

| Step | Action | Expected result |
|---|---|---|
| B1 | Log in as **P1**. | The goals page opens. (It may list goals from other cases; this case does not use them.) The goals page has no goal on UAT-04 Stretch. |
| B2 | Press "+ New goal". Choose template **UAT-04 Stretch**, **Daily target** `10`, **Start date** `D-5`, **End date** `D-1`. Press **Save**. | The goals page opens with no error message. It lists a goal: UAT-04 Stretch, "Daily target: 10 minutes", `D-5` – `D-1`, state **Ended** (its end date has passed), **"0 of 5 days met"** (the days so far run from `D-5` to its end date `D-1`: 5 days), and under it "No entries yet". |
| B3 | In that goal set the **Date** box to `D-5`, the **Value (minutes)** box to `10`, press **Save entry**. (The Date box shows today `D` first, so change it.) | The entry list shows "`D-5`: 10 minutes" (the date as `YYYY-MM-DD`). The progress text becomes **"1 of 5 days met"** (10 is equal to the target 10). |
| B4 | Set **Date** to `D-4` and **Value (minutes)** to `9`. Press **Save entry**. | The list shows "`D-4`: 9 minutes" above "`D-5`: 10 minutes". The progress stays **"1 of 5 days met"** (9 is below the target 10, but the day still counts in the 5). |
| B5 | Set **Date** to `D-1` (the end day) and **Value (minutes)** to `30`. Press **Save entry**. | The list shows, from top to bottom, "`D-1`: 30 minutes", "`D-4`: 9 minutes", "`D-5`: 10 minutes". The progress becomes **"2 of 5 days met"**. The state stays **Ended**. |
| B6 | Press "Log out". | The login screen shows again. |

### Part C: a template used only by an Ended goal is still locked (Manager M1; AC-04.2, AC-04.6)

| Step | Action | Expected result |
|---|---|---|
| C1 | Log in as **M1**. In the row `UAT-04 Stretch` press **Edit**. | The "Edit template" form opens, filled with `UAT-04 Stretch`, `minutes`, `1` and `60`. |
| C2 | Change **Maximum** to `55`. Press **Save**. | The form stays open and shows **"This template is used by a goal and cannot be edited."** The Maximum box still holds `55` (what you typed). The goal that uses the template has already ended, and it still locks the template. |
| C3 | Press **Cancel**. | The Templates page shows the row `UAT-04 Stretch`, `minutes`, **`1–60`** (not `1–55`): the refused edit changed nothing. |
| C4 | Press "Log out". | The login screen shows again. |

### Part D: a new goal while the earlier one is Ended; Active on its end day (Participant P1; AC-07.4, AC-07.5, AC-08.4, AC-09.7)

| Step | Action | Expected result |
|---|---|---|
| D1 | Log in as **P1**. Press "+ New goal". Choose template **UAT-04 Stretch**, **Daily target** `20`, **Start date** `D-2`, **End date** `D`. Press **Save**. | The goals page opens with no error message. (A second goal on the same template is allowed because the first one is Ended, so the message "You already have an active goal for this template." does not appear.) The page lists two UAT-04 Stretch goals, the newest first. The first is `D-2` – `D`, "Daily target: 20 minutes", state **Active** (its end date is today, and a goal is still Active on its end day), **"0 of 3 days met"** (`D-2`, `D-1`, `D`), "No entries yet". The second is the goal from Part B: `D-5` – `D-1`, **Ended**, **"2 of 5 days met"**, with its three entries. |
| D2 | In the goal `D-2` – `D` set **Date** to `D-2` and **Value (minutes)** to `25`. Press **Save entry**. | The list shows "`D-2`: 25 minutes". The progress becomes **"1 of 3 days met"** (25 is above the target 20). |
| D3 | Set **Date** to `D-1` and **Value (minutes)** to `19`. Press **Save entry**. | The list shows "`D-1`: 19 minutes" above "`D-2`: 25 minutes". The progress stays **"1 of 3 days met"** (19 is below the target 20). |
| D4 | Set **Date** to `D` and **Value (minutes)** to `20`. Press **Save entry**. | The list shows, from top to bottom, "`D`: 20 minutes", "`D-1`: 19 minutes", "`D-2`: 25 minutes". The progress becomes **"2 of 3 days met"** (20 is equal to the target 20). The state is still **Active**. |
| D5 | Read the older goal `D-5` – `D-1` on the same page. | It still shows **Ended**, **"2 of 5 days met"** and its three entries: the entries of the new goal were not mixed into it. |

### Part E: reload, then log out and log in again (Participant P1; AC-01.4, AC-01.10, AC-07.1, AC-08.1, AC-09.6)

| Step | Action | Expected result |
|---|---|---|
| E1 | Reload the page (F5). | The page shows exactly the same two goals as in the table "State after Part D" below: the same targets, dates, states, progress text and entry lists. |
| E2 | Press "Log out". | The login screen shows again. |
| E3 | Log in as **P1** again. | The goals page opens and shows again exactly the same two goals as in the table "State after Part D": nothing was lost by logging out, and no entry or goal was changed. |
| E4 | Press "Log out". | The login screen shows again. |

### Part F: the template survived too (Manager M1; AC-03.1, AC-04.2)

| Step | Action | Expected result |
|---|---|---|
| F1 | Log in as **M1**. | The Templates page shows the row `UAT-04 Stretch`, `minutes`, `1–60`, `Active`, as left in Part C. |
| F2 | In that row press **Edit**. Change **Name** to `UAT-04 Stretch 2` (leave the other boxes). Press **Save**. | The form stays open and shows **"This template is used by a goal and cannot be edited."** (the template is now used by two goals; any field is refused, not only the range). |
| F3 | Press **Cancel**. | The Templates page still shows the row named `UAT-04 Stretch` (not `UAT-04 Stretch 2`) with `1–60`, and no row named UAT-04 Stretch 2. |
| F4 | Press "Log out". | The login screen shows again. |

### State after Part D (the same in E1 and E3)

| | Goal on UAT-04 Stretch, newest first | Older goal |
|---|---|---|
| Period | `D-2` – `D` | `D-5` – `D-1` |
| Target | "Daily target: 20 minutes" | "Daily target: 10 minutes" |
| State | **Active** | **Ended** |
| Progress | **"2 of 3 days met"** | **"2 of 5 days met"** |
| Entries (newest date first) | `D`: 20 minutes; `D-1`: 19 minutes; `D-2`: 25 minutes | `D-1`: 30 minutes; `D-4`: 9 minutes; `D-5`: 10 minutes |

### Expected-result calculation (days met)

| Goal | Day | Value | Target | Met? |
|---|---|---|---|---|
| Ended goal, target 10 | `D-5` | 10 | 10 | Yes (equal to the target) |
| | `D-4` | 9 | 10 | No (below) |
| | `D-3` | no entry | 10 | No |
| | `D-2` | no entry | 10 | No |
| | `D-1` | 30 | 10 | Yes (above) |
| Active goal, target 20 | `D-2` | 25 | 20 | Yes (above) |
| | `D-1` | 19 | 20 | No (below) |
| | `D` | 20 | 20 | Yes (equal to the target) |

Ended goal: days so far `D-5` to its end date `D-1` = **5** (the count stops at the end date), days met = **2**: **"2 of 5 days met"**. Active goal: days so far `D-2` to today `D` = **3**, days met = **2**: **"2 of 3 days met"**.

## Pass rule

PASS only if every step gives its expected result: the unused template is edited (A4), the used template is refused with the message shown and unchanged (C2, C3, F2, F3), the goal that ends today is Active and the goal that ended yesterday is Ended (B2, D1), the second goal on the template is accepted (D1), and the two goals show the table "State after Part D" after the reload (E1) and after logging in again (E3). An edit that is accepted after a goal exists, a refused edit that changes the range or name, a wrong state or number, a missing goal or entry after the reload or the new login, or entries of one goal appearing in the other is FAIL: record the step number and what you saw. If you cannot reach the application or log in, record BLOCKED with the reason (BLOCKED is not a pass).

This case does not restart or redeploy the service: that needs the Product Team, and the restart and redeploy checks are in the Product Team's Lab 5 evidence (`docs/labs/lab-05/deployment.md`).

## Result record (the UAT Team fills this in; do not copy the expected results)

| Field | Entry |
|---|---|
| Tester name and team | |
| Date and time | |
| Tested version (revision or tag shown in the handoff) | |
| Real dates used for `D-5`, `D-4`, `D-2`, `D-1`, `D` | |
| Actual result per step | |
| PASS / FAIL / BLOCKED | |
| Evidence IDs (screenshots) | |
| Issue ID if FAIL | |

## Cleanup and sequence

After this case the template `UAT-04 Stretch` exists with range `1–60` (a template cannot be deleted in Sprint 1, and it cannot be edited now that goals use it), and P1 has two goals on it with five and three entries. Before you run UAT-04 again, the Product Team resets the data as the handoff says (Issue #103). UAT-04 uses only M1 and P1 and its own template, so it does not depend on UAT-01, UAT-02 or UAT-03.
