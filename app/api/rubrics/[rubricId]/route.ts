import { NextRequest, NextResponse } from 'next/server';
import { getRubricById } from '@/lib/server/rubrics';

export async function GET(
    request: NextRequest,
    { params }: { params: { rubricId: string } }
) {
    try {
        const { rubricId } = await params;

        const rubric = await getRubricById(rubricId);

        return NextResponse.json({ rubric });
    } catch (error) {
        console.error('Error fetching rubric by ID:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            if (error.message === 'Rubric not found') {
                return NextResponse.json(
                    { error: 'Rubric not found' },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
