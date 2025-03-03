-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_promptId_fkey";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
