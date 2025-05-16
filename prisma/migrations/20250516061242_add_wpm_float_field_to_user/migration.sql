/*
  Warnings:

  - Made the column `classId` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classId` on table `StudentRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "classId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentRequest" ALTER COLUMN "classId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wpmSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
