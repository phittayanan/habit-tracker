-- F-17 (Issue #158, ADR 0086, ADR 0095): one stored reminder per goal in a new table. Additive: no existing table or row changes.
-- A previous app version still runs on this schema: it ignores "GoalReminder".
CREATE TABLE "GoalReminder" (
  "goal_id" INTEGER NOT NULL,
  "time" CHAR(5) NOT NULL,
  "weekdays" TEXT[] NOT NULL,
  CONSTRAINT "GoalReminder_pkey" PRIMARY KEY ("goal_id"),
  -- HH:MM, 24-hour, 00:00 to 23:59 (F-17 section 3).
  CONSTRAINT "GoalReminder_time_format" CHECK ("time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  -- At least one weekday, each one of MON to SUN (F-17 section 3).
  CONSTRAINT "GoalReminder_weekdays_present" CHECK (cardinality("weekdays") >= 1),
  CONSTRAINT "GoalReminder_weekdays_known" CHECK ("weekdays" <@ ARRAY['MON','TUE','WED','THU','FRI','SAT','SUN']::TEXT[]),
  -- ADR 0095: the reminder goes with its goal; Entry keeps ON DELETE RESTRICT.
  CONSTRAINT "GoalReminder_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
