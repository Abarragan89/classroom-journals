import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

// GET /api/lessons — list all lessons for the authenticated teacher
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lessons = await prisma.lesson.findMany({
            where: { teacherId: session.user.id },
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

        return NextResponse.json({ lessons });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
