-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "emailFrom" TEXT,
    "enableEmailAlerts" BOOLEAN NOT NULL DEFAULT false,
    "enableInAppAlerts" BOOLEAN NOT NULL DEFAULT true,
    "enableTicketAssign" BOOLEAN NOT NULL DEFAULT true,
    "enableSlaBreach" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
