-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "feedId" TEXT;

-- CreateTable
CREATE TABLE "Feed" (
    "id" TEXT NOT NULL,
    "rssUrl" TEXT NOT NULL,
    "lastPostGuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feed_rssUrl_key" ON "Feed"("rssUrl");

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
