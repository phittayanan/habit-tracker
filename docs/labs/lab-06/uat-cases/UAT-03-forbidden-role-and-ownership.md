# UAT-03 Forbidden role and ownership: private goals, Manager and anonymous refusals

Lab 6 Part A, Issue #101. Sprint 1 scope only. This case is written for the UAT Team (the partner team). A tester needs no verbal explanation: every step has an exact expected result, and every message is quoted as the screen or the API shows it. The Product Team's version, URL and account labels are in the handoff package (Issue #103); no password appears here.

| Field | Value |
|---|---|
| Case ID | UAT-03 |
| Category | Forbidden role and ownership |
| Requirements | FR-13, FR-14, FR-22, FR-23; BR-09, BR-10; NFR-02, NFR-03 |
| Acceptance criteria | AC-02.2, AC-02.3, AC-02.4, AC-02.5, AC-04.7, AC-06.2, AC-06.3, AC-10.1, AC-10.2, AC-10.3, AC-10.4, AC-10.5, AC-10.6, AC-10.7 (contracts: `docs/sprints/sprint-1/F-02-roles.md`, `F-04-template-edit.md`, `F-06-template-view.md`, `F-10-privacy.md`) |
| Purpose | Show that a Participant cannot see or change another Participant's goals and entries (and cannot give a goal to another user), that a Manager is refused every goal and entry operation, that a Participant cannot create or edit a template, and that an anonymous caller gets nothing. For every refusal, show that the protected data did not change and was not disclosed. |
| Roles | Participants **P1** and **P2**, Manager **M1**, and an anonymous visitor |
| Test type | Manual, in the browser. Some steps send one request from the browser console (F12, Console tab) because the screens do not offer the forbidden action; the exact text to paste is given. |

## Preconditions

