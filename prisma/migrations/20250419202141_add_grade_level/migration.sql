/*
  Warnings:

  - You are about to drop the column `gradeLevel` on the `Classroom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Classroom" DROP COLUMN "gradeLevel",
ADD COLUMN     "grade" TEXT;
