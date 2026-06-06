-- CreateTable BranchPaymentOrder
CREATE TABLE "BranchPaymentOrder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costPerBranch" INTEGER NOT NULL DEFAULT 50,
    "totalCost" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentMethod" TEXT NOT NULL,
    "network" TEXT,
    "phoneNumber" TEXT,
    "mobileMoneyTxnId" TEXT,
    "bankName" TEXT,
    "accountNameUsed" TEXT,
    "bankTxnReference" TEXT,
    "transactionReference" TEXT,
    "proofOfPaymentUrl" TEXT,
    "paymentDate" TIMESTAMP(3),
    "note" TEXT,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdBranchIds" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchPaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable BranchRequest
CREATE TABLE "BranchRequest" (
    "id" TEXT NOT NULL,
    "branchPaymentOrderId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Ghana',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "managerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex BranchPaymentOrder
CREATE INDEX "BranchPaymentOrder_companyId_idx" ON "BranchPaymentOrder"("companyId");
CREATE INDEX "BranchPaymentOrder_status_idx" ON "BranchPaymentOrder"("status");
CREATE INDEX "BranchPaymentOrder_paymentDate_idx" ON "BranchPaymentOrder"("paymentDate");
CREATE INDEX "BranchPaymentOrder_createdAt_idx" ON "BranchPaymentOrder"("createdAt" DESC);
CREATE INDEX "BranchPaymentOrder_companyId_status_idx" ON "BranchPaymentOrder"("companyId", "status");
CREATE INDEX "BranchPaymentOrder_status_createdAt_idx" ON "BranchPaymentOrder"("status", "createdAt" DESC);

-- CreateIndex BranchRequest
CREATE INDEX "BranchRequest_branchPaymentOrderId_idx" ON "BranchRequest"("branchPaymentOrderId");
CREATE INDEX "BranchRequest_branchId_idx" ON "BranchRequest"("branchId");

-- AddForeignKey BranchPaymentOrder
ALTER TABLE "BranchPaymentOrder" ADD CONSTRAINT "BranchPaymentOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey BranchRequest
ALTER TABLE "BranchRequest" ADD CONSTRAINT "BranchRequest_branchPaymentOrderId_fkey" FOREIGN KEY ("branchPaymentOrderId") REFERENCES "BranchPaymentOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
