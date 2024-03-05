/*
  Warnings:

  - Added the required column `gender` to the `user_profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "gender" "gender" NOT NULL;
