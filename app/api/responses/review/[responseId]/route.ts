import { NextRequest, NextResponse } from 'next/server';
import { getSingleResponseForReview } from '@/lib/server/responses';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ responseId: string }> }
) {
    try {
        const { responseId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const response = await getSingleResponseForReview(responseId, userId);

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error fetching single response:', error);

        if (error instanceof Error) {
            if (error.message === 'Forbidden') {
                return NextResponse.json(
                    { error: 'Forbidden' },
                    { status: 403 }
                );
            }
            if (error.message === 'Response Id required') {
                return NextResponse.json(
                    { error: 'Response ID is required' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
