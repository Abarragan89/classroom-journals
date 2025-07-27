-- CreateTable
CREATE TABLE "RubricTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "rubric" JSONB NOT NULL,
    "teacherId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RubricTemplate" ADD CONSTRAINT "RubricTemplate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
