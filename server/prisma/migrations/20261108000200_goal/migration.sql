CREATE TABLE "Goal" (
  "id" SERIAL NOT NULL,
  "participant_id" INTEGER NOT NULL,
  "template_id" INTEGER NOT NULL,
  "daily_target" DECIMAL(10,2) NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Goal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Goal_positive_target" CHECK ("daily_target" > 0),
  CONSTRAINT "Goal_date_order" CHECK ("end_date" >= "start_date"),
  CONSTRAINT "Goal_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Goal_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Goal_participant_id_template_id_end_date_idx" ON "Goal"("participant_id", "template_id", "end_date");
