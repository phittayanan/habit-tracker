# Lab 6 UAT handoff package (Product Team to UAT Team)

Lab 6 Part A, Issue #103. This file is what the partner team (the UAT Team) needs to run our Sprint 1 UAT cases without a verbal explanation. It holds **no password, token or student ID**: credentials go through the private course handoff only. Items marked **TO FILL (#104)** are facts that only the check on the deployed app (Issue #104) can confirm; this file does not guess them. This file is for the UAT Team. The Product Team's reset and release checks are in `reset-runbook.md`, which the UAT Team does not need.

Product: habit tracker (a Program Manager defines habit templates, a Participant sets daily goals and records daily values, and sees days met). Repository: <https://github.com/phittayanan/habit-tracker> (public).

## 1. Version under test

Acceptance applies only to the release written in this table, and only to the Sprint 1 scope in section 3.

| Item | Value |
|---|---|
| Sprint 1 baseline release | tag `v1.0`, commit `64831f7`, 2026-11-10 (the first Sprint 1 release on `main`) |
| Version under test | **TO FILL (#104)**. The cases need the goal-target rule of ADR 0054 (a target equal to the template minimum is refused; UAT-02 expects it), which is in tag `v1.3`, commit `50f5605d266d881b4afba3f8ac96d40882f26fd2` (2026-11-14), and not in `v1.0`. Proposed: `v1.3`, if #104 finds that the deployed revision is that commit. |
| Deployed Cloud Run revision | **TO FILL (#104)**. Last recorded in `docs/labs/lab-05/deployment.md` section 6.8: revision `habit-tracker-00006-nj6`, page shows `build 50f5605`. |
| How you read the version | The login page and the top bar show `build <first 7 characters of the commit>`. Write what you see in your result record. If it differs from the row above, stop and ask the Product Team. |
| Sprint 1 contract | The documents in `docs/sprints/sprint-1/` (F-01 to F-04, F-06 to F-10) at the version-under-test commit, with `docs/srs.md` and the ADRs. |
| Changes during testing | The Product Team tells you **before** it deploys anything that could affect your testing. A deployment changes the version; your acceptance then names the version you actually tested. |

## 2. Address

Application URL: <https://habit-tracker-rfi4eg2u4q-as.a.run.app> (public Cloud Run service, region `asia-southeast1`). The service scales to zero, so the first request after a quiet period can take a few seconds; wait and reload before you record a failure. Use a current Chrome (the browser the repository's own browser tests use). UAT-03 needs the browser console (F12).

## 3. Scope accepted for test (Sprint 1 only)

| Feature | What a user can do |
|---|---|
| F-01 Login, logout, session | A seeded user logs in and out and the app knows who they are. No self-registration, no password recovery. |
| F-02 Role layout and endpoint protection | Manager and Participant menus differ; the wrong role gets a refusal; no session gets 401. |
| F-03 Template creation and Manager list | A Manager creates a template (name, unit, minimum, maximum) and sees the template table. |
| F-04 Template edit | A Manager edits a template only while no goal uses it. |
| F-06 Participant template view | A Participant sees the active templates read-only and cannot create or edit. |
| F-07 Goal creation | A Participant creates a goal on a template (daily target, start and end date); one active goal per template; Active or Ended follows the dates. |
| F-08 Daily entry recording | A Participant records one value per day; date, range and one-per-day rules are enforced. |
| F-09 Progress | A Participant sees "N of M days met" for each goal. |
| F-10 Participant data privacy | A Participant sees only their own goals and entries; a Manager and another Participant are refused. |

**Out of scope (Sprint 2 and 3, not accepted, not defects if missing):** retiring a template (F-05), the month calendar and its side panel, calendar day colours, editing or deleting an entry, changing a goal's target, List history, streaks, stored reminders. The Templates table has no Retire button, and the goals page is a plain list: that is the Sprint 1 design.

## 4. Accounts

Seeded accounts only. The account names are open (SRS A-9); the **passwords are sent privately** by the Product Team and never written here.

| Label | Role | Account name | Used by |
|---|---|---|---|
| M1 | Manager (Program Manager) | `manager1` | UAT-02, UAT-03, UAT-04 |
| P1 | Participant | `participant1` | UAT-01, UAT-03, UAT-04 |
| P2 | Participant | `participant2` | UAT-02, UAT-03 |

All data you create is synthetic. Do not enter real personal data. Do not use any account other than these three.

## 5. Data at the start

| Data | State before the first case |
|---|---|
| Templates (demo data) | Water: `glasses`, 1 to 12. Reading: `pages`, 1 to 100. Walking: `steps`, 0 to 20000. **TO FILL (#104):** confirm the deployed database has these three (the migration job seeds them with `SEED_DEMO_DATA=true`). If one is missing, record BLOCKED for the cases that need it (table in section 6) and tell the Product Team. |
| Goals and entries | Expected: none for P1 and P2. **TO FILL (#104):** check the live database. `docs/labs/lab-05/deployment.md` section 6.7 records a Reading goal (to 2026-11-26) with one entry made by a demo participant; if it belongs to P1 or P2, the cases that expect no goals (UAT-02 precondition 4) will not match until the Product Team resolves it. |
| Other templates | None named `UAT-02 Squats`, `UAT-03 Probe` or `UAT-04 Stretch`. |

## 6. The cases, their order and their data

Each case file has its own preconditions, numbered steps with exact expected results, a pass rule and an empty result record. Do not copy expected results into your actual results.

| Case | File | Category | Accounts | Needs | Leaves behind |
|---|---|---|---|---|---|
| UAT-01 | `uat-cases/UAT-01-normal-journey.md` | Normal journey | P1 | Water | P1: active goal on Water with 3 entries |
| UAT-02 | `uat-cases/UAT-02-business-rules-and-boundaries.md` | Business rule and boundary | M1, P2 | Water, Reading | Template `UAT-02 Squats`; P2: goals on UAT-02 Squats, Water, Reading |
| UAT-03 | `uat-cases/UAT-03-forbidden-role-and-ownership.md` | Forbidden role and ownership | P1, P2, M1, anonymous | Walking | P2: Walking goal with 1 entry; P1: Walking goal |
| UAT-04 | `uat-cases/UAT-04-state-and-persistence.md` | State, history and persistence | M1, P1 | nothing seeded | Template `UAT-04 Stretch` (range 1 to 60); P1: two goals on it |

**Sequence.** The four cases are independent: each makes its own data and none needs another's result. Run them in the order UAT-01, 02, 03, 04. A different order works. Inside one case, run the parts in the written order and in one sitting; **all four cases** use today's date (UAT-01 and UAT-02 count "days met" from days before today up to today, UAT-03 and UAT-04 also), so finish each case **before 24:00 Asia/Bangkok** on the day you start it; a run across midnight gives a false FAIL. (UAT-01 does not say so in its own file; UAT-02 says only that its steps run in one sitting on one date `D`; this sentence applies to both.) Do not run a case twice without a reset (section 7).

## 7. Reset and cleanup

You do not reset the database. A template cannot be deleted in Sprint 1, so a second run of UAT-02 or UAT-04 hits a duplicate name. Between runs, or after a corrected release, ask the Product Team to reset and write which case you want to run again. A reset is for all four cases together: it removes every goal and entry of P1 and P2 and the `UAT-*` templates, and keeps the three accounts and the three demo templates, so the leftovers of the other cases go too. The Product Team confirms when it is done, and you start only after that confirmation.

## 8. Recording results and reporting findings

**Result of a case:** for every case record tester name and team, date and time, tested version (the `build` text), the real dates used, the actual result of each step in your own words, **PASS**, **FAIL** or **BLOCKED** (with the reason; BLOCKED is not a pass), and evidence (a screenshot or the printed console text, with an evidence ID, the action, the time and the version). Both students of your team take part.

**Finding report (for every actual failure):** send one report each with: your Issue ID, product owner (this team), reporter, tested version, the case and step, preconditions and data, the numbered steps to reproduce, the expected result (copied from the case), the actual result, the severity with a reason, and evidence. Say whether you think it is a defect against specified behaviour or a request for a new feature; the Product Team decides and answers with one of: accepted defect, duplicate (with the original's ID), not a defect, enhancement, each with a reason tied to the Sprint 1 contract.

**Channel and answer time:** **TO FILL (#104)** by both teams (an Issue in your own repository linked to ours, or the agreed chat; the Product Team keeps a copy of every report as text). The Product Team answers each report within **TO FILL** hours.

**Severity, by user impact (proposal, the Product Team may adjust it in review):**

| Severity | Meaning | Effect on acceptance |
|---|---|---|
| Critical | A Participant's data is lost, wrong or readable by another account; a forbidden role or anonymous caller can read or change protected data; nobody can log in | Blocks acceptance; must be fixed and retested |
| Major | A required Sprint 1 rule or journey is refused or wrong (for example a valid entry cannot be saved, a wrong days-met number, an invalid value accepted) | Blocks acceptance; must be fixed and retested |
| Minor | A wrong or unclear message or layout that does not change data or block a journey | Fixed, or accepted by you as a documented limitation |

## 9. Rules for testers

- Test only the accepted scope in section 3, on this address, with the three accounts and synthetic data.
- No load or security scanning tools, no attempt to reach other users' real data, no change to the database or the code.
- Keep every credential private. Do not put a password, token or session cookie in a screenshot, a report or a repository.
- The decision (Accepted, Accepted with minor limitations, or Not Accepted) is yours alone, for the version you tested; the Product Team cannot give it.

**Known limits (not defects):** the first request after a quiet period is slow (scale to zero); the Sprint 2 and 3 items in section 3 are absent; a deployment re-sets the three passwords from the secrets and keeps all data (`docs/labs/lab-05/deployment.md` section 6.5).

## 10. Schedule

| Session | Date and time (Asia/Bangkok) |
|---|---|
| First UAT run by the partner team | **TO FILL** |
| Findings answered and corrections released | **TO FILL** |
| Retest and the partner's decision | **TO FILL** |
