-- CreateTable
CREATE TABLE "ClientCharge" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientCharge_clientId_idx" ON "ClientCharge"("clientId");

-- CreateIndex
CREATE INDEX "ClientCharge_stripeSessionId_idx" ON "ClientCharge"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "ClientCharge" ADD CONSTRAINT "ClientCharge_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
