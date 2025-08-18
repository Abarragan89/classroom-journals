import { NextResponse } from 'next/server';
import { getAllAvatarPhotos } from '@/lib/server/images';

export async function GET() {
    try {
        const avatars = await getAllAvatarPhotos();

        return NextResponse.json({ avatars });
    } catch (error) {
        console.error('Error fetching avatar photos:', error);

        if (error instanceof Error) {
            if (error.message === 'Unauthorized' || error.message.includes('auth')) {
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
