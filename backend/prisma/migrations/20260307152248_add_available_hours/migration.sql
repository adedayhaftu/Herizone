-- DropIndex
DROP INDEX "knowledge_base_embedding_idx";

-- AlterTable
ALTER TABLE "expert_applications" ADD COLUMN     "available_hours" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "available_hours" TEXT,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviews" DOUBLE PRECISION DEFAULT 0;
