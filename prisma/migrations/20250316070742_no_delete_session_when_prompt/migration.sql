-- DropForeignKey
ALTER TABLE "PromptSession" DROP CONSTRAINT "PromptSession_promptId_fkey";

-- AddForeignKey
ALTER TABLE "PromptSession" ADD CONSTRAINT "PromptSession_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
