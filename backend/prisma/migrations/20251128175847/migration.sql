/*
  Warnings:

  - You are about to drop the `files` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."gigs" DROP CONSTRAINT "gigs_image_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_image_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_image_id_fkey";

-- AlterTable
ALTER TABLE "gigs" ALTER COLUMN "image_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "image_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "image_id" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."files";
