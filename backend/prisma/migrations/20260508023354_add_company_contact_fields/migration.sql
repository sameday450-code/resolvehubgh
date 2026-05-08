-- DropIndex
DROP INDEX "Company_activatedAt_idx";

-- DropIndex
DROP INDEX "Company_isActive_idx";

-- DropIndex
DROP INDEX "Company_isLocked_idx";

-- DropIndex
DROP INDEX "Company_subscriptionStatus_idx";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "website" TEXT;
