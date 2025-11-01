/*
  Warnings:

  - You are about to alter the column `bid_amount` on the `job_bids` table. The data in that column could be lost. The data in that column will be cast from `Decimal(78,0)` to `Decimal(18,8)`.
  - You are about to alter the column `amount` on the `job_milestones` table. The data in that column could be lost. The data in that column will be cast from `Decimal(78,0)` to `Decimal(18,8)`.
  - You are about to alter the column `budget_min_usd` on the `jobs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.
  - You are about to alter the column `budget_max_usd` on the `jobs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.

*/
-- AlterTable
ALTER TABLE "job_bids" ALTER COLUMN "bid_amount" SET DATA TYPE DECIMAL(18,8);

-- AlterTable
ALTER TABLE "job_milestones" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,8);

-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "budget_min_usd" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "budget_max_usd" SET DATA TYPE DECIMAL(18,8);
