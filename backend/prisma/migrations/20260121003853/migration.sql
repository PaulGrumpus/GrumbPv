-- AlterTable
ALTER TABLE "chain_txs" ADD COLUMN     "job_milestone_id" UUID;

-- AddForeignKey
ALTER TABLE "chain_txs" ADD CONSTRAINT "chain_txs_job_milestone_id_fkey" FOREIGN KEY ("job_milestone_id") REFERENCES "job_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
