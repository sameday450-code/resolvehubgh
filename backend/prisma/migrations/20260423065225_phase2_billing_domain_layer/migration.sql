/*
  Warnings:

  - A unique constraint covering the columns `[planType]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planType` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum (safe — skips if already exists from a prior failed run)
DO $$ BEGIN
  CREATE TYPE "PlanType" AS ENUM ('STARTER_TRIAL', 'ENTERPRISE_MONTHLY', 'CUSTOM_ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PENDING_PAYMENT', 'EXPIRED', 'PAST_DUE', 'CANCELLED', 'PENDING_ACTIVATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentGateway" AS ENUM ('PAYSTACK', 'STRIPE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Truncate old plan rows so the NOT NULL column can be added cleanly.
-- Plans are bootstrapped by the seed script with the correct planType values.
TRUNCATE TABLE "SubscriptionPlan" CASCADE;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN IF NOT EXISTS "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN IF NOT EXISTS "planType" "PlanType",
ADD COLUMN IF NOT EXISTS "trialDays" INTEGER NOT NULL DEFAULT 0;

-- Back-fill required planType before applying NOT NULL (table is empty at this point so no rows to update)
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "planType" SET NOT NULL;

-- CreateTable
CREATE TABLE "CompanySubscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "gateway" "PaymentGateway",
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalCompanyName" TEXT,
    "billingEmail" TEXT NOT NULL,
    "billingPhone" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "taxId" TEXT,
    "defaultGateway" "PaymentGateway",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companySubscriptionId" TEXT,
    "billingProfileId" TEXT,
    "gateway" "PaymentGateway" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "providerReference" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSalesRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "estimatedBranches" INTEGER,
    "estimatedUsers" INTEGER,
    "requirements" TEXT NOT NULL,
    "sourcePlanType" "PlanType" NOT NULL DEFAULT 'CUSTOM_ENTERPRISE',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSalesRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanySubscription_companyId_key" ON "CompanySubscription"("companyId");

-- CreateIndex
CREATE INDEX "CompanySubscription_companyId_idx" ON "CompanySubscription"("companyId");

-- CreateIndex
CREATE INDEX "CompanySubscription_status_idx" ON "CompanySubscription"("status");

-- CreateIndex
CREATE INDEX "CompanySubscription_subscriptionPlanId_idx" ON "CompanySubscription"("subscriptionPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProfile_companyId_key" ON "BillingProfile"("companyId");

-- CreateIndex
CREATE INDEX "BillingProfile_companyId_idx" ON "BillingProfile"("companyId");

-- CreateIndex
CREATE INDEX "BillingProfile_billingEmail_idx" ON "BillingProfile"("billingEmail");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_providerReference_key" ON "PaymentTransaction"("providerReference");

-- CreateIndex
CREATE INDEX "PaymentTransaction_companyId_idx" ON "PaymentTransaction"("companyId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_companySubscriptionId_idx" ON "PaymentTransaction"("companySubscriptionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_billingProfileId_idx" ON "PaymentTransaction"("billingProfileId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "ContactSalesRequest_companyId_idx" ON "ContactSalesRequest"("companyId");

-- CreateIndex
CREATE INDEX "ContactSalesRequest_contactEmail_idx" ON "ContactSalesRequest"("contactEmail");

-- CreateIndex
CREATE INDEX "ContactSalesRequest_status_idx" ON "ContactSalesRequest"("status");

-- CreateIndex
CREATE INDEX "ContactSalesRequest_createdAt_idx" ON "ContactSalesRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planType_key" ON "SubscriptionPlan"("planType");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_planType_idx" ON "SubscriptionPlan"("planType");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- AddForeignKey
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProfile" ADD CONSTRAINT "BillingProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_companySubscriptionId_fkey" FOREIGN KEY ("companySubscriptionId") REFERENCES "CompanySubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_billingProfileId_fkey" FOREIGN KEY ("billingProfileId") REFERENCES "BillingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSalesRequest" ADD CONSTRAINT "ContactSalesRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
