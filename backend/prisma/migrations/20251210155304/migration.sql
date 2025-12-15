/*
  Warnings:

  - You are about to drop the column `gigsId` on the `conversations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_gigsId_fkey";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "gigsId",
ADD COLUMN     "gig_id" UUID;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_gig_id_fkey" FOREIGN KEY ("gig_id") REFERENCES "gigs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