1. The deployed release and URL are the ones named in the handoff; write the version you see into the result table.
2. Template **Walking** exists and is active: unit `steps`, minimum 0, maximum 20000. The demo data seeds it (`SEED_DEMO_DATA=true`, `docs/labs/lab-05/deployment.md`); the handoff package (Issue #103) states whether the deployed database has it. If it is missing, record BLOCKED and tell the Product Team.
3. Account **P2** has **no goal on Walking**, and **P1** has none either. No template is named **UAT-03 Probe**. If this is a second run, the Product Team resets the data as the handoff says before you start.
4. Today is `D`, the date in Asia/Bangkok. Write the real date in the result table; for example, if `D` is 2026-11-20, then `D+6` is 2026-11-26.
5. Run the parts in order S, A, B, C, D in one sitting, and **finish before 24:00 Asia/Bangkok on day `D`**: after midnight the progress text of P2's goal becomes "1 of 2 days met", which is correct behaviour but no longer the expected text. This case uses its own data (the Walking goal of P2) and does not depend on UAT-01 or UAT-02, but it can run after them.
6. **Console helper.** In steps that say "Console", press F12, open the Console tab, and paste the helper below, then press Enter. The first time, the browser may ask you to type `allow pasting` before it accepts a paste. Every call prints `<status> <body>`.

```js
var call = async (method, path, body) => { const r = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }); return r.status + ' ' + (await r.text()); };
var D = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
```

   Replace `<G>` and `<P2>` in the steps below by the numbers you read in step S4. A reload clears the helper, so paste it again after any reload (pasting it twice on the same page is harmless).

## Synthetic inputs

| Item | Value |
|---|---|
| P2's goal (Part S) | template Walking, daily target 5000 steps, start `D`, end `D+6` |
| P2's entry (Part S) | date `D`, value 6000 |
| Attempted entry by P1 and by M1 | date `D`, value 1 |
| Attempted template by P1 | name `UAT-03 Probe`, unit `x`, minimum 1, maximum 5 |
| An id that does not exist | 999999 |

## Steps and expected results

### Part S: set up P2's private goal (Participant P2)

| Step | Action | Expected result |
|---|---|---|
| S1 | Open the application URL in a browser that has no session (a private window) and log in as **P2** with the credentials from the private handoff. | The goals page opens. |
| S2 | Press "+ New goal". Choose **Walking**, **Daily target** `5000`, **Start date** `D` (the default), **End date** `D+6`. Press **Save**. | The goals page lists a goal: Walking, "Daily target: 5000 steps", `D` – `D+6`, **Active**, **"0 of 1 days met"**. |
| S3 | In the Walking goal, leave **Date** as `D`, type **Value (steps)** `6000`, press **Save entry**. | The entry list shows "`D`: 6000 steps". Progress **"1 of 1 days met"**. |
| S4 | Open the Console, paste the helper, then paste `(await (await fetch('/api/goals')).json()).goals.filter(g => g.template.name === 'Walking').map(g => g.id)` and press Enter. Then run `(await (await fetch('/api/auth/me')).json()).user.id` and press Enter. | The first command prints one number in square brackets, for example `[17]`: write it down as `<G>`. The second prints one number, for example `3`: it is the id of P2; write it down as `<P2>`. |
| S5 | Press "Log out". | The login screen shows again. |

### Part A: another Participant cannot see or change P2's records (Participant P1)

| Step | Action | Expected result |
|---|---|---|
| A1 | Log in as **P1**. | The goals page opens. |
| A2 | Read the whole goals page. | There is no goal named Walking, no text "Daily target: 5000 steps" and no "6000 steps". (If UAT-01 has run, only P1's own Water goal is listed; otherwise the page says "No goals yet".) |
| A3 | Open the Console, paste the helper, then run `await call('GET', '/api/goals')`. | The printed text starts with `200 ` and its goals do not contain a Walking goal and no goal with the number `<G>`. |
| A4 | Run `await call('GET', '/api/goals/<G>/entries')`. | `404 {"error":{"code":"GOAL_NOT_FOUND","message":"Goal not found."}}` (no entry of P2 is shown). |
| A5 | Run `await call('POST', '/api/goals/<G>/entries', { entryDate: D, value: 1 })`. | `404 {"error":{"code":"GOAL_NOT_FOUND","message":"Goal not found."}}` |
| A6 | Run `await call('GET', '/api/goals/999999/entries')`, then `await call('POST', '/api/goals/999999/entries', { entryDate: D, value: 1 })`. | Both print exactly the same text as A4 and A5: `404 {"error":{"code":"GOAL_NOT_FOUND","message":"Goal not found."}}`. A request for P2's goal and a request for a goal that does not exist cannot be told apart. |
| A7 | Replace `<P2>` by the number from S4 and run `var T = (await (await fetch('/api/templates')).json()).templates.find(t => t.name === 'Walking').id;` and then `await call('POST', '/api/goals', { templateId: T, dailyTarget: 5000, startDate: D, endDate: D, participantId: <P2> })`. (The id of P2 in the body must be ignored; the goal must belong to the caller, P1. Start and end are both `D`: a one-day goal.) | The printed text starts with `201 ` and holds a goal with `"templateId"` equal to `T`. The request was accepted and the extra field `participantId` was ignored. |
| A8 | Reload the page (F5) and read the goals page. | The goals page of **P1** now lists a Walking goal ("Daily target: 5000 steps", `D` – `D`, Active). It is P1's own goal: the id sent in the body did not give the goal to another user. |
| A9 | Press "Log out". Log in as **P2**. Look at the Walking goal. | The entry list still shows only "`D`: 6000 steps" (P1's attempted value 1 was not stored), progress **"1 of 1 days met"**, and the page lists exactly the goals P2 made (no second Walking goal). |
| A10 | Press "Log out". | The login screen shows again. |

### Part B: a Participant cannot create or edit a template (Participant P1; AC-06.3, AC-04.7)

| Step | Action | Expected result |
|---|---|---|
| B1 | Log in as **P1** and open "Templates" in the menu. | A read-only table with the columns Name, Unit and Range (`min–max`) lists the active templates, for example Walking `0–20000`. There is no "New" button, no Edit column and no State column. |
| B2 | In the browser address bar change the page address to `/templates/new` and press Enter (the same address as the application, with `/templates/new` at the end). | The top bar is still shown and the page says **"This page is not available for your role."** There is no template form. |
| B3 | Open the Console, paste the helper, then run `await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Role': 'MANAGER' }, body: JSON.stringify({ name: 'UAT-03 Probe', unit: 'x', minValue: 1, maxValue: 5, role: 'MANAGER' }) }).then(async r => r.status + ' ' + await r.text())`. | `403 {"error":{"code":"FORBIDDEN","message":"You do not have permission to do this."}}` (the `role` field and the `X-Role` header changed nothing). |
| B4 | Open the Console, paste the helper, then run `var W = (await (await fetch('/api/templates')).json()).templates.find(t => t.name === 'Walking').id; W` . | The id of the Walking template is printed (a number). Write it down. |
| B5 | In the browser address bar change the page address to `/templates/<W>/edit` (the application address with `/templates/` , the number `W` and `/edit` at the end) and press Enter. | The top bar is still shown and the page says **"This page is not available for your role."** There is no edit form. |
| B6 | Open the Console, paste the helper, then run `await call('PATCH', '/api/templates/' + W, { maxValue: 12 })` and `await call('PATCH', '/api/templates/999999', { maxValue: 12 })`. | Both print `403 {"error":{"code":"FORBIDDEN","message":"You do not have permission to do this."}}` (an existing and an unknown id get the same answer: the role is refused before the id is looked at). |
| B7 | Open "Templates" again (reload the page). | The table has no row named `UAT-03 Probe`, and Walking still shows the range `0–20000` (the edit was not applied). |
| B8 | Press "Log out". | The login screen shows again. |

### Part C: a Manager is refused every goal and entry operation (Manager M1)

| Step | Action | Expected result |
|---|---|---|
| C1 | Log in as **M1**. | The Templates page opens (a Manager's first page). The menu has "Templates" only; there is no "Goals" item. The table has no row named `UAT-03 Probe`. |
| C2 | In the browser address bar change the page address to `/goals` and press Enter. | The top bar is still shown and the page says **"This page is not available for your role."** No goal of P1 or P2 is shown. |
| C3 | Open the Console, paste the helper, then run `await call('GET', '/api/goals')`. | `403 {"error":{"code":"FORBIDDEN","message":"You do not have permission to do this."}}` (no goal list). |
| C4 | Run `await call('POST', '/api/goals', {})`. | The same `403 {"error":{"code":"FORBIDDEN","message":"You do not have permission to do this."}}` (the role is refused before the empty body is checked, so it is not a 400). |
| C5 | Run `await call('GET', '/api/goals/<G>/entries')`, then `await call('POST', '/api/goals/<G>/entries', { entryDate: D, value: 1 })`. | Both print the same `403 {"error":{"code":"FORBIDDEN","message":"You do not have permission to do this."}}`. This is 403, not 404: a Manager is refused by role and is not told whether the goal exists. |
| C6 | Press "Log out". Log in as **P2** and look at the Walking goal. | The entry list still shows only "`D`: 6000 steps" and progress **"1 of 1 days met"**. Press "Log out". |

### Part D: an anonymous visitor gets nothing

| Step | Action | Expected result |
|---|---|---|
| D1 | In a private window with no session, open the application address followed by `/goals`. | The login screen shows (no goals page and no data). |
| D2 | Open the Console, paste the helper, then run `await call('GET', '/api/goals')`. | `401 {"error":{"code":"UNAUTHENTICATED","message":"Please log in."}}` |
| D3 | Run `await call('POST', '/api/goals/<G>/entries', { entryDate: D, value: 1 })`. | The same `401 {"error":{"code":"UNAUTHENTICATED","message":"Please log in."}}` (not 404: the session is checked first). |
| D4 | Run `await call('GET', '/api/templates')`. | The same 401 text. |
| D5 | Log in as **P2** and look at the Walking goal. | The entry list still shows only "`D`: 6000 steps". Press "Log out". |

## Pass rule

PASS only if every step gives its expected result: each forbidden request is refused with the status and message shown, no refused request stores anything (checked in A9, B7, C6 and D5; A7 is the one request that is accepted), and no refusal shows data of another account. A refused request that succeeds, a different status (for example 403 where 404 is expected), a goal of P2 visible to P1, to M1 or to an anonymous visitor, or an entry of 1 stored on P2's goal is FAIL: record the step number and what you saw. If you cannot reach the application or log in, record BLOCKED with the reason (BLOCKED is not a pass). If your browser blocks the console, record BLOCKED for the console steps and tell the Product Team; do not mark them PASS.

## Result record (the UAT Team fills this in; do not copy the expected results)

| Field | Entry |
|---|---|
| Tester name and team | |
| Date and time | |
| Tested version (revision or tag shown in the handoff) | |
| Real date used for `D`, the number `<G>` and the number `<P2>` | |
| Actual result per step (for each console step, paste the printed text) | |
| PASS / FAIL / BLOCKED | |
| Evidence IDs (screenshots, console output) | |
| Issue ID if FAIL | |

## Cleanup and sequence

After this case P2 has an active Walking goal with one entry (6000), and P1 has one Walking goal (made in A7); the refused requests stored no template and no entry. Before you run UAT-03 again, the Product Team resets the Walking goals of P1 and P2 as the handoff says (Issue #103). UAT-03 does not depend on UAT-01 or UAT-02.
