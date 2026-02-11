-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL DEFAULT 'default',
    "fee_bps" INTEGER NOT NULL DEFAULT 100,
    "buyer_fee_bps" INTEGER NOT NULL DEFAULT 50,
    "vendor_fee_bps" INTEGER NOT NULL DEFAULT 50,
    "dispute_fee_bps" INTEGER NOT NULL DEFAULT 50,
    "reward_rate_bps" INTEGER NOT NULL DEFAULT 25,
    "reward_rate_per_1_e_18" TEXT NOT NULL DEFAULT '30000000000000000000000',
    "arbiter_address" TEXT NOT NULL DEFAULT '',
    "fee_recipient_address" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
