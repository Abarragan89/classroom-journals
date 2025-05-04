-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('INCOMPLETE', 'COMPLETE', 'RETURNED');

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "completionStatus" "ResponseStatus" NOT NULL DEFAULT 'INCOMPLETE';
