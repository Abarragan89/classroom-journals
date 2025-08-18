import { NextRequest, NextResponse } from 'next/server';
import { getWPMClassHighScores } from '@/lib/server/typing-test';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string; userId: string }> }
) {
    try {
        const { classId, userId } = await params;

        const highScores = await getWPMClassHighScores(classId, userId);

        return NextResponse.json({ highScores });
    } catch (error) {
        console.error('Error fetching WPM class high scores:', error);

        if (error instanceof Error) {
            if (error.message === 'Forbidden' || error.message === 'Unauthorized' || error.message.includes('auth')) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
