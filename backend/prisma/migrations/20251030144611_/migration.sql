/*
  Warnings:

  - You are about to drop the column `RazorPayPaymentId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `RazorPaySignature` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `RazorPayorderId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpayOrderId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `razorpayOrderId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Transaction_RazorPayorderId_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "RazorPayPaymentId",
DROP COLUMN "RazorPaySignature",
DROP COLUMN "RazorPayorderId",
ADD COLUMN     "razorpayOrderId" TEXT NOT NULL,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_razorpayOrderId_key" ON "Transaction"("razorpayOrderId");
