import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { Session } from '@/types';
import { prisma } from '@/db/prisma';
import LessonsLibraryClient from './lessons-library-client';

export default async function LessonsPage() {
  const session = (await auth()) as Session;
  if (!session) return notFound();

  const teacherId = session?.user?.id as string;
  if (
    !teacherId ||
    (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN')
  )
    return notFound();

  const lessons = await prisma.lesson.findMany({
    where: { teacherId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { slides: true } },
    },
  });

  return <LessonsLibraryClient lessons={lessons} />;
}
