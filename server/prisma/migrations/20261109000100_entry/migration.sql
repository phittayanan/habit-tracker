CREATE TABLE "Entry" (
  "id" SERIAL NOT NULL,
  "goal_id" INTEGER NOT NULL,
  "entry_date" DATE NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Entry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Entry_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Entry_goal_id_entry_date_key" ON "Entry"("goal_id", "entry_date");
