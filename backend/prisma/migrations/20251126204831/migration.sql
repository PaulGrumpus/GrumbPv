/*
  Warnings:

  - You are about to drop the `user_wallets` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[address]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "chain" "chain_type" NOT NULL DEFAULT 'evm',
ALTER COLUMN "email" DROP NOT NULL;

-- Backfill existing addresses before enforcing NOT NULL
WITH prioritized_wallets AS (
    SELECT DISTINCT ON (uw.user_id)
        uw.user_id,
        uw.address
    FROM "public"."user_wallets" uw
    ORDER BY
        uw.user_id,
        CASE WHEN uw.is_primary THEN 0 ELSE 1 END,
        uw.created_at,
        uw.id
)
UPDATE "users" u
SET address = w.address
FROM prioritized_wallets w
WHERE u.id = w.user_id
  AND w.address IS NOT NULL;

-- Fallback placeholder for users without any wallet reference
UPDATE "users"
SET address = CONCAT('temp-', gen_random_uuid()::text)
WHERE address IS NULL;

-- Enforce NOT NULL now that the column is populated
ALTER TABLE "users" ALTER COLUMN "address" SET NOT NULL;

-- DropTable
DROP TABLE "public"."user_wallets";

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");
