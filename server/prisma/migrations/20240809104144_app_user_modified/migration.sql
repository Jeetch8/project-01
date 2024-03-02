/*
  Warnings:

  - You are about to drop the column `forgot_password_token` on the `app_user` table. All the data in the column will be lost.
  - You are about to drop the column `forgot_password_token_expiry` on the `app_user` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `app_user` table. All the data in the column will be lost.
  - You are about to drop the `temp_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "auth_provider" AS ENUM ('local', 'google', 'github');

-- AlterTable
ALTER TABLE "app_user" DROP COLUMN "forgot_password_token",
DROP COLUMN "forgot_password_token_expiry",
DROP COLUMN "provider",
ADD COLUMN     "auth_provider" "auth_provider" NOT NULL DEFAULT 'local',
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "temp_user";

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" TEXT NOT NULL,
    "app_user_id" TEXT NOT NULL,
    "forgot_password_token" TEXT,
    "forgot_password_token_expiry" TIMESTAMP(3),
    "email_verification_token" TEXT,
    "email_verification_expiry" TIMESTAMP(3),

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_app_user_id_key" ON "user_tokens"("app_user_id");

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
