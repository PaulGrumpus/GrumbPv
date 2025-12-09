-- DropForeignKey
ALTER TABLE "job_bids" DROP CONSTRAINT "job_bids_job_application_doc_id_fkey";

-- AlterTable
ALTER TABLE "job_bids" ADD COLUMN     "job_applications_docsId" UUID;

-- AddForeignKey
ALTER TABLE "job_bids" ADD CONSTRAINT "job_bids_job_applications_docsId_fkey" FOREIGN KEY ("job_applications_docsId") REFERENCES "job_applications_docs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
