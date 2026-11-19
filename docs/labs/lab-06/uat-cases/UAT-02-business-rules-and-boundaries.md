# UAT-02 Business rules and boundaries: limits, dates, one entry a day, one active goal

Lab 6 Part A, Issue #100. Sprint 1 scope only. This case is written for the UAT Team (the partner team). A tester needs no verbal explanation: every step has an exact expected result, and every message is quoted as the screen shows it. The Product Team's version, URL and account labels are in the handoff package (Issue #103); no password appears here.

| Field | Value |
|---|---|
| Case ID | UAT-02 |
| Category | Business rule and boundary |
| Requirements | FR-05, FR-10, FR-11; BR-01, BR-03, BR-04, BR-05, BR-06 |
| Acceptance criteria | AC-03.2, AC-03.7, AC-07.3, AC-07.7, AC-07.9, AC-07.11, AC-08.2, AC-08.3, AC-08.4, AC-08.6, AC-08.7, AC-08.8, AC-08.10, AC-08.11 (contracts: `docs/sprints/sprint-1/F-03-template-create.md`, `F-07-goal.md`, `F-08-entry.md`) |
| Purpose | Show that the application refuses every value just outside a limit with a clear message, accepts the value exactly on each limit, and stores nothing for a refused request. |
| Roles | Manager, account label **M1** (Part A); Participant, account label **P2** (Parts B to D) |
| Test type | Manual, in the browser |

## Preconditions

