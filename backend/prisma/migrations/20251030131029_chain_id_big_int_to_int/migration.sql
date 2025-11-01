/*
  Warnings:

  - You are about to alter the column `chain_id` on the `chain_txs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `chain_id` on the `escrow_chain_events` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `block_number` on the `escrow_chain_events` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `chain_id` on the `escrows` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `chain_id` on the `user_wallets` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "chain_txs" ALTER COLUMN "chain_id" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "escrow_chain_events" ALTER COLUMN "chain_id" SET DATA TYPE INTEGER,
ALTER COLUMN "block_number" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "escrows" ALTER COLUMN "chain_id" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "user_wallets" ALTER COLUMN "chain_id" SET DATA TYPE INTEGER;
