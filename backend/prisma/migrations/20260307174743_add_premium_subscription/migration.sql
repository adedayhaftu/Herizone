-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ai_questions_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ai_questions_limit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "ai_questions_reset_at" TIMESTAMP(3),
ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscription_expires_at" TIMESTAMP(3);
