/*
  Warnings:

  - Added new columns for comprehensive subscription activation tracking.
*/

-- AlterTable - Add subscription activation fields to Company table
ALTER TABLE "Company" ADD COLUMN "planName" TEXT DEFAULT 'Free Trial',
ADD COLUMN "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lockReason" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN "subscriptionStatus" TEXT DEFAULT 'TRIAL',
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "activatedAt" TIMESTAMP(3),
ADD COLUMN "activatedBy" TEXT;

-- Create indexes for better query performance
CREATE INDEX "Company_subscriptionStatus_idx" ON "Company"("subscriptionStatus");
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");
CREATE INDEX "Company_isLocked_idx" ON "Company"("isLocked");
CREATE INDEX "Company_activatedAt_idx" ON "Company"("activatedAt");
