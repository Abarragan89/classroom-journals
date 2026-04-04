import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { Session } from '@/types';
import { prisma } from '@/db/prisma';
import SessionReportClient from './report-client';

export default async function SessionReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const session = (await auth()) as Session;
  if (!session) return notFound();

  const teacherId = session?.user?.id as string;
  if (
    !teacherId ||
    (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN')
  )
    return notFound();

  const { lessonId } = await params;
  const { sessionId } = await searchParams;
  if (!sessionId) return notFound();

  const lessonSession = await prisma.lessonSession.findUnique({
    where: { id: sessionId },
    include: {
      lesson: {
        select: { id: true, title: true, teacherId: true },
      },
      responses: {
        include: {
          student: { select: { id: true, name: true, username: true } },
          checkpoint: {
            select: { question: true, slideId: true },
          },
        },
        orderBy: { submittedAt: 'asc' },
      },
    },
  });

  if (!lessonSession || lessonSession.lesson.teacherId !== teacherId)
    return notFound();

  // Get student count from classroom
  const studentCount = await prisma.classUser.count({
    where: { classId: lessonSession.classroomId, role: 'STUDENT' },
  });

  return (
    <SessionReportClient
      lessonSession={lessonSession}
      studentCount={studentCount}
    />
  );
}
