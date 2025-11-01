/*
  Warnings:

  - Made the column `freelancer_id` on table `job_milestones` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."job_milestones" DROP CONSTRAINT "job_milestones_freelancer_id_fkey";

-- AlterTable
ALTER TABLE "job_milestones" ALTER COLUMN "freelancer_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "job_milestones" ADD CONSTRAINT "job_milestones_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
