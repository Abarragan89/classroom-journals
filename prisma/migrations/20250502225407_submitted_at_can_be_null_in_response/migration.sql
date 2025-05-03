-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "submittedAt" DROP NOT NULL,
ALTER COLUMN "isSubmittable" SET DEFAULT true;
