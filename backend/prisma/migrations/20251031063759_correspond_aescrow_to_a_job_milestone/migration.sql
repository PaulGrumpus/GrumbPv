/*
  Warnings:

  - A unique constraint covering the columns `[milestone_id]` on the table `escrows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "escrows_milestone_id_key" ON "escrows"("milestone_id");
