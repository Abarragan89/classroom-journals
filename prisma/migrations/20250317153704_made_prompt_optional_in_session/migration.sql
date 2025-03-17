-- DropForeignKey
ALTER TABLE "PromptSession" DROP CONSTRAINT "PromptSession_promptId_fkey";

-- AlterTable
ALTER TABLE "PromptSession" ALTER COLUMN "promptId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PromptSession" ADD CONSTRAINT "PromptSession_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
