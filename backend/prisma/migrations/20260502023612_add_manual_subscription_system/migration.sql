/*
  Warnings:

  - Made the column `paymentStatus` on table `CompanySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentProvider` on table `CompanySubscription` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'MANUAL_APPROVED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('NONE', 'MANUAL', 'PAYSTACK', 'STRIPE');

-- DropIndex
DROP INDEX "ActivityLog_createdAt_idx";

-- DropIndex
DROP INDEX "Complaint_createdAt_idx";

-- DropIndex
DROP INDEX "PaymentTransaction_createdAt_idx";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "branchLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isDashboardLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "plan" TEXT DEFAULT 'STARTER',
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CompanySubscription" ALTER COLUMN "paymentStatus" SET NOT NULL,
ALTER COLUMN "paymentStatus" SET DATA TYPE TEXT,
ALTER COLUMN "paymentProvider" SET NOT NULL,
ALTER COLUMN "paymentProvider" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "ActivationRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "selectedPlan" TEXT NOT NULL DEFAULT 'STARTER',
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "proofOfPaymentUrl" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivationRequest_companyId_idx" ON "ActivationRequest"("companyId");

-- CreateIndex
CREATE INDEX "ActivationRequest_status_idx" ON "ActivationRequest"("status");

-- CreateIndex
CREATE INDEX "ActivationRequest_paymentDate_idx" ON "ActivationRequest"("paymentDate");

-- CreateIndex
CREATE INDEX "ActivationRequest_createdAt_idx" ON "ActivationRequest"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ActivationRequest_companyId_status_idx" ON "ActivationRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "ActivationRequest_status_createdAt_idx" ON "ActivationRequest"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ActivityLog_companyId_action_idx" ON "ActivityLog"("companyId", "action");

-- CreateIndex
CREATE INDEX "ActivityLog_companyId_createdAt_idx" ON "ActivityLog"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ApprovalActionLog_adminId_idx" ON "ApprovalActionLog"("adminId");

-- CreateIndex
CREATE INDEX "ApprovalActionLog_createdAt_idx" ON "ApprovalActionLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Branch_status_idx" ON "Branch"("status");

-- CreateIndex
CREATE INDEX "Branch_companyId_status_idx" ON "Branch"("companyId", "status");

-- CreateIndex
CREATE INDEX "Company_status_createdAt_idx" ON "Company"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Company_industry_status_idx" ON "Company"("industry", "status");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "CompanySubscription_status_trialEndsAt_idx" ON "CompanySubscription"("status", "trialEndsAt" ASC);

-- CreateIndex
CREATE INDEX "CompanySubscription_status_createdAt_idx" ON "CompanySubscription"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CompanySubscription_paymentStatus_updatedAt_idx" ON "CompanySubscription"("paymentStatus", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Complaint_companyId_createdAt_idx" ON "Complaint"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Complaint_companyId_status_createdAt_idx" ON "Complaint"("companyId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Complaint_companyId_priority_createdAt_idx" ON "Complaint"("companyId", "priority", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Complaint_branchId_status_createdAt_idx" ON "Complaint"("branchId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ContactSalesRequest_status_createdAt_idx" ON "ContactSalesRequest"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ContactSalesRequest_sourcePlanType_status_idx" ON "ContactSalesRequest"("sourcePlanType", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_createdAt_idx" ON "PaymentTransaction"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentTransaction_companyId_status_idx" ON "PaymentTransaction"("companyId", "status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_companyId_createdAt_idx" ON "PaymentTransaction"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_companyId_role_idx" ON "User"("companyId", "role");

-- CreateIndex
CREATE INDEX "User_companyId_isActive_idx" ON "User"("companyId", "isActive");

-- AddForeignKey
ALTER TABLE "ActivationRequest" ADD CONSTRAINT "ActivationRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
