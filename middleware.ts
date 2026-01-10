import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Only enforce HTTPS in production
    if (process.env.NODE_ENV === 'production') {
        const proto = request.headers.get('x-forwarded-proto');
        if (proto !== 'https') {
            return new NextResponse('HTTPS required', { status: 400 });
        }

        // Only apply CSP to HTML pages, not API routes or static assets
        const { pathname } = request.nextUrl;
        if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
            const cspHeader = `
                default-src 'self';
                script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://vercel.live/_next-live/feedback/;
                style-src 'self' 'unsafe-inline';
                img-src 'self' blob: data: https://unfinished-pages.s3.us-east-2.amazonaws.com https://*.googleusercontent.com https://*.yahoo.com https://*.outlook.com https://authjs.dev/;
                font-src 'self' data:;
                object-src 'none';
                base-uri 'self';
                form-action 'self';
                frame-ancestors 'none';
                worker-src 'self' blob:;
                frame-src https://vercel.live/;
                connect-src 'self' blob:;
                upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim();
            
            response.headers.set('Content-Security-Policy', cspHeader);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/',
        '/sign-in',
        '/classroom-quips',
        '/student-dashboard/:path*',
        '/student-profile/:path*',
        '/classes/:path*',
        '/classroom/:path*',
        '/discussion-board/:path*',
        '/jot-response/:path*',
        '/response-review/:path*',
        '/student-grades/:path*',
        '/student-notifications/:path*',
        '/typing-test/:path*',
        '/admin/:path*',
        '/prompt-form/:path*',
        '/prompt-library/:path*',
        '/teacher-account/:path*',
    ]
}