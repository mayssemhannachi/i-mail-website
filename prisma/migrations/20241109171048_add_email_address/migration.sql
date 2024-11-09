/*
  Warnings:

  - You are about to drop the column `emailAdress` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailAddress` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- DropIndex
DROP INDEX "User_emailAdress_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailAdress",
ADD COLUMN     "emailAddress" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user',
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "ChatbotInteraction" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT,

    CONSTRAINT "ChatbotInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "subscriptionId" TEXT,
    "productId" TEXT,
    "priceId" TEXT,
    "customerId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotInteraction_userId_key" ON "ChatbotInteraction"("userId");

-- CreateIndex
CREATE INDEX "ChatbotInteraction_day_userId_idx" ON "ChatbotInteraction"("day", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotInteraction_day_userId_key" ON "ChatbotInteraction"("day", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeSubscription_userId_key" ON "StripeSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeSubscription_subscriptionId_key" ON "StripeSubscription"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailAddress_key" ON "User"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stripeSubscriptionId_fkey" FOREIGN KEY ("stripeSubscriptionId") REFERENCES "StripeSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotInteraction" ADD CONSTRAINT "ChatbotInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
