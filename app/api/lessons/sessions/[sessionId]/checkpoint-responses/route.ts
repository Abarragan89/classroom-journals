import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

// POST — student submits a checkpoint answer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const { checkpointId, answer } = await req.json();

    if (!checkpointId || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const studentId = session.user.id;

    await prisma.checkpointResponse.upsert({
      where: {
        sessionId_checkpointId_studentId: { sessionId, checkpointId, studentId },
      },
      create: { sessionId, checkpointId, studentId, answer },
      update: { answer, submittedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET — teacher fetches all responses for a session
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    const lessonSession = await prisma.lessonSession.findUnique({
      where: { id: sessionId },
      include: { lesson: { select: { teacherId: true } } },
    });

    if (!lessonSession) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (lessonSession.lesson.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const responses = await prisma.checkpointResponse.findMany({
      where: { sessionId },
      include: {
        student: { select: { id: true, name: true, username: true } },
        checkpoint: { select: { question: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return NextResponse.json({ responses });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
