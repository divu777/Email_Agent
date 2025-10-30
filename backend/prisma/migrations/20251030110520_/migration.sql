/*
  Warnings:

  - You are about to drop the column `orderId` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `subscriptionId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "orderId",
ADD COLUMN     "subscriptionId" TEXT NOT NULL;
