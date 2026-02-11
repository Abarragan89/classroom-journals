// proxy.ts (formerly middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server";

// Next.js 16 uses 'proxy' as the standard entry point
export async function proxy(request: NextRequest) {
    const response = NextResponse.next();

    if (process.env.NODE_ENV === 'production') {
        // Enforce HTTPS
        const proto = request.headers.get('x-forwarded-proto');
        if (proto !== 'https') {
            return new NextResponse('HTTPS required', { status: 400 });
        }

        const { pathname } = request.nextUrl;
        // Skip CSP for API and static internal routes
        if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
            const cspHeader = `
                default-src 'self';
                script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://vercel.live https://static.cloudflareinsights.com;
                style-src 'self' 'unsafe-inline';
                img-src 'self' blob: data: https://unfinished-pages.s3.us-east-2.amazonaws.com https://*.googleusercontent.com https://*.yahoo.com https://*.outlook.com https://authjs.dev https://i.ytimg.com;
                font-src 'self' data:;
                object-src 'none';
                frame-src https://www.youtube-nocookie.com https://vercel.live;
                base-uri 'self';
                form-action 'self';
                frame-ancestors 'none';
                worker-src 'self' blob:;
                connect-src 'self' blob:;
                upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim();

            response.headers.set('Content-Security-Policy', cspHeader);
        }
    }

    return response;
}

// Config remains the same in Next.js 16
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