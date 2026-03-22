export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return new Response('Missing url parameter', { status: 400 });
    }

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
        },
    });
}