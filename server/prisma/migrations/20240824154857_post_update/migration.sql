-- AlterTable
ALTER TABLE "post" ALTER COLUMN "replies_allowed_by" SET DEFAULT 'everyone',
ALTER COLUMN "schedule_at" DROP NOT NULL;
