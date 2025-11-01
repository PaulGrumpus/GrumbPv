/*
  Warnings:

  - You are about to drop the column `creator_id` on the `job_milestones` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."job_milestones" DROP CONSTRAINT "job_milestones_creator_id_fkey";

-- AlterTable
ALTER TABLE "job_milestones" DROP COLUMN "creator_id",
ADD COLUMN     "freelancer_id" UUID;

-- AddForeignKey
ALTER TABLE "job_milestones" ADD CONSTRAINT "job_milestones_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
