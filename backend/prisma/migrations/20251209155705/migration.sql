-- AlterTable
ALTER TABLE "job_bids" ADD COLUMN     "job_application_doc_id" UUID;

-- AddForeignKey
ALTER TABLE "job_bids" ADD CONSTRAINT "job_bids_job_application_doc_id_fkey" FOREIGN KEY ("job_application_doc_id") REFERENCES "job_applications_docs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
