/*
  Warnings:

  - Added the required column `sendToURL` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "sendToURL" TEXT NOT NULL;
