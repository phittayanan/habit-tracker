# Lab 6 reset and release runbook (Product Team only)

Lab 6 Part A, Issue #103 (moved out of `handoff.md` in the review of PR #118). Not for the UAT Team: it holds the delete on the live database. No password, token or student ID. Run by the owner of the GCP project (Issue #104, ADR 0060).

## 1. What a reset removes

A reset is for all four cases together, not per case. The script removes **every goal and entry of `participant1` and `participant2`** and **every template whose name starts with `UAT-`** (the cases create `UAT-02 Squats` and `UAT-04 Stretch`; `UAT-03 Probe` and `UAT-04 Stretch 2` exist only if a refused request wrongly succeeded, UAT-03 B3 and UAT-04 F2). It keeps all users, sessions and other templates. The script stops, and deletes nothing once rolled back, if another account still has a goal on a `UAT-` template. If a UAT Team wants to run one case again, the leftovers of the other cases go too; say so in the agreed channel.

**Done once, 2026-11-20 (owner's report, `release-check.md`).** The live database held a goal "Reading" (2026-11-13 to 2026-11-26) with one entry from Lab 5 (`docs/labs/lab-05/deployment.md` section 6.7). The reset removed one goal and one entry of `participant1`; whether that was the Lab 5 record is not confirmed. For a later reset, the same risk applies to any goal of P1 or P2 that is not UAT data: ask before you run it.

## 2. Reset script

The reset procedure is in `docs/labs/lab-06/uat-reset.md`, with the script `docs/labs/lab-06/reset/uat-reset.sql` (ADR 0059, Issue #104, merged in PR #119). This runbook does not repeat the SQL, so there is one script for the delete on the live database. **Before every reset, create an on-demand Cloud SQL backup** and write down its name and time. The script runs in one transaction and ends without `COMMIT`: the owner reads the before and after counts and types `COMMIT;` or `ROLLBACK;`. If `uat-reset.md` and section 1 above disagree, `uat-reset.md` and its script decide.

**For each reset record:** the backup name and time, the time of the reset, the before and after count lines, and the method used to reach the database (Cloud SQL instance `habit-tracker-pg`, database `habit_tracker`). The first reset (2026-11-20) has the backup time and the after counts only; the backup name, reset time and before counts were not recorded (`release-check.md`).

Before the UAT Team starts, the Product Team also confirms: the deployed `build` text matches section 1 of `handoff.md`; `GET /api/health` and `GET /api/ready` answer; each of `manager1`, `participant1`, `participant2` can log in with the password that was sent privately; the credentials were sent only through the private course handoff. Before any redeploy, tell the UAT Team in the agreed channel.
