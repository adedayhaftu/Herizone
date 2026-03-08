-- CreateEnum
CREATE TYPE "appointment_mode" AS ENUM ('chat', 'audio', 'video');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('pending', 'paid', 'scheduled', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "expert_id" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL DEFAULT 0,
    "mode" "appointment_mode" NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3),
    "merchant_request_id" TEXT,
    "checkout_request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
