/*
  Warnings:

  - You are about to drop the column `classId` on the `Prompt` table. All the data in the column will be lost.
  - Made the column `teacherId` on table `Prompt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_classId_fkey";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "classId",
ALTER COLUMN "teacherId" SET NOT NULL;

-- CreateTable
CREATE TABLE "_PromptClass" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PromptClass_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PromptClass_B_index" ON "_PromptClass"("B");

-- AddForeignKey
ALTER TABLE "_PromptClass" ADD CONSTRAINT "_PromptClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptClass" ADD CONSTRAINT "_PromptClass_B_fkey" FOREIGN KEY ("B") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
