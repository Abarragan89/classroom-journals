import { NextRequest, NextResponse } from 'next/server';
import { getFilteredStudentResponses } from '@/lib/server/responses';
import { SearchOptions } from '@/types';

export async function POST(
    request: NextRequest,
    { params }: { params: { studentId: string } }
) {
    try {
        const { studentId } = await params;
        const filterOptions: SearchOptions = await request.json();

        const responses = await getFilteredStudentResponses(filterOptions, studentId);

        return NextResponse.json({ responses });
    } catch (error) {
        console.error('Error fetching filtered student responses:', error);

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
