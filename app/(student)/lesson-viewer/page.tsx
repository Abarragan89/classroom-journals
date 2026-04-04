import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { Session } from '@/types';
import { prisma } from '@/db/prisma';
import StudentViewerClient from './viewer-client';

export default async function LessonViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const session = (await auth()) as Session;
  if (!session) return notFound();

  const { sessionId } = await searchParams;
  if (!sessionId) return notFound();

  const studentId = session?.user?.id as string;
  const classroomId = session?.classroomId;

  if (!studentId || !classroomId) return notFound();

  // Verify the session is active and this student is in the classroom
  const lessonSession = await prisma.lessonSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
      classroom: {
        users: { some: { userId: studentId } },
      },
    },
    include: {
      lesson: {
        include: {
          slides: {
            orderBy: { order: 'asc' },
            include: { checkpoint: true },
          },
        },
      },
    },
  });

  if (!lessonSession) return notFound();

  return (
    <StudentViewerClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lesson={lessonSession.lesson as any}
      sessionId={sessionId}
      studentId={studentId}
      studentName={session.user.name ?? session.user.username ?? 'Student'}
      initialSlideIndex={lessonSession.currentSlideIndex}
    />
  );
}
