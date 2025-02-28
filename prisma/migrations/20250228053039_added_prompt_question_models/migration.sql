/*
  Warnings:

  - The primary key for the `CommentLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CommentLike` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PostLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PostLike` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CommentLike" DROP CONSTRAINT "CommentLike_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Prompt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "promptId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
