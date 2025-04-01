-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commentCoolDown" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastComment" TIMESTAMP(3);
