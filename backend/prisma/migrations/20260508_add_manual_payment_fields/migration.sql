-- AlterEnum: add MANUAL to PaymentGateway
ALTER TYPE "PaymentGateway" ADD VALUE IF NOT EXISTS 'MANUAL';

-- AlterTable: add new columns to ActivationRequest
ALTER TABLE "ActivationRequest"
  ADD COLUMN IF NOT EXISTS "network"            TEXT,
  ADD COLUMN IF NOT EXISTS "paymentPhoneNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "transactionId"      TEXT,
  ADD COLUMN IF NOT EXISTS "bankName"           TEXT,
  ADD COLUMN IF NOT EXISTS "accountNameUsed"    TEXT;

-- Update existing PENDING status values to PENDING_REVIEW for consistency
UPDATE "ActivationRequest" SET "status" = 'PENDING_REVIEW' WHERE "status" = 'PENDING';
