# Lab 6 reset and release runbook (Product Team only)

Lab 6 Part A, Issue #103 (moved out of `handoff.md` in the review of PR #118). Not for the UAT Team: it holds the delete on the live database. No password, token or student ID. Run by the owner of the GCP project, as part of Issue #104.

## 1. What a reset removes

A reset is for all four cases together, not per case. It removes **every goal and entry of `participant1` and `participant2`**, and the templates `UAT-02 Squats` and `UAT-04 Stretch`, plus `UAT-03 Probe` and `UAT-04 Stretch 2`, which exist only if a refused request wrongly succeeded (UAT-03 B3, UAT-04 F2). It keeps the three accounts and the demo templates. If a UAT Team wants to run one case again, the leftovers of the other cases go too; say so in the agreed channel.

**Check before the first reset.** `docs/labs/lab-05/deployment.md` section 6.7 records a goal "Reading" (2026-11-13 to 2026-11-26, Active) with one entry, created by "a demo participant" on the live database. If it belongs to `participant1` or `participant2` the DELETE below removes it, and the UAT cases that expect no goals (UAT-02 precondition 4) fail without it. Find its owner first, decide whether to keep that record (Lab 5 evidence) or delete it, and write the decision in the Issue #104 comment.

## 2. Reset SQL

**TO FILL (#104):** the method used to reach the database (Cloud SQL instance `habit-tracker-pg`, database `habit_tracker`), the time, and the row counts before and after. Take or confirm a backup first (daily backup at 03:00 UTC). Read the counts with `SELECT` before any `DELETE`. This SQL has **not** been run yet; #104 runs it first on the live database in a transaction and checks the counts:

```sql
BEGIN;
-- 1. count what will go
SELECT count(*) FROM "Entry" WHERE goal_id IN (SELECT id FROM "Goal" WHERE participant_id IN (SELECT id FROM "User" WHERE username IN ('participant1', 'participant2')));
SELECT count(*) FROM "Goal" WHERE participant_id IN (SELECT id FROM "User" WHERE username IN ('participant1', 'participant2'));
SELECT id, name FROM "Template" WHERE name IN ('UAT-02 Squats', 'UAT-03 Probe', 'UAT-04 Stretch', 'UAT-04 Stretch 2');
-- 2. delete in this order (entries, goals, then the UAT templates)
DELETE FROM "Entry" WHERE goal_id IN (SELECT id FROM "Goal" WHERE participant_id IN (SELECT id FROM "User" WHERE username IN ('participant1', 'participant2')));
DELETE FROM "Goal" WHERE participant_id IN (SELECT id FROM "User" WHERE username IN ('participant1', 'participant2'));
DELETE FROM "Template" WHERE name IN ('UAT-02 Squats', 'UAT-03 Probe', 'UAT-04 Stretch', 'UAT-04 Stretch 2');
-- 3. check: no goal or entry is left, the three demo templates are still there
SELECT name, unit, min_value, max_value FROM "Template" ORDER BY name;
-- COMMIT only if the counts are as expected; otherwise ROLLBACK
```

Before the UAT Team starts, the Product Team also confirms: the deployed `build` text matches section 1 of `handoff.md`; `GET /api/health` and `GET /api/ready` answer; each of `manager1`, `participant1`, `participant2` can log in with the password that was sent privately; the credentials were sent only through the private course handoff. Before any redeploy, tell the UAT Team in the agreed channel.
