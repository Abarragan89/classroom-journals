import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { Session } from '@/types';
import { prisma } from '@/db/prisma';
import PresenterClient from './presenter-client';

export default async function PresentPage({
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

  const [lesson, lessonSession] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId, teacherId },
      include: {
        slides: {
          orderBy: { order: 'asc' },
          include: { checkpoint: true },
        },
      },
    }),
    prisma.lessonSession.findUnique({
      where: { id: sessionId },
    }),
  ]);

  if (!lesson || !lessonSession) return notFound();

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <PresenterClient lesson={lesson as any} sessionId={sessionId} classroomId={lessonSession.classroomId} />
  );
}
