-- Update BranchPaymentOrder table to match pricing workflow

-- Drop branchRequests foreign key if it exists
ALTER TABLE IF EXISTS "BranchRequest" DROP CONSTRAINT IF EXISTS "BranchRequest_branchPaymentOrderId_fkey";

-- Recreate BranchPaymentOrder table with new schema
DROP TABLE IF EXISTS "BranchPaymentOrder" CASCADE;

CREATE TABLE "BranchPaymentOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "branches" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BranchPaymentOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "BranchPaymentOrder_companyId_idx" ON "BranchPaymentOrder"("companyId");
CREATE INDEX "BranchPaymentOrder_status_idx" ON "BranchPaymentOrder"("status");
