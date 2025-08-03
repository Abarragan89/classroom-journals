-- AlterTable
ALTER TABLE "User" ADD COLUMN     "purchasedCredits" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "openAIAllowance" SET DEFAULT 3;
