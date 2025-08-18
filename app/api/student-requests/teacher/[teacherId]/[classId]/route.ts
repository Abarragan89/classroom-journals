import { NextRequest, NextResponse } from 'next/server';
import { getTeacherRequests } from '@/lib/server/student-requests';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teacherId: string; classId: string }> }
) {
    try {
        const { teacherId, classId } = await params;

        const teacherRequests = await getTeacherRequests(teacherId, classId);

        return NextResponse.json({ teacherRequests });
    } catch (error) {
        console.error('Error fetching teacher requests:', error);

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
