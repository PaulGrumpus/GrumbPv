-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "gigsId" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image_id" UUID;

-- CreateTable
CREATE TABLE "gigs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "freelancer_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description_md" TEXT NOT NULL,
    "budget_min_usd" DECIMAL(18,8),
    "budget_max_usd" DECIMAL(18,8),
    "token_symbol" TEXT,
    "tags" TEXT[],
    "image_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gigs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gigs_created_at_idx" ON "gigs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_gigsId_fkey" FOREIGN KEY ("gigsId") REFERENCES "gigs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
