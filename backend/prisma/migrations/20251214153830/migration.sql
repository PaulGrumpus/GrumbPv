/*
  Warnings:

  - The values [JOB_STARTED,FUNDS_RELEASED] on the enum `notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "notification_type_new" AS ENUM ('JOB_POSTED', 'BID_RECEIVED', 'BID_ACCEPTED', 'BID_DECLIEND', 'BID_WITHDRAWN', 'MILESTONE_STARTED', 'MILESTONE_FUNDED', 'MILESTONE_DELIVERED', 'MILESTONE_APPROVED', 'MILESTONE_FUNDS_RELEASED', 'DISPUTE_STARTED', 'DISPUTE_RESOLVED', 'MESSAGE_RECEIVED', 'REQUIREMENT_DOCS_CREATED', 'REQUIREMENT_DOCS_CONFIRMED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "notification_type_new" USING ("type"::text::"notification_type_new");
ALTER TYPE "notification_type" RENAME TO "notification_type_old";
ALTER TYPE "notification_type_new" RENAME TO "notification_type";
DROP TYPE "public"."notification_type_old";
COMMIT;
