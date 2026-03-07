/*
  Warnings:

  - Added the required column `price_max` to the `expert_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_min` to the `expert_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `years_of_experience` to the `expert_applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expert_applications" ADD COLUMN     "agree_to_terms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "license_number" TEXT,
ADD COLUMN     "price_max" INTEGER NOT NULL,
ADD COLUMN     "price_min" INTEGER NOT NULL,
ADD COLUMN     "years_of_experience" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "price_max" INTEGER,
ADD COLUMN     "price_min" INTEGER,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "years_of_experience" INTEGER;
