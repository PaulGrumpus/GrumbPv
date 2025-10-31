/*
  Warnings:

  - The values [created,delivery_submitted,buyer_approved,seller_approved,released,paused,closed] on the enum `escrow_state` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `metadata_cid` on the `escrows` table. All the data in the column will be lost.
  - You are about to drop the `dispute_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disputes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `escrow_chain_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cid` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentHash` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `escrow_created_at` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `escrow_deadline` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `escrow_dispute_fee_deadline` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `escrow_funded_at` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposed_cid` to the `escrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposed_content_hash` to the `escrows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "escrow_state_new" AS ENUM ('unfunded', 'funded', 'delivered', 'disputed', 'releasable', 'paid', 'refunded');
ALTER TABLE "public"."escrow_state_history" ALTER COLUMN "to_state" DROP DEFAULT;
ALTER TABLE "public"."escrows" ALTER COLUMN "current_state" DROP DEFAULT;
ALTER TABLE "escrows" ALTER COLUMN "current_state" TYPE "escrow_state_new" USING ("current_state"::text::"escrow_state_new");
ALTER TABLE "escrow_state_history" ALTER COLUMN "from_state" TYPE "escrow_state_new" USING ("from_state"::text::"escrow_state_new");
ALTER TABLE "escrow_state_history" ALTER COLUMN "to_state" TYPE "escrow_state_new" USING ("to_state"::text::"escrow_state_new");
ALTER TYPE "escrow_state" RENAME TO "escrow_state_old";
ALTER TYPE "escrow_state_new" RENAME TO "escrow_state";
DROP TYPE "public"."escrow_state_old";
ALTER TABLE "escrows" ALTER COLUMN "current_state" SET DEFAULT 'unfunded';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."dispute_participants" DROP CONSTRAINT "dispute_participants_dispute_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."dispute_participants" DROP CONSTRAINT "dispute_participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."disputes" DROP CONSTRAINT "disputes_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."disputes" DROP CONSTRAINT "disputes_opened_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrow_chain_events" DROP CONSTRAINT "escrow_chain_events_escrow_id_fkey";

-- AlterTable
ALTER TABLE "escrow_state_history" ALTER COLUMN "to_state" DROP DEFAULT;

-- AlterTable
ALTER TABLE "escrows" DROP COLUMN "metadata_cid",
ADD COLUMN     "amount" DECIMAL(65,30),
ADD COLUMN     "buyerFeeReserve" DECIMAL(65,30),
ADD COLUMN     "buyer_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "buyer_paid_dispute_fee" BOOLEAN,
ADD COLUMN     "cid" TEXT NOT NULL,
ADD COLUMN     "contentHash" TEXT NOT NULL,
ADD COLUMN     "disputeFeeAmount" DECIMAL(65,30),
ADD COLUMN     "dispute_fee_bps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dispute_initiator" TEXT,
ADD COLUMN     "escrow_created_at" INTEGER NOT NULL,
ADD COLUMN     "escrow_deadline" INTEGER NOT NULL,
ADD COLUMN     "escrow_dispute_fee_deadline" INTEGER NOT NULL,
ADD COLUMN     "escrow_funded_at" INTEGER NOT NULL,
ADD COLUMN     "feerecipient_id" UUID,
ADD COLUMN     "proposed_cid" TEXT NOT NULL,
ADD COLUMN     "proposed_content_hash" TEXT NOT NULL,
ADD COLUMN     "rewardRateBps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rewardRateVsNative" INTEGER,
ADD COLUMN     "rewardToken" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vender_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vender_paid_dispute_fee" BOOLEAN,
ALTER COLUMN "current_state" SET DEFAULT 'unfunded';

-- DropTable
DROP TABLE "public"."dispute_participants";

-- DropTable
DROP TABLE "public"."disputes";

-- DropTable
DROP TABLE "public"."escrow_chain_events";
