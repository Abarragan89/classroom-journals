/*
  Warnings:

  - Added the required column `promptType` to the `PromptSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PromptSession" ADD COLUMN     "promptType" TEXT NOT NULL;
