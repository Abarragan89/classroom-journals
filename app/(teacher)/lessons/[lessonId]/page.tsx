import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { Session } from '@/types';
import { prisma } from '@/db/prisma';
import LessonEditorClient from './editor-client';

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
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

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, teacherId },
    include: {
      slides: {
        orderBy: { order: 'asc' },
        include: { checkpoint: true },
      },
    },
  });

  if (!lesson) return notFound();

  // Fetch classrooms for the "Start session" dialog
  const classrooms = await prisma.classUser.findMany({
    where: { userId: teacherId, role: 'TEACHER' },
    select: { class: { select: { id: true, name: true, period: true } } },
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <LessonEditorClient lesson={lesson as any} classrooms={classrooms.map((cu) => cu.class)} />
  );
}
