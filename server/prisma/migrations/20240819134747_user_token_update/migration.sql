-- AlterTable
ALTER TABLE "user_tokens" ALTER COLUMN "forgot_password_token_expiry" SET DATA TYPE TEXT,
ALTER COLUMN "email_verification_expiry" SET DATA TYPE TEXT;
