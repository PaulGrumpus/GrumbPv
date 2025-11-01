/*
  Warnings:

  - You are about to drop the column `is_primary` on the `user_wallets` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_wallets_user_id_is_primary_key";

-- AlterTable
ALTER TABLE "user_wallets" DROP COLUMN "is_primary";
