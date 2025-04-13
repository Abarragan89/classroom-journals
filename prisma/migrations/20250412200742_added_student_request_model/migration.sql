-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "author" TEXT;

-- CreateTable
CREATE TABLE "StudentRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
