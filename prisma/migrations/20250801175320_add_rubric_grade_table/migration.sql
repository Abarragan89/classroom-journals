-- CreateTable
CREATE TABLE "RubricGrade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "responseId" UUID NOT NULL,
    "rubricId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "categories" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "maxTotalScore" INTEGER NOT NULL,
    "percentageScore" INTEGER NOT NULL,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RubricGrade_responseId_idx" ON "RubricGrade"("responseId");

-- CreateIndex
CREATE INDEX "RubricGrade_teacherId_idx" ON "RubricGrade"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricGrade_responseId_rubricId_key" ON "RubricGrade"("responseId", "rubricId");

-- AddForeignKey
ALTER TABLE "RubricGrade" ADD CONSTRAINT "RubricGrade_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricGrade" ADD CONSTRAINT "RubricGrade_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "RubricTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricGrade" ADD CONSTRAINT "RubricGrade_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
