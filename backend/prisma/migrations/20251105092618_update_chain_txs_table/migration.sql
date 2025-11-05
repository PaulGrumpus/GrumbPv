/*
  Warnings:

  - You are about to drop the column `request_id` on the `chain_txs` table. All the data in the column will be lost.
  - You are about to drop the column `request_payload` on the `chain_txs` table. All the data in the column will be lost.
  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."attachments" DROP CONSTRAINT "attachments_uploader_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_attachment_id_fkey";

-- DropIndex
DROP INDEX "public"."chain_txs_request_id_key";

-- AlterTable
ALTER TABLE "chain_txs" DROP COLUMN "request_id",
DROP COLUMN "request_payload";

-- DropTable
DROP TABLE "public"."attachments";
