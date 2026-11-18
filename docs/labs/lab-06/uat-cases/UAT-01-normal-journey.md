# UAT-01 Normal journey: a Participant sets a goal, records days and sees progress

Lab 6 Part A, Issue #99. Sprint 1 scope only. This case is written for the UAT Team (the partner team). A tester needs no verbal explanation: every step has an exact expected result. The Product Team's version, URL and account labels are in the handoff package (Issue #103); no password appears here.

| Field | Value |
|---|---|
| Case ID | UAT-01 |
| Category | Normal domain journey |
| Requirements | FR-01, FR-02, FR-10, FR-11, FR-12; BR-01, BR-05, BR-07 |
| Acceptance criteria | AC-01.10, AC-07.1, AC-07.9, AC-08.1, AC-08.4, AC-09.1, AC-09.2, AC-09.6, AC-09.7 (contracts: `docs/sprints/sprint-1/F-01-login.md`, `F-07-goal.md`, `F-08-entry.md`, `F-09-progress.md`) |
| Purpose | Show that a Participant can log in, create a goal on a template, record daily values and read correct "days met" progress that survives a reload. |
| Role | Participant, account label **P1** (a Participant that has no goal on template "Water") |
| Test type | Manual, in the browser |

## Preconditions

1. The deployed release and URL are the ones named in the handoff; write the version you see into the result table.
2. Template **Water** exists and is active: unit `glasses`, minimum 1, maximum 12.
3. Account **P1** has **no goal on Water** (rule BR-05: one active goal per template; a second one would be refused). If P1 already has one, reset the data as the handoff says before you start.
4. Today is `D`, the date in Asia/Bangkok (the rule is the same whatever the tester's browser time zone). Write the real dates in the result table, for example, if `D` is 2026-11-20 then `D-2` is 2026-11-18 and `D+27` is 2026-12-17.

## Synthetic inputs

| Item | Value |
|---|---|
| Template | Water (glasses, minimum 1, maximum 12) |
| Daily target | 8 (above the minimum 1 and not above the maximum 12) |
| Goal period | start `D-2`, end `D+27` |
| Entry 1 | date `D-2`, value 8 |
| Entry 2 | date `D-1`, value 6 |
| Entry 3 | date `D` (today), value 10 |

## Steps and expected results

| Step | Action | Expected result |
|---|---|---|
| 1 | Open the application URL in a browser that has no session (a private window). | The login screen shows a username box, a masked password box and a "Log in" button. There is no sign-up and no "forgot password" link. |
| 2 | Log in as **P1** with the credentials from the private handoff. | The goals page opens (a Participant's first page). The top bar has the menu items "Goals" and "Templates" and a "Log out" control. With no goals, the page shows "No goals yet" and a visible "+ New goal" button. |
| 3 | Press "+ New goal". | A form shows a template dropdown (Water is in the list), a daily target box, a start date (default: today, `D`), an end date and a Save button. |
| 4 | Choose Water. | The unit `glasses` is shown next to the target box. |
| 5 | Enter target **8**, start date **`D-2`**, end date **`D+27`**. Press Save. | The form accepts it (no error message). The goals page lists one goal: Water, target 8 glasses, the two dates, state **Active**, and the text **"0 of 3 days met"** (the days so far are `D-2`, `D-1` and `D`, and there are no entries yet). |
| 6 | In the Water row, set the date box to `D-2`, the number box to **8**, press Save. | The page shows the entry "8 glasses" for `D-2`. The progress text becomes **"1 of 3 days met"** (8 reaches the target 8). |
| 7 | Set the date box to `D-1`, the number box to **6**, press Save. | The page shows the entry "6 glasses" for `D-1`. The progress text stays **"1 of 3 days met"** (6 is below the target 8, but the day still counts in the 3). |
| 8 | Set the date box to `D` (it should already be today's date), the number box to **10**, press Save. | The page shows the entry "10 glasses" for `D`. The progress text becomes **"2 of 3 days met"** (10 is above 8). |
| 9 | Reload the page (F5). | The goal, the three entries (8, 6 and 10 glasses, on `D-2`, `D-1` and `D`) and the text **"2 of 3 days met"** are all still there. |
| 10 | Press "Log out". | The login screen shows again. Pressing the browser's Back button does not show the goals page with data (the session is gone; a protected page sends you back to the login screen). |

### Expected-result calculation (days met)

| Day | Value | Target | Met? |
|---|---|---|---|
| `D-2` | 8 | 8 | Yes (8 is equal to the target) |
| `D-1` | 6 | 8 | No (6 is below the target) |
| `D` | 10 | 8 | Yes (10 is above the target) |

Days so far (`D-2`, `D-1`, `D`) = **3**. Days met = **2**. Expected text after step 8 and after the reload: **"2 of 3 days met"**.

## Pass rule

PASS only if every step gives its expected result. Any wrong message, wrong number, missing entry or missing data after the reload is FAIL: record the step number and what you saw. If you cannot reach the application or log in, record BLOCKED with the reason (BLOCKED is not a pass).

## Result record (the UAT Team fills this in; do not copy the expected results)

| Field | Entry |
|---|---|
| Tester name and team | |
| Date and time | |
| Tested version (revision or tag shown in the handoff) | |
| Real dates used for `D-2`, `D-1`, `D`, `D+27` | |
| Actual result per step | |
| PASS / FAIL / BLOCKED | |
| Evidence IDs (screenshots) | |
| Issue ID if FAIL | |

## Cleanup and sequence

After this case P1 has an active goal on Water. Run UAT-01 first with P1, or reset P1's data (handoff package, Issue #103) before you run it again. The other cases (UAT-02, UAT-03, UAT-04) say which accounts and data they use.
