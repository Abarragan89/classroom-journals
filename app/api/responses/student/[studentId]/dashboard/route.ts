import { NextRequest, NextResponse } from 'next/server';
import { getStudentResponsesDashboard } from '@/lib/server/responses';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {

        const { studentId } = await params
        const result = await getStudentResponsesDashboard(studentId);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching student responses dashboard:', error);

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
