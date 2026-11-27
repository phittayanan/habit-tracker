-- Lab 7 (Issue #140, ADR 0061): several entries per goal and day. No row changes.
-- Not reversible once a day holds two entries; a rollback to v1.4 code would skip the day-total check.
DROP INDEX "Entry_goal_id_entry_date_key";
CREATE INDEX "Entry_goal_id_entry_date_idx" ON "Entry"("goal_id", "entry_date");
