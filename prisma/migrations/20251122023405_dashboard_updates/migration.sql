/*
  Warnings:

  - You are about to drop the column `isActive` on the `Contract` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ClientFile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `ContractSignature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UptimeTarget` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- DropForeignKey
ALTER TABLE "ClientFile" DROP CONSTRAINT "ClientFile_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ClientFile" DROP CONSTRAINT "ClientFile_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContractAssignment" DROP CONSTRAINT "ContractAssignment_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractAssignment" DROP CONSTRAINT "ContractAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContractSignature" DROP CONSTRAINT "ContractSignature_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractSignature" DROP CONSTRAINT "ContractSignature_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectActivity" DROP CONSTRAINT "ProjectActivity_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectAssignment" DROP CONSTRAINT "ProjectAssignment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectAssignment" DROP CONSTRAINT "ProjectAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectDocument" DROP CONSTRAINT "ProjectDocument_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UptimeLog" DROP CONSTRAINT "UptimeLog_targetId_fkey";

-- DropForeignKey
ALTER TABLE "UptimeTarget" DROP CONSTRAINT "UptimeTarget_ownerUserId_fkey";

-- DropIndex
DROP INDEX "TeamMember_userId_idx";

-- DropIndex
DROP INDEX "Ticket_createdAt_idx";

-- DropIndex
DROP INDEX "Ticket_userId_status_idx";

-- DropIndex
DROP INDEX "UptimeLog_targetId_timestamp_idx";

-- DropIndex
DROP INDEX "UptimeTarget_ownerUserId_idx";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "isActive",
ADD COLUMN     "templatePath" TEXT;

-- AlterTable
ALTER TABLE "ContractSignature" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "typedName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "signatureUuid" DROP NOT NULL,
ALTER COLUMN "signedAt" DROP NOT NULL,
ALTER COLUMN "signedAt" DROP DEFAULT,
ALTER COLUMN "contractVersion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "statusBadge" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProjectActivity" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProjectAssignment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProjectDocument" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "adminMessage" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "priority" DROP DEFAULT,
ALTER COLUMN "category" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UptimeTarget" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "ownerUserId" DROP NOT NULL,
ALTER COLUMN "checkInterval" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT';

-- DropTable
DROP TABLE "ClientFile";

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAssignment" ADD CONSTRAINT "ContractAssignment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAssignment" ADD CONSTRAINT "ContractAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSignature" ADD CONSTRAINT "ContractSignature_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSignature" ADD CONSTRAINT "ContractSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UptimeTarget" ADD CONSTRAINT "UptimeTarget_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UptimeLog" ADD CONSTRAINT "UptimeLog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "UptimeTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
