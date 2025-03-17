/*
  Warnings:

  - Made the column `submittedAt` on table `Response` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Response" ALTER COLUMN "submittedAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
