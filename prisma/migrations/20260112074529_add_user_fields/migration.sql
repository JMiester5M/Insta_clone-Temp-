/*
  Warnings:

  - Added the required column `user_id` to the `published_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "published_images" ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "user_name" TEXT;
