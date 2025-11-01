/*
  Warnings:

  - You are about to drop the column `token_address` on the `escrows` table. All the data in the column will be lost.
  - You are about to drop the column `token_decimals` on the `escrows` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `escrows` table. All the data in the column will be lost.
  - You are about to drop the column `token_address` on the `job_bids` table. All the data in the column will be lost.
  - You are about to drop the column `token_decimals` on the `job_bids` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `job_bids` table. All the data in the column will be lost.
  - You are about to drop the column `token_address` on the `job_milestones` table. All the data in the column will be lost.
  - You are about to drop the column `token_decimals` on the `job_milestones` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `job_milestones` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "escrows" DROP COLUMN "token_address",
DROP COLUMN "token_decimals",
DROP COLUMN "token_type";

-- AlterTable
ALTER TABLE "job_bids" DROP COLUMN "token_address",
DROP COLUMN "token_decimals",
DROP COLUMN "token_type",
ADD COLUMN     "token_symbol" TEXT;

-- AlterTable
ALTER TABLE "job_milestones" DROP COLUMN "token_address",
DROP COLUMN "token_decimals",
DROP COLUMN "token_type",
ADD COLUMN     "token_symbol" TEXT;
