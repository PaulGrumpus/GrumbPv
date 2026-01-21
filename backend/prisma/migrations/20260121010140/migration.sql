-- AlterEnum
ALTER TYPE "notification_entity" ADD VALUE 'chain_tx';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'DEPOSIT_FUNDS';
ALTER TYPE "notification_type" ADD VALUE 'DELIVER_WORK';
ALTER TYPE "notification_type" ADD VALUE 'APPROVE_WORK';
ALTER TYPE "notification_type" ADD VALUE 'WITHDRAW_FUNDS';
