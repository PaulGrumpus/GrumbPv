-- CreateEnum
CREATE TYPE "location_type" AS ENUM ('remote', 'onsite', 'hybrid');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "image_id" UUID,
ADD COLUMN     "location" "location_type" NOT NULL DEFAULT 'remote',
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
