/*
  Warnings:

  - You are about to drop the column `kind` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `body` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('JOB_POSTED', 'BID_RECEIVED', 'BID_ACCEPTED', 'JOB_STARTED', 'MILESTONE_FUNDED', 'MILESTONE_DELIVERED', 'MILESTONE_APPROVED', 'FUNDS_RELEASED', 'DISPUTE_STARTED', 'DISPUTE_RESOLVED', 'MESSAGE_RECEIVED');

-- CreateEnum
CREATE TYPE "notification_entity" AS ENUM ('job', 'bid', 'milestone', 'escrow', 'dispute', 'conversation');

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "kind",
ADD COLUMN     "actor_user_id" UUID,
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "entity_id" UUID NOT NULL,
ADD COLUMN     "entity_type" "notification_entity" NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "notification_type" NOT NULL,
ALTER COLUMN "payload" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_entity_type_entity_id_idx" ON "notifications"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
