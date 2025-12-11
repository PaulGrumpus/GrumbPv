/*
  Warnings:

  - You are about to drop the column `job_application_doc_id` on the `job_bids` table. All the data in the column will be lost.
  - You are about to drop the column `job_applications_docsId` on the `job_bids` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "job_bids" DROP CONSTRAINT "job_bids_job_applications_docsId_fkey";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "job_application_doc_id" UUID;

-- AlterTable
ALTER TABLE "job_bids" DROP COLUMN "job_application_doc_id",
DROP COLUMN "job_applications_docsId";

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_application_doc_id_fkey" FOREIGN KEY ("job_application_doc_id") REFERENCES "job_applications_docs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
