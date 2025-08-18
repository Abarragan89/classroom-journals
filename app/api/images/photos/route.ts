import { NextResponse } from 'next/server';
import { getAllPhotos } from '@/lib/server/images';

export async function GET() {
    try {
        const photos = await getAllPhotos();

        return NextResponse.json({ photos });
    } catch (error) {
        console.error('Error fetching photos:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
