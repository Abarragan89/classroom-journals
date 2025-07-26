-- CreateTable
CREATE TABLE "RubricTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rubric" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricTemplate_pkey" PRIMARY KEY ("id")
);