1. The deployed release and URL are the ones named in the handoff; write the version you see into the result table.
2. Templates **Water** (unit `glasses`, minimum 1, maximum 12) and **Reading** (unit `pages`, minimum 1, maximum 100) exist and are active. The demo data seeds both (`SEED_DEMO_DATA=true`, `docs/labs/lab-05/deployment.md`); the handoff package (Issue #103) states whether the deployed database has them. If one is missing, record BLOCKED and tell the Product Team.
3. No template is named **UAT-02 Squats**. If one exists (an earlier run of this case), the Product Team resets the data as the handoff says before you start.
4. Account **P2** has **no goals**. If it has some, reset the data as the handoff says before you start.
5. Today is `D`, the date in Asia/Bangkok (the rules use this date whatever the tester's browser time zone). Write the real dates in the result table; for example, if `D` is 2026-11-20 then `D-10` is 2026-11-10, `D-3` is 2026-11-17 and `D+6` is 2026-11-26.
6. Run the parts in order A, B, C, D in one sitting (on one date `D`). Part B needs the template from Part A.

## Synthetic inputs

| Item | Value | Why this value |
|---|---|---|
| New template (Part A) | name `UAT-02 Squats`, unit `reps` | A name no seed uses |
| Template range tried | min 10 / max 10; min 11 / max 10; min 10 / max 50 | Equal limits, minimum above maximum, then a valid range |
| Goal targets tried on UAT-02 Squats (min 10, max 50) | 10, 9, 51, 50, then 20 | On the minimum, below it, above the maximum, on the maximum, then a second goal |
| Goal on Water (min 1, max 12) | target 8, start `D-3`, end `D+3` | Used for the entry rules |
| Entry values tried on Water | 0, 13, 1, 12, 8, 9, 1.555 | Below the minimum, above the maximum, on each limit, a valid value, a second entry the same day, three decimal places |
| Entry dates tried on Water | `D-4`, `D-3`, `D-2`, `D-1`, `D`, `D+1`, empty | Before the start, the start day, inside, today, tomorrow, no date |
| Goal on Reading (min 1, max 100) | target 20, start `D-10`, end `D-5` | A goal that has already ended |

## Steps and expected results

A refused request always shows its message in red under the form, keeps what you typed in the boxes, and stores nothing (the list does not change). Each step says what you should see.

### Part A: template range (Manager M1; FR-05, BR-03)

| Step | Action | Expected result |
|---|---|---|
| A1 | Open the application URL in a browser that has no session (a private window) and log in as **M1** with the credentials from the private handoff. | The Templates page opens (a Manager's first page) with a table (Name, Unit, Range, State, Edit) and a "New" button. Water shows Range `1–12` and Reading `1–100`. |
| A2 | Press "New". In the form type **Name** `UAT-02 Squats`, **Unit** `reps`, **Minimum** `10`, **Maximum** `10`. Press **Save**. | The form stays open and shows **"Minimum must be below maximum."** The four boxes still hold what you typed. |
| A3 | Change **Minimum** to `11` (Maximum stays `10`). Press **Save**. | The same message **"Minimum must be below maximum."** The form stays open. |
| A4 | Change **Minimum** to `10` and **Maximum** to `50`. Press **Save**. | The Templates page opens. The table has a row `UAT-02 Squats`, `reps`, `10–50`, `Active`, and no other row named UAT-02 Squats (steps A2 and A3 stored nothing). |
| A5 | Press "Log out". | The login screen shows again. |

### Part B: goal target and one active goal per template (Participant P2; FR-10, BR-05)

| Step | Action | Expected result |
|---|---|---|
| B1 | Log in as **P2**. | The goals page opens and shows "No goals yet" and a "+ New goal" button. |
| B2 | Press "+ New goal". Choose template **UAT-02 Squats**, type **Daily target** `10`, leave **Start date** as today (`D`), set **End date** to `D+6`. Press **Save**. | The form stays open and shows **"Daily target must be above the template minimum."** (10 is equal to the minimum 10). The unit `reps` is shown next to the target box, and the typed values are kept. |
| B3 | Change **Daily target** to `9`. Press **Save**. | The same message **"Daily target must be above the template minimum."** |
| B4 | Change **Daily target** to `51`. Press **Save**. | **"Daily target must not exceed the template maximum."** (51 is above the maximum 50.) |
| B5 | Change **Daily target** to `50`. Press **Save**. | The goals page opens. It lists one goal: UAT-02 Squats, "Daily target: 50 reps", `D` – `D+6`, **Active**, **"0 of 1 days met"** (the only day so far is `D`). No goal was stored by B2 to B4. |
| B6 | Press "+ New goal" again. Choose **UAT-02 Squats**, **Daily target** `20`, start `D`, end `D+6`. Press **Save**. | The form stays open and shows **"You already have an active goal for this template."** |
| B7 | Press **Cancel**. | The goals page still lists exactly one goal on UAT-02 Squats (target 50). |

### Part C: entry value, date and one entry a day (Participant P2; FR-11, BR-01, BR-03, BR-04)

| Step | Action | Expected result |
|---|---|---|
| C1 | Press "+ New goal". Choose **Water**, **Daily target** `8`, **Start date** `D-3`, **End date** `D+3`. Press **Save**. | The goals page lists a second goal: Water, "Daily target: 8 glasses", `D-3` – `D+3`, **Active**, **"0 of 4 days met"** (days so far `D-3`, `D-2`, `D-1`, `D`), and under it "No entries yet". |
| C2 | In the **Water** goal, set the **Date** box to `D-1`, the **Value (glasses)** box to `0`, press **Save entry**. | **"The value must be between 1 and 12."** The Water goal still shows "No entries yet". The Value box still shows `0`. |
| C3 | Change **Value (glasses)** to `13` (Date stays `D-1`). Press **Save entry**. | The same message **"The value must be between 1 and 12."** Still "No entries yet". |
| C4 | Set **Date** to `D-3` (the start day) and **Value (glasses)** to `1` (the minimum). Press **Save entry**. | The entry list shows "`D-3`: 1 glasses" (the date as `YYYY-MM-DD`). The Value box is empty again. The progress stays **"0 of 4 days met"** (1 is below the target 8). |
| C5 | Set **Date** to `D-2` and **Value (glasses)** to `12` (the maximum). Press **Save entry**. | The list shows "`D-2`: 12 glasses" above "`D-3`: 1 glasses". Progress **"1 of 4 days met"**. |
| C6 | Set **Date** to `D-4` (the day before the start) and **Value (glasses)** to `5`. Press **Save entry**. | **"The date must be inside the goal start and end dates."** The list still has two entries. |
| C7 | Set **Date** to `D+1` (tomorrow), keep **Value** `5`. Press **Save entry**. | **"The date cannot be after today."** The list still has two entries. |
| C8 | Set **Date** to `D` (today) and **Value (glasses)** to `8`. Press **Save entry**. | The list shows "`D`: 8 glasses" at the top. Progress **"2 of 4 days met"** (8 is equal to the target). |
| C9 | Keep **Date** `D` (the box still shows it after C8) and type **Value (glasses)** `9`. Press **Save entry**. | **"An entry already exists for this day."** The list still shows "`D`: 8 glasses" (not 9) and three entries in all. Progress stays **"2 of 4 days met"**. |
| C10 | Set **Date** to `D-1` and **Value (glasses)** to `1.555`. Press **Save entry**. | **"Enter a valid date (YYYY-MM-DD) and a number with at most 2 decimal places."** The list still has three entries. |
| C11 | Clear the **Date** box so it is empty, and type **Value (glasses)** `5`. Press **Save entry**. | The same message **"Enter a valid date (YYYY-MM-DD) and a number with at most 2 decimal places."** The list still has three entries. If your browser cannot leave the date box empty, write "not possible" for this step; that is not a FAIL. |

### Part D: a goal that has ended (Participant P2; BR-01, BR-06)

| Step | Action | Expected result |
|---|---|---|
| D1 | Press "+ New goal". Choose **Reading**, **Daily target** `20`, **Start date** `D-10`, **End date** `D-5`. Press **Save**. | The goals page lists a third goal: Reading, "Daily target: 20 pages", `D-10` – `D-5`, state **Ended** (its end date has passed), **"0 of 6 days met"** (days so far run from `D-10` to the end date `D-5`: 6 days). |
| D2 | In the **Reading** goal, set **Date** to `D-4` (the day after the end) and **Value (pages)** to `20`. Press **Save entry**. | **"The date must be inside the goal start and end dates."** Reading still shows "No entries yet". |
| D3 | Set **Date** to `D-5` (the end day) and keep **Value (pages)** `20`. Press **Save entry**. | The list shows "`D-5`: 20 pages". The state stays **Ended** and the progress becomes **"1 of 6 days met"** (a day inside an ended goal's period can still be recorded). |
| D4 | Reload the page (F5). | All three goals are still listed with the same targets, dates, states and progress: UAT-02 Squats "0 of 1 days met", Water "2 of 4 days met" with three entries, Reading "1 of 6 days met" with one entry. |
| D5 | Press "Log out". | The login screen shows again. |

### Expected-result calculation (Water, after C8 and after the reload)

| Day | Value | Target 8 | Met? |
|---|---|---|---|
| `D-3` | 1 | 8 | No (1 is below 8) |
| `D-2` | 12 | 8 | Yes (12 is above 8) |
| `D-1` | no entry (C2, C3, C10 were refused) | 8 | No |
| `D` | 8 (C9's 9 was refused) | 8 | Yes (8 is equal to 8) |

Days so far (`D-3` to `D`) = **4**. Days met = **2**. Expected text: **"2 of 4 days met"**.

Reading: days so far `D-10` to `D-5` = **6** (the goal ended, so the count stops at the end date). After D3 one day (`D-5`, 20 pages, equal to the target 20) is met: **"1 of 6 days met"**.

## Pass rule

PASS only if every step gives its expected result. A request that should be refused but is saved, a request that should be saved but is refused, a different message, a wrong number or a value that changed after a refused request is FAIL: record the step number and what you saw. If you cannot reach the application or log in, record BLOCKED with the reason (BLOCKED is not a pass).

## Result record (the UAT Team fills this in; do not copy the expected results)

| Field | Entry |
|---|---|
| Tester name and team | |
| Date and time | |
| Tested version (revision or tag shown in the handoff) | |
| Real dates used for `D-10`, `D-5`, `D-4`, `D-3`, `D`, `D+1`, `D+3`, `D+6` | |
| Actual result per step | |
| PASS / FAIL / BLOCKED | |
| Evidence IDs (screenshots) | |
| Issue ID if FAIL | |

## Cleanup and sequence

After this case the template UAT-02 Squats exists (a template cannot be deleted in Sprint 1, and it cannot be edited now that a goal uses it), and P2 has three goals. Before you run UAT-02 again, the Product Team resets the data as the handoff says (Issue #103). UAT-02 uses only M1 and P2, so it does not depend on UAT-01 (P1).
