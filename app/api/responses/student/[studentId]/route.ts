import { NextRequest, NextResponse } from 'next/server';
import { getSingleStudentResponses } from '@/lib/server/responses';

export async function GET(
    request: NextRequest,
    { params }: { params: { studentId: string } }
) {
    try {
        const { studentId } = await params;
        const responses = await getSingleStudentResponses(studentId);

        return NextResponse.json({ responses });
    } catch (error) {
        console.error('Error fetching student responses:', error);

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
