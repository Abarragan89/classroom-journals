import { NextRequest, NextResponse } from 'next/server';
import { getRubricGradesForResponse } from '@/lib/server/rubrics';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ responseId: string }> }
) {
    try {
        const { responseId } = await params;

        const rubricGrades = await getRubricGradesForResponse(responseId);

        return NextResponse.json({ rubricGrades });
    } catch (error) {
        console.error('Error fetching rubric grades for response:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized') {
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
