-- AlterTable
ALTER TABLE "users" ADD COLUMN     "finished_job_num" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "fund_cycle" DECIMAL(65,30),
ADD COLUMN     "fund_num" DECIMAL(65,30),
ADD COLUMN     "total_fund" DECIMAL(65,30) NOT NULL DEFAULT 0;
