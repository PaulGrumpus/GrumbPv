/*
  Warnings:

  - Made the column `image_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "image_id" SET NOT NULL,
ALTER COLUMN "image_id" SET DEFAULT 'default.jpg';
