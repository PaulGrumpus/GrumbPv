/*
  Warnings:

  - You are about to drop the column `handle` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_handle_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "handle";
