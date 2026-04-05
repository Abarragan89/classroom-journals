import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

// GET /api/lessons/sessions/[sessionId] — get session details with checkpoint response counts
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
            include: {
                lesson: {
                    include: {
                        slides: {
                            orderBy: { order: 'asc' },
                            include: { checkpoint: true },
                        },
                    },
                },
                responses: {
                    select: {
                        checkpointId: true,
                        studentId: true,
                        answer: true,
                        submittedAt: true,
                    },
                },
            },
        });

        if (!lessonSession) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ lessonSession });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/lessons/sessions/[sessionId] — update current slide position (teacher)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await params;
        const { currentSlideIndex, currentFragmentIndex } = await req.json();

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

        await prisma.lessonSession.update({
            where: { id: sessionId },
            data: {
                ...(typeof currentSlideIndex === 'number' && { currentSlideIndex }),
                ...(typeof currentFragmentIndex === 'number' && { currentFragmentIndex }),
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
