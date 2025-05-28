-- AlterTable
ALTER TABLE "PromptSession" ADD COLUMN     "authorId" UUID;

-- AddForeignKey
ALTER TABLE "PromptSession" ADD CONSTRAINT "PromptSession_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
