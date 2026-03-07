-- CreateEnum
CREATE TYPE "article_status" AS ENUM ('draft', 'pending_review', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "expert_application_status" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "status" "article_status" NOT NULL DEFAULT 'pending_review';

-- CreateTable
CREATE TABLE "expert_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "bio" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "status" "expert_application_status" NOT NULL DEFAULT 'pending',
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expert_applications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "expert_applications" ADD CONSTRAINT "expert_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
