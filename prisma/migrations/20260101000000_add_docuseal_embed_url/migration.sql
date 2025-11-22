-- Add DocuSeal embed URL to contracts for external signing embeds
ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "docusealEmbedUrl" TEXT;
