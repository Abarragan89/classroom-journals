-- DropForeignKey
ALTER TABLE "PromptSession" DROP CONSTRAINT "PromptSession_classId_fkey";

-- DropForeignKey
ALTER TABLE "PromptSession" DROP CONSTRAINT "PromptSession_promptId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_promptSessionId_fkey";

-- AddForeignKey
ALTER TABLE "PromptSession" ADD CONSTRAINT "PromptSession_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptSession" ADD CONSTRAINT "PromptSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_promptSessionId_fkey" FOREIGN KEY ("promptSessionId") REFERENCES "PromptSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
