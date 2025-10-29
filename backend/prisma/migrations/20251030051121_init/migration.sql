-- Ensure required PostgreSQL extensions exist for both main and shadow databases
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('client', 'freelancer', 'admin');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('draft', 'open', 'in_review', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "bid_status" AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "milestone_status" AS ENUM ('pending_fund', 'funded', 'submitted', 'approved', 'released', 'disputed', 'cancelled');

-- CreateEnum
CREATE TYPE "chain_type" AS ENUM ('evm');

-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('native', 'erc20');

-- CreateEnum
CREATE TYPE "escrow_state" AS ENUM ('created', 'funded', 'delivery_submitted', 'buyer_approved', 'seller_approved', 'released', 'refunded', 'disputed', 'paused', 'closed');

-- CreateEnum
CREATE TYPE "dispute_status" AS ENUM ('open', 'awaiting_fees', 'panel_assigned', 'evidence', 'deliberation', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "convo_type" AS ENUM ('dm');

-- CreateEnum
CREATE TYPE "msg_type" AS ENUM ('text', 'image', 'file', 'system');

-- CreateEnum
CREATE TYPE "read_state" AS ENUM ('sent', 'delivered', 'read');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "handle" CITEXT NOT NULL,
    "email" CITEXT,
    "role" "user_role" NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "country_code" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "chain" "chain_type" NOT NULL DEFAULT 'evm',
    "chain_id" BIGINT NOT NULL,
    "address" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description_md" TEXT NOT NULL,
    "budget_min_usd" DECIMAL(18,2),
    "budget_max_usd" DECIMAL(18,2),
    "token_symbol" TEXT,
    "deadline_at" TIMESTAMPTZ(6),
    "status" "job_status" NOT NULL DEFAULT 'open',
    "is_remote" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_bids" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "freelancer_id" UUID NOT NULL,
    "cover_letter_md" TEXT,
    "bid_amount" DECIMAL(78,0),
    "token_address" TEXT,
    "token_type" "token_type" NOT NULL DEFAULT 'native',
    "token_decimals" INTEGER NOT NULL DEFAULT 18,
    "status" "bid_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_milestones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "creator_id" UUID,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL,
    "token_address" TEXT,
    "token_type" "token_type" NOT NULL DEFAULT 'native',
    "token_decimals" INTEGER NOT NULL DEFAULT 18,
    "due_at" TIMESTAMPTZ(6),
    "order_index" INTEGER NOT NULL,
    "status" "milestone_status" NOT NULL DEFAULT 'pending_fund',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "milestone_id" UUID,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "arbiter_id" UUID,
    "chain_id" BIGINT NOT NULL,
    "factory_address" TEXT NOT NULL,
    "implementation_addr" TEXT NOT NULL,
    "proxy_address" TEXT NOT NULL,
    "deployment_tx_hash" TEXT NOT NULL,
    "token_address" TEXT,
    "token_type" "token_type" NOT NULL DEFAULT 'native',
    "token_decimals" INTEGER NOT NULL DEFAULT 18,
    "fee_bps" INTEGER NOT NULL DEFAULT 0,
    "current_state" "escrow_state" NOT NULL DEFAULT 'created',
    "metadata_cid" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_state_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrow_id" UUID NOT NULL,
    "from_state" "escrow_state",
    "to_state" "escrow_state" NOT NULL,
    "cause" TEXT,
    "actor_user_id" UUID,
    "tx_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_state_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_chain_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrow_id" UUID NOT NULL,
    "chain_id" BIGINT NOT NULL,
    "contract_addr" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "block_number" BIGINT NOT NULL,
    "log_index" INTEGER NOT NULL,
    "raw_event_json" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_chain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrow_id" UUID NOT NULL,
    "opened_by_id" UUID NOT NULL,
    "status" "dispute_status" NOT NULL DEFAULT 'open',
    "fee_amount" DECIMAL(78,0),
    "token_address" TEXT,
    "token_type" "token_type" NOT NULL DEFAULT 'native',
    "token_decimals" INTEGER NOT NULL DEFAULT 18,
    "resolution_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dispute_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "has_paid_fee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dispute_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "convo_type" NOT NULL DEFAULT 'dm',
    "job_id" UUID,
    "escrow_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "blocked_until" TIMESTAMPTZ(6),
    "last_read_msg_id" UUID,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "kind" "msg_type" NOT NULL DEFAULT 'text',
    "body_text" TEXT,
    "attachment_id" UUID,
    "reply_to_msg_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "state" "read_state" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "uploader_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_txs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "purpose" TEXT NOT NULL,
    "chain_id" BIGINT NOT NULL,
    "from_address" TEXT NOT NULL,
    "to_address" TEXT,
    "tx_hash" TEXT,
    "request_id" TEXT,
    "request_payload" JSONB,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,

    CONSTRAINT "chain_txs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_table" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_chain_id_address_key" ON "user_wallets"("chain_id", "address");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_user_id_is_primary_key" ON "user_wallets"("user_id", "is_primary");

-- CreateIndex
CREATE INDEX "jobs_status_created_at_idx" ON "jobs"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "job_bids_job_id_status_idx" ON "job_bids"("job_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "job_bids_job_id_freelancer_id_key" ON "job_bids"("job_id", "freelancer_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_milestones_job_id_order_index_key" ON "job_milestones"("job_id", "order_index");

-- CreateIndex
CREATE INDEX "escrows_job_id_idx" ON "escrows"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "escrows_chain_id_proxy_address_key" ON "escrows"("chain_id", "proxy_address");

-- CreateIndex
CREATE INDEX "escrow_state_history_escrow_id_created_at_idx" ON "escrow_state_history"("escrow_id", "created_at");

-- CreateIndex
CREATE INDEX "escrow_chain_events_escrow_id_block_number_idx" ON "escrow_chain_events"("escrow_id", "block_number");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_chain_events_tx_hash_log_index_key" ON "escrow_chain_events"("tx_hash", "log_index");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_escrow_id_key" ON "disputes"("escrow_id");

-- CreateIndex
CREATE UNIQUE INDEX "dispute_participants_dispute_id_user_id_key" ON "dispute_participants"("dispute_id", "user_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "message_receipts_message_id_user_id_state_key" ON "message_receipts"("message_id", "user_id", "state");

-- CreateIndex
CREATE UNIQUE INDEX "chain_txs_tx_hash_key" ON "chain_txs"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "chain_txs_request_id_key" ON "chain_txs"("request_id");

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_bids" ADD CONSTRAINT "job_bids_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_bids" ADD CONSTRAINT "job_bids_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_milestones" ADD CONSTRAINT "job_milestones_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_milestones" ADD CONSTRAINT "job_milestones_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "job_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_arbiter_id_fkey" FOREIGN KEY ("arbiter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_state_history" ADD CONSTRAINT "escrow_state_history_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_state_history" ADD CONSTRAINT "escrow_state_history_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_chain_events" ADD CONSTRAINT "escrow_chain_events_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_id_fkey" FOREIGN KEY ("opened_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_last_read_msg_id_fkey" FOREIGN KEY ("last_read_msg_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_msg_id_fkey" FOREIGN KEY ("reply_to_msg_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_txs" ADD CONSTRAINT "chain_txs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
