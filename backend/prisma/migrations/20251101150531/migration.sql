/*
  Warnings:

  - You are about to drop the column `escrow_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the `escrow_state_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `escrows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrow_state_history" DROP CONSTRAINT "escrow_state_history_actor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrow_state_history" DROP CONSTRAINT "escrow_state_history_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrows" DROP CONSTRAINT "escrows_arbiter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrows" DROP CONSTRAINT "escrows_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrows" DROP CONSTRAINT "escrows_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrows" DROP CONSTRAINT "escrows_milestone_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."escrows" DROP CONSTRAINT "escrows_seller_id_fkey";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "escrow_id",
ADD COLUMN     "escrow" TEXT;

-- AlterTable
ALTER TABLE "job_milestones" ADD COLUMN     "escrow" TEXT;

-- DropTable
DROP TABLE "public"."escrow_state_history";

-- DropTable
DROP TABLE "public"."escrows";
