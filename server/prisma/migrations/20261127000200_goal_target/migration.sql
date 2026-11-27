-- F-14 (Issue #153, ADR 0075): target versions in a new table. Additive: no Goal column changes.
-- A previous app version still runs on this schema: it ignores "GoalTarget" and uses "Goal"."daily_target".
CREATE TABLE "GoalTarget" (
  "id" SERIAL NOT NULL,
  "goal_id" INTEGER NOT NULL,
  "effective_from" DATE NOT NULL,
  "daily_target" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "GoalTarget_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GoalTarget_positive_target" CHECK ("daily_target" > 0),
  -- ADR 0086: versions go with their goal; Entry keeps ON DELETE RESTRICT.
  CONSTRAINT "GoalTarget_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- ADR 0077: one version per goal and effective date.
CREATE UNIQUE INDEX "GoalTarget_goal_id_effective_from_key" ON "GoalTarget"("goal_id", "effective_from");
-- Every existing goal gets one version from its start date with its current target.
INSERT INTO "GoalTarget" ("goal_id", "effective_from", "daily_target")
SELECT "id", "start_date", "daily_target" FROM "Goal";
