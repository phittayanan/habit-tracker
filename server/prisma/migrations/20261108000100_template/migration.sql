-- CreateEnum
CREATE TYPE "TemplateState" AS ENUM ('ACTIVE', 'RETIRED');

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "min_value" DECIMAL(10,2) NOT NULL,
    "max_value" DECIMAL(10,2) NOT NULL,
    "state" "TemplateState" NOT NULL DEFAULT 'ACTIVE',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BR-03: a template minimum is below its maximum. Prisma schema has no check attribute.
ALTER TABLE "Template" ADD CONSTRAINT "Template_min_below_max" CHECK ("min_value" < "max_value");
