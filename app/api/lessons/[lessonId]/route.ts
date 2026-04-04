import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

// GET /api/lessons/[lessonId] — get a lesson with all slides + checkpoints
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        slides: {
          orderBy: { order: 'asc' },
          include: { checkpoint: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Students joined via a session may also need to read lesson content
    const isOwner = lesson.teacherId === session.user.id;
    if (!isOwner) {
      // Verify student is enrolled in a classroom that has an active session for this lesson
      const activeSession = await prisma.lessonSession.findFirst({
        where: {
          lessonId,
          isActive: true,
          classroom: {
            users: { some: { userId: session.user.id } },
          },
        },
      });
      if (!activeSession) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ lesson });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/lessons/[lessonId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

    if (!lesson) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (lesson.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
