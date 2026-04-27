-- AlterEnum
ALTER TYPE "SubscriptionPlan" ADD VALUE 'FREE';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextRecurringDate" TIMESTAMP(3),
ADD COLUMN     "parentInvoiceId" TEXT,
ADD COLUMN     "recurringEndDate" TIMESTAMP(3),
ADD COLUMN     "recurringInterval" TEXT;

-- CreateIndex
CREATE INDEX "Invoice_isRecurring_idx" ON "Invoice"("isRecurring");

-- CreateIndex
CREATE INDEX "Invoice_nextRecurringDate_idx" ON "Invoice"("nextRecurringDate");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_parentInvoiceId_fkey" FOREIGN KEY ("parentInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
