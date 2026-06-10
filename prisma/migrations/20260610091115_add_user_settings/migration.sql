-- AlterTable
ALTER TABLE "User" ADD COLUMN     "digestFrequency" TEXT NOT NULL DEFAULT 'weekly',
ADD COLUMN     "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slackWebhookUrl" TEXT;
