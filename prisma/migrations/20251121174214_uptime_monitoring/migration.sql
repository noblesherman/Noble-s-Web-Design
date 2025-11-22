-- CreateTable
CREATE TABLE "UptimeTarget" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "checkInterval" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStatus" INTEGER,
    "lastChecked" TIMESTAMP(3),
    "lastResponseTimeMs" INTEGER,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "alertActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UptimeTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UptimeLog" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "passed" BOOLEAN NOT NULL,

    CONSTRAINT "UptimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "primaryAlertEmail" TEXT,
    "secondaryAlertEmail" TEXT,
    "alertThreshold" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UptimeTarget_ownerUserId_idx" ON "UptimeTarget"("ownerUserId");

-- CreateIndex
CREATE INDEX "UptimeLog_targetId_timestamp_idx" ON "UptimeLog"("targetId", "timestamp");

-- AddForeignKey
ALTER TABLE "UptimeTarget" ADD CONSTRAINT "UptimeTarget_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UptimeLog" ADD CONSTRAINT "UptimeLog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "UptimeTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
