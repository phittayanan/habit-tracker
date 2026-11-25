# Partner UAT, second half: forbidden role/ownership and state/persistence

Lab 6 Part B (sheet §3.2, p.3), Issue #106. Our team is the **UAT Team**; the partner team is the **Product Team**. The first half (normal and boundary cases) is Issue #105.

Every value below comes from what the testers saw in the browser. The agent did not run these cases. Expected results stay in the partner's case files; the "Actual result" column holds only what was observed. Credentials are never written here.

## Tested release (from the partner team's handoff)

| Field | Value |
|---|---|
| Product Team | Team "Habit and Activity Tracker" (GitHub: asamapornch, warunwora) |
| Handoff reference | "Lab 6 – Exchange 1: UAT package", version 1.0, dated 23 Nov 2026, received 2026-11-25 (not committed here) |
| Product repository | https://github.com/asamapornch/habit-activity-tracker |
| Deployed URL | https://s65da36e2-4d7hbszvwq-as.a.run.app |
| Release tag | `v1.0-sprint1` (Sprint 1 features F-01 to F-05) |
| Version under test | `main` at commit `0619c07db872a5bf1c7946301b4bfc40e9e477d2` (handoff: later commits add only Docker, CI and deployment files) |
| Deployed revision | Cloud Run `s65da36e2-00009-b4s` (handoff); revision seen on the day: _(testers fill in, or "not shown by the app")_ |
| Cases in this half | UAT-04 Forbidden role, UAT-05 Ownership and privacy, UAT-06 Session, logout and persistence. The first half (#105) runs UAT-01 to UAT-03. Handoff order: UAT-01 first, UAT-06 last; UAT-06 needs data from UAT-01 or UAT-05. |
| Accounts | MANAGER, P1, P2 (labels from the handoff; passwords sent privately to the testers, never written here) |
| Template names used | `UAT-<case id>-<initials>` as the handoff asks; phittayanan's initials are `PT`. UAT-04 used `UAT-04-PP` by mistake: the AI assistant suggested `PP` from the existing `UAT-01-PP`; not recreated because the partner's system cannot delete data, and the name does not affect the result. UAT-05 and UAT-06 use `PT`. |
| Test session date (Asia/Bangkok) | _(date)_ |
| Testers (UAT Team) | phittayanan, projectnewy |
| Pairing | _(who clicked and who recorded in each half of the session)_ |

## Results

One row per case; list the step numbers inside "Actual result" (for example "1: … 2: …"). Steps the handoff marks *optional* (UAT-04 step 4, UAT-05 step 5, the browser-console API checks) are recorded as run or "not run" with the reason. If an expected result in the handoff looks wrong or unclear, record "case unclear" with the reason instead of FAIL. PASS/FAIL/BLOCKED: BLOCKED is not a pass and needs a reason. For a rejected operation, the actual result states both the rejection seen and the check that the protected data was not changed or disclosed.

| Case ID | Tester name / team | Date and time | Tested version | Inputs | Actual result | PASS / FAIL / BLOCKED (+ reason) | Evidence ID |
|---|---|---|---|---|---|---|---|
| UAT-04 | phittayanan (UAT Team; ran the steps and took the screenshots); second tester: _(to confirm)_ | 2026-11-25, about 13:25–13:41 Asia/Bangkok (from the evidence capture times) | Handoff revision `s65da36e2-00009-b4s`; no version text on the captured screens | Accounts P1, MANAGER, no session. Template `UAT-04-PP`, unit `times`, min 0, max 10, then max edited to 20. Step 4a body: name `UAT-04-PP-probe`, unit `u`, min 0, max 1 | 1: as P1, Templates listed with no Create template form and no Edit buttons; a Goals section with a Create goal form. 2: as MANAGER, Create template form and an Edit button on each template; no Goals section. 3: after Save and reload, `UAT-04-PP` shows `times · 0–20`, name and unit unchanged. 4a: as P1, `POST /templates` returned 403 (Forbidden). 4b: MANAGER's template list still has the same 3 templates, no `UAT-04-PP-probe`. 4c: as MANAGER, `GET /goals` returned 403 (Forbidden). 4d: after logout, `GET /goals` returned 401 (Unauthorized). | PASS (decided by phittayanan) | E-B2-01 to E-B2-07 |
| UAT-05 | | | | | | | |
| UAT-06 | | | | | | | |

## Evidence register

Evidence IDs in this half are `E-B2-01`, `E-B2-02`, …; the first half (#105) uses `E-B1-xx` (announced by phittayanan in the #105 and #106 comments, 2026-11-25; projectnewy has not replied yet). Sheet §4.2 (p.6): each screenshot or log excerpt has an ID, the action, expected and actual result, the time and the tested revision. Screenshots are stored next to this file in `evidence/`, named `E-B2-xx-<case-id>-<short-action>.png`.

| Evidence ID | Case ID | Action | Expected (from partner case) | Actual (observed) | Protected-state check (rejected operations) | Time | Tested revision | File |
|---|---|---|---|---|---|---|---|---|
| E-B2-01 | UAT-04 | Step 1: log in as P1, look at the page | Templates read-only (no Create template form, no Edit), Goals visible | Signed in as `participant1@example.com` (Participant); 3 templates, no Create template form, no Edit; Goals section with Create goal | n/a | 2026-11-25 ~13:33 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-01-UAT-04-p1-sections.webp` |
| E-B2-02 | UAT-04 | Step 2: log in as MANAGER, look at the page | Create template and Edit visible, no Goals section | Signed in as `manager@example.com` (Manager); Create template form, Edit on each template; no Goals section | n/a | 2026-11-25 ~13:30 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-02-UAT-04-manager-sections.webp` |
| E-B2-03 | UAT-04 | Step 3: MANAGER edits `UAT-04-PP` max 10 → 20, saves, reloads | New max shown after reload; name and unit unchanged | `UAT-04-PP · times · 0–20`. That the page was reloaded is the tester's statement, not visible in the image | n/a | 2026-11-25 ~13:31 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-03-UAT-04-manager-edit-max-after-reload.webp` |
| E-B2-04 | UAT-04 | Step 4a: as P1, `POST /templates` from the browser console | 403, no template created | `POST …/templates 403 (Forbidden)`. Account P1 per the tester; not visible in the image | See E-B2-06 | 2026-11-25 ~13:36 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-04-UAT-04-p1-post-templates-403.png` |
| E-B2-05 | UAT-04 | Step 4c: as MANAGER, `GET /goals` from the console | 403 | Command `fetch('/goals', …)` and `GET …/goals 403 (Forbidden)`. Account MANAGER per the tester; not visible in the image | n/a | 2026-11-25 ~13:38 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-05-UAT-04-manager-get-goals-403.png` |
| E-B2-06 | UAT-04 | Step 4b: after 4a, MANAGER looks at the template list | No `UAT-04-PP-probe` | Signed in as Manager; the list has the same 3 templates (Persistence test, UAT-01-PP, UAT-04-PP); no probe template | Protected state unchanged: the rejected create left no template | 2026-11-25 ~13:39 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-06-UAT-04-manager-list-no-probe.webp` |
| E-B2-07 | UAT-04 | Step 4d: after logout, `GET /goals` from the console | 401 | `GET …/goals 401 (Unauthorized)`. Logged-out state per the tester; not visible in the image | n/a | 2026-11-25 ~13:41 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2-07-UAT-04-no-session-get-goals-401.png` |

## Observations (not findings)

- A template and a P1 goal named "Persistence test" (`times`, 0–10; goal 2026-11-17 → 2026-11-24) existed before our cases. They match no UAT case; the handoff says data may be left by a previous tester.
- Times in the evidence register are approximate (when the screenshot reached the record), Asia/Bangkok.
