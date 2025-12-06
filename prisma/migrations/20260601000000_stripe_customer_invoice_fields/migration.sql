-- Add Stripe linkage fields for clients and client charges
ALTER TABLE "Client" ADD COLUMN "stripeCustomerId" TEXT;

ALTER TABLE "ClientCharge" ADD COLUMN "stripeInvoiceId" TEXT;
ALTER TABLE "ClientCharge" ADD COLUMN "hostedInvoiceUrl" TEXT;

-- Helpful indexes for lookup by invoice/customer
CREATE UNIQUE INDEX "Client_stripeCustomerId_key" ON "Client"("stripeCustomerId");
CREATE UNIQUE INDEX "ClientCharge_stripeInvoiceId_key" ON "ClientCharge"("stripeInvoiceId");
CREATE INDEX "ClientCharge_stripeInvoiceId_idx" ON "ClientCharge"("stripeInvoiceId");
