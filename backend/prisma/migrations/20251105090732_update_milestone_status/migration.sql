/*
  Warnings:

  - The values [submitted] on the enum `milestone_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "milestone_status_new" AS ENUM ('pending_fund', 'funded', 'delivered', 'approved', 'released', 'disputed', 'resolvedToBuyer', 'resolvedToVendor', 'cancelled');
ALTER TABLE "public"."job_milestones" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "job_milestones" ALTER COLUMN "status" TYPE "milestone_status_new" USING ("status"::text::"milestone_status_new");
ALTER TYPE "milestone_status" RENAME TO "milestone_status_old";
ALTER TYPE "milestone_status_new" RENAME TO "milestone_status";
DROP TYPE "public"."milestone_status_old";
ALTER TABLE "job_milestones" ALTER COLUMN "status" SET DEFAULT 'pending_fund';
COMMIT;
