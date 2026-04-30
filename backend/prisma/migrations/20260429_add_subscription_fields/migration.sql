-- Add subscription-related fields to CompanySubscription
ALTER TABLE "CompanySubscription"
ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "nextBillingDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(50) DEFAULT 'UNPAID',
ADD COLUMN IF NOT EXISTS "paymentProvider" VARCHAR(50) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS "daysRemainingInTrial" INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "CompanySubscription_status_idx" ON "CompanySubscription"("status");
CREATE INDEX IF NOT EXISTS "CompanySubscription_paymentStatus_idx" ON "CompanySubscription"("paymentStatus");
CREATE INDEX IF NOT EXISTS "CompanySubscription_trialEndsAt_idx" ON "CompanySubscription"("trialEndsAt");
