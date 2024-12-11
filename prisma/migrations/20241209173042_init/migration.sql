/*
  Warnings:

  - You are about to drop the column `keywords` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `meetingMessageMethod` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `omitted` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `sysClassifications` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the `_BccEmails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CcEmails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BccEmails" DROP CONSTRAINT "_BccEmails_A_fkey";

-- DropForeignKey
ALTER TABLE "_BccEmails" DROP CONSTRAINT "_BccEmails_B_fkey";

-- DropForeignKey
ALTER TABLE "_CcEmails" DROP CONSTRAINT "_CcEmails_A_fkey";

-- DropForeignKey
ALTER TABLE "_CcEmails" DROP CONSTRAINT "_CcEmails_B_fkey";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "keywords",
DROP COLUMN "meetingMessageMethod",
DROP COLUMN "omitted",
DROP COLUMN "sysClassifications";

-- AlterTable
ALTER TABLE "Thread" ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "lastMessageDate" DROP NOT NULL,
ALTER COLUMN "done" DROP NOT NULL,
ALTER COLUMN "inboxStatus" DROP NOT NULL,
ALTER COLUMN "draftStatus" DROP NOT NULL,
ALTER COLUMN "sentStatus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailAddress" DROP NOT NULL;

-- DropTable
DROP TABLE "_BccEmails";

-- DropTable
DROP TABLE "_CcEmails";
