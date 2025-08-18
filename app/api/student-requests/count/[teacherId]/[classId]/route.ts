import { NextRequest, NextResponse } from 'next/server';
import { getStudentRequestCount } from '@/lib/server/student-requests';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teacherId: string; classId: string }> }
) {
    try {
        const { teacherId, classId } = await params;

        const count = await getStudentRequestCount(teacherId, classId);

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching student request count:', error);

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
