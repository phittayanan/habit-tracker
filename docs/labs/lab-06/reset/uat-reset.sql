-- UAT reset (Issue #104, ADR 0059, docs/labs/lab-06/uat-reset.md).
-- Deletes what the Lab 6 UAT cases create: every goal and entry of participant1 and participant2,
-- and every template whose name starts with 'UAT-'. Keeps all users, sessions and other templates.
--
-- A HUMAN runs this on the deployed database, after a Cloud SQL backup, with psql:
--   \set ON_ERROR_STOP on
--   \i uat-reset.sql
-- The script opens a transaction and does NOT end it. Read the two count lines, then type
-- COMMIT;   if "after" shows 0 goals, 0 entries and 0 UAT templates
-- ROLLBACK; if anything looks wrong (nothing is changed)
-- If any statement fails, the transaction is aborted: type ROLLBACK; and tell phittayanan.

BEGIN;

SELECT 'before: ' ||
  (SELECT count(*) FROM "Goal" g JOIN "User" u ON u.id = g.participant_id WHERE u.username IN ('participant1', 'participant2')) || ' goals, ' ||
  (SELECT count(*) FROM "Entry" e JOIN "Goal" g ON g.id = e.goal_id JOIN "User" u ON u.id = g.participant_id WHERE u.username IN ('participant1', 'participant2')) || ' entries, ' ||
  (SELECT count(*) FROM "Template" WHERE name LIKE 'UAT-%') || ' UAT templates, ' ||
  (SELECT count(*) FROM "User") || ' users, ' ||
  (SELECT count(*) FROM "Template") || ' templates in all' AS counts;

-- Delete entries before goals and goals before templates because both foreign keys use ON DELETE RESTRICT.
DELETE FROM "Entry"
WHERE goal_id IN (
  SELECT g.id FROM "Goal" g JOIN "User" u ON u.id = g.participant_id
  WHERE u.username IN ('participant1', 'participant2'));

DELETE FROM "Goal"
WHERE participant_id IN (SELECT id FROM "User" WHERE username IN ('participant1', 'participant2'));

-- Fails (and deletes nothing once rolled back) if another account still has a goal on a UAT template.
DELETE FROM "Template" WHERE name LIKE 'UAT-%';

SELECT 'after:  ' ||
  (SELECT count(*) FROM "Goal" g JOIN "User" u ON u.id = g.participant_id WHERE u.username IN ('participant1', 'participant2')) || ' goals, ' ||
  (SELECT count(*) FROM "Entry" e JOIN "Goal" g ON g.id = e.goal_id JOIN "User" u ON u.id = g.participant_id WHERE u.username IN ('participant1', 'participant2')) || ' entries, ' ||
  (SELECT count(*) FROM "Template" WHERE name LIKE 'UAT-%') || ' UAT templates, ' ||
  (SELECT count(*) FROM "User") || ' users, ' ||
  (SELECT count(*) FROM "Template") || ' templates in all' AS counts;

-- Now type COMMIT; or ROLLBACK;
