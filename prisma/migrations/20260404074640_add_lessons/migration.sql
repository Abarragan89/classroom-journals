-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('DRAFT', 'READY', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SlideType" AS ENUM ('CONTENT', 'CHECKPOINT');

-- CreateTable
CREATE TABLE "Lesson" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "teacherId" UUID NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSlide" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lessonId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "SlideType" NOT NULL DEFAULT 'CONTENT',
    "content" JSONB NOT NULL,

    CONSTRAINT "LessonSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slideId" UUID NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSession" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lessonId" UUID NOT NULL,
    "classroomId" UUID NOT NULL,
    "currentSlideIndex" INTEGER NOT NULL DEFAULT 0,
    "currentFragmentIndex" INTEGER NOT NULL DEFAULT -1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LessonSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointResponse" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "checkpointId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckpointResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonSlide_lessonId_order_idx" ON "LessonSlide"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_slideId_key" ON "Checkpoint"("slideId");

-- CreateIndex
CREATE INDEX "LessonSession_classroomId_isActive_idx" ON "LessonSession"("classroomId", "isActive");

-- CreateIndex
CREATE INDEX "CheckpointResponse_sessionId_checkpointId_idx" ON "CheckpointResponse"("sessionId", "checkpointId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckpointResponse_sessionId_checkpointId_studentId_key" ON "CheckpointResponse"("sessionId", "checkpointId", "studentId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSlide" ADD CONSTRAINT "LessonSlide_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "LessonSlide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointResponse" ADD CONSTRAINT "CheckpointResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LessonSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointResponse" ADD CONSTRAINT "CheckpointResponse_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointResponse" ADD CONSTRAINT "CheckpointResponse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
