import { NextRequest, NextResponse } from 'next/server';
import { getStudentRequests } from '@/lib/server/student-dashboard';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;

        const studentRequests = await getStudentRequests(studentId);

        return NextResponse.json({ studentRequests });
    } catch (error) {
        console.error('Error fetching student requests:', error);

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
