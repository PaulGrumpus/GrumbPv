/*
  Warnings:

  - The values [rejected] on the enum `bid_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "bid_status_new" AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');
ALTER TABLE "public"."job_bids" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "job_bids" ALTER COLUMN "status" TYPE "bid_status_new" USING ("status"::text::"bid_status_new");
ALTER TYPE "bid_status" RENAME TO "bid_status_old";
ALTER TYPE "bid_status_new" RENAME TO "bid_status";
DROP TYPE "public"."bid_status_old";
ALTER TABLE "job_bids" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
