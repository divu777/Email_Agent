/*
  Warnings:

  - The values [REFUNDED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `razorpayOrderId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `razorpaySubscriptionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');
ALTER TABLE "Transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "Transaction_razorpayOrderId_idx";

-- DropIndex
DROP INDEX "Transaction_razorpayOrderId_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "razorpayOrderId",
ADD COLUMN     "razorpaySubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_razorpaySubscriptionId_idx" ON "Transaction"("razorpaySubscriptionId");
