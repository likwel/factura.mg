-- CreateEnum
CREATE TYPE "ResetPeriod" AS ENUM ('NEVER', 'YEARLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "NumberingConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "docType" "DocumentType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "separator" TEXT NOT NULL DEFAULT '-',
    "includeYear" BOOLEAN NOT NULL DEFAULT true,
    "yearFormat" TEXT NOT NULL DEFAULT 'YYYY',
    "includeMonth" BOOLEAN NOT NULL DEFAULT false,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "resetPeriod" "ResetPeriod" NOT NULL DEFAULT 'YEARLY',
    "currentSeq" INTEGER NOT NULL DEFAULT 0,
    "lastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumberingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NumberingConfig_companyId_idx" ON "NumberingConfig"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberingConfig_companyId_docType_key" ON "NumberingConfig"("companyId", "docType");

-- AddForeignKey
ALTER TABLE "NumberingConfig" ADD CONSTRAINT "NumberingConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
