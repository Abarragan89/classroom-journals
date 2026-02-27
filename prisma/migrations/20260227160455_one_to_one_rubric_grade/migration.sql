/*
  Warnings:

  - A unique constraint covering the columns `[responseId]` on the table `RubricGrade` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RubricGrade_responseId_key" ON "RubricGrade"("responseId");
