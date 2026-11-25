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
| Template names used | `UAT-<case id>-<initials>` as the handoff asks; initials used: _(fill in)_ |
| Test session date (Asia/Bangkok) | _(date)_ |
| Testers (UAT Team) | phittayanan, projectnewy |
| Pairing | _(who clicked and who recorded in each half of the session)_ |

## Results

One row per case; list the step numbers inside "Actual result" (for example "1: … 2: …"). Steps the handoff marks *optional* (UAT-04 step 4, UAT-05 step 5, the browser-console API checks) are recorded as run or "not run" with the reason. If an expected result in the handoff looks wrong or unclear, record "case unclear" with the reason instead of FAIL. PASS/FAIL/BLOCKED: BLOCKED is not a pass and needs a reason. For a rejected operation, the actual result states both the rejection seen and the check that the protected data was not changed or disclosed.

| Case ID | Tester name / team | Date and time | Tested version | Inputs | Actual result | PASS / FAIL / BLOCKED (+ reason) | Evidence ID |
|---|---|---|---|---|---|---|---|
| UAT-04 | | | | | | | |
| UAT-05 | | | | | | | |
| UAT-06 | | | | | | | |

## Evidence register

Evidence IDs in this half are `E-B2-01`, `E-B2-02`, …; the first half (#105) uses `E-B1-xx` (announced by phittayanan in the #105 and #106 comments, 2026-11-25; projectnewy has not replied yet). Sheet §4.2 (p.6): each screenshot or log excerpt has an ID, the action, expected and actual result, the time and the tested revision. Screenshots are stored next to this file in `evidence/`, named `E-B2-xx-<case-id>-<short-action>.png`.

| Evidence ID | Case ID | Action | Expected (from partner case) | Actual (observed) | Protected-state check (rejected operations) | Time | Tested revision | File |
|---|---|---|---|---|---|---|---|---|
| E-B2-xx | | | | | | | | |
