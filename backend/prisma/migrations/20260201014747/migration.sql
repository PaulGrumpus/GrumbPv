/*
  Warnings:

  - You are about to drop the column `budget_max_usd` on the `gigs` table. All the data in the column will be lost.
  - You are about to drop the column `budget_min_usd` on the `gigs` table. All the data in the column will be lost.
  - You are about to drop the column `budget_max_usd` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `budget_min_usd` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gigs" DROP COLUMN "budget_max_usd",
DROP COLUMN "budget_min_usd",
ADD COLUMN     "budget_max" DECIMAL(18,8),
ADD COLUMN     "budget_min" DECIMAL(18,8);

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "budget_max_usd",
DROP COLUMN "budget_min_usd",
ADD COLUMN     "budget_max" DECIMAL(18,8),
ADD COLUMN     "budget_min" DECIMAL(18,8);
