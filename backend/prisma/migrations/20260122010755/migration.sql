/*
  Warnings:

  - A unique constraint covering the columns `[message_id,user_id]` on the table `message_receipts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "message_receipts_message_id_user_id_state_key";

-- CreateIndex
CREATE UNIQUE INDEX "message_receipts_message_id_user_id_key" ON "message_receipts"("message_id", "user_id");
