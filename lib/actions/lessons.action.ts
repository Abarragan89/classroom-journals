'use server';

import { prisma } from '@/db/prisma';
import { requireAuth } from './authorization.action';
import { Prisma, LessonStatus, SlideType } from '@prisma/client';

export interface SlideContent {
  html: string;
  notes?: string;
  backgroundImage?: string;
}

export interface SlideInput {
  id?: string;
  order: number;
  type: SlideType;
  content: SlideContent;
  checkpoint?: {
    id?: string;
    question: string;
  };
}

// ── Lesson CRUD ───────────────────────────────────────────────────────────────

export async function createLesson(title: string) {
  const session = await requireAuth();
  const teacherId = session.user.id!;

  return prisma.lesson.create({
    data: { title, teacherId },
    select: { id: true, title: true, status: true, createdAt: true },
  });
}

export async function updateLesson(
  lessonId: string,
  data: { title?: string; status?: LessonStatus },
) {
  const session = await requireAuth();
  const teacherId = session.user.id!;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.teacherId !== teacherId) throw new Error('Forbidden');

  await prisma.lesson.update({ where: { id: lessonId }, data });
}

export async function deleteLesson(lessonId: string) {
  const session = await requireAuth();
  const teacherId = session.user.id!;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.teacherId !== teacherId) throw new Error('Forbidden');

  await prisma.lesson.delete({ where: { id: lessonId } });
}

// ── Slide Management ─────────────────────────────────────────────────────────

export async function saveSlides(lessonId: string, slides: SlideInput[]) {
  const session = await requireAuth();
  const teacherId = session.user.id!;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.teacherId !== teacherId) throw new Error('Forbidden');

  await prisma.$transaction(async (tx) => {
    // Remove deleted slides (those whose IDs are no longer present)
    const keptIds = slides
      .map((s) => s.id)
      .filter((id): id is string => !!id);

    await tx.checkpoint.deleteMany({
      where: { slide: { lessonId, id: { notIn: keptIds } } },
    });
    await tx.lessonSlide.deleteMany({
      where: { lessonId, id: { notIn: keptIds } },
    });

    // Upsert each slide
    for (const slide of slides) {
      const upsertedSlide = await tx.lessonSlide.upsert({
        where: { id: slide.id ?? '' },
        create: {
          lessonId,
          order: slide.order,
          type: slide.type,
          content: slide.content as unknown as Prisma.InputJsonValue,
        },
        update: {
          order: slide.order,
          type: slide.type,
          content: slide.content as unknown as Prisma.InputJsonValue,
        },
      });

      if (slide.type === SlideType.CHECKPOINT && slide.checkpoint) {
        await tx.checkpoint.upsert({
          where: { slideId: upsertedSlide.id },
          create: {
            slideId: upsertedSlide.id,
            question: slide.checkpoint.question,
          },
          update: { question: slide.checkpoint.question },
        });
      }
    }
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function startLessonSession(
  lessonId: string,
  classroomId: string,
) {
  const session = await requireAuth();
  const teacherId = session.user.id!;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.teacherId !== teacherId) throw new Error('Forbidden');

  // Close any existing active session for this classroom
  await prisma.lessonSession.updateMany({
    where: { classroomId, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  });

  const newSession = await prisma.lessonSession.create({
    data: { lessonId, classroomId },
    select: { id: true },
  });

  // Mark lesson as active
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: LessonStatus.ACTIVE },
  });

  return newSession;
}

export async function endLessonSession(sessionId: string) {
  const session = await requireAuth();
  const teacherId = session.user.id!;

  const lessonSession = await prisma.lessonSession.findUnique({
    where: { id: sessionId },
    include: { lesson: { select: { teacherId: true } } },
  });
  if (!lessonSession || lessonSession.lesson.teacherId !== teacherId)
    throw new Error('Forbidden');

  await prisma.lessonSession.update({
    where: { id: sessionId },
    data: { isActive: false, endedAt: new Date() },
  });

  await prisma.lesson.update({
    where: { id: lessonSession.lessonId },
    data: { status: LessonStatus.COMPLETED },
  });
}

export async function submitCheckpointAnswer(
  sessionId: string,
  checkpointId: string,
  answer: string,
) {
  const session = await requireAuth();
  const studentId = session.user.id!;

  await prisma.checkpointResponse.upsert({
    where: { sessionId_checkpointId_studentId: { sessionId, checkpointId, studentId } },
    create: { sessionId, checkpointId, studentId, answer },
    update: { answer, submittedAt: new Date() },
  });
}
