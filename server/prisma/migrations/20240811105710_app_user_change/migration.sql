-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "user_session" DROP CONSTRAINT "user_session_userid_fkey";

-- DropForeignKey
ALTER TABLE "user_tokens" DROP CONSTRAINT "user_tokens_app_user_id_fkey";

-- AlterTable
ALTER TABLE "user_profile" ALTER COLUMN "date_of_birth" SET DATA TYPE DATE;

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_userid_fkey" FOREIGN KEY ("userid") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
