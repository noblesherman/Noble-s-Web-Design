-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "replied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repliedAt" TIMESTAMP(3);
