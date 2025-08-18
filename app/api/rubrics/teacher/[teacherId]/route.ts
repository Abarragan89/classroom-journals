import { NextRequest, NextResponse } from 'next/server';
import { getRubricListByTeacherId } from '@/lib/server/rubrics';

export async function GET(
    request: NextRequest,
    { params }: { params: { teacherId: string } }
) {
    try {
        const { teacherId } = await params;

        const rubrics = await getRubricListByTeacherId(teacherId);

        return NextResponse.json({ rubrics });
    } catch (error) {
        console.error('Error fetching rubric list for teacher:', error);

        if (error instanceof Error) {
            if (error.message === 'Forbidden') {
                return NextResponse.json(
                    { error: 'Forbidden' },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
