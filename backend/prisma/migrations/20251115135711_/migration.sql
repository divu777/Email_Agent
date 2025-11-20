-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "webhookEventType" TEXT;

-- CreateTable
CREATE TABLE "SubscriptionDump" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "eventType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionDump_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionDump_eventType_idx" ON "SubscriptionDump"("eventType");

-- CreateIndex
CREATE INDEX "SubscriptionDump_createdAt_idx" ON "SubscriptionDump"("createdAt");
