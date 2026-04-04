import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

// GET /api/lessons/sessions?classroomId=xxx — get active session for a classroom
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classroomId = req.nextUrl.searchParams.get('classroomId');
    if (!classroomId) {
      return NextResponse.json({ error: 'Missing classroomId' }, { status: 400 });
    }

    const activeSession = await prisma.lessonSession.findFirst({
      where: { classroomId, isActive: true },
      include: {
        lesson: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ session: activeSession });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
