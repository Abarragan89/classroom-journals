import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {

    // BLock all unauthorized db calls 
    const { pathname } = request.nextUrl

    const publicPaths = [
        '/', // Home route
        '/privacy-policy',
        '/terms-of-service',
        '/sign-in',
        '/api/auth/callback/google',
    ];

    const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
    );

    if (!isPublicPath) {
        // Check your auth cookie(s)
        const sessionToken =
            request.cookies.get('authjs.session-token')?.value

        if (!sessionToken) {
            // No session → redirect to landing (or return 403)
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    // Apply Content Security Policy (CSP)
    let cspHeader = '';
    if (process.env.NODE_ENV === 'production') {
        cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://vercel.live/_next-live/feedback/;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://unfinished-pages.s3.us-east-2.amazonaws.com https://*.googleusercontent.com https://*.yahoo.com https://*.outlook.com https://authjs.dev/;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        worker-src 'self' blob:;
        frame-src https://vercel.live/;
        connect-src 'self' blob:;
        upgrade-insecure-requests;
    `;
    }
    const response = NextResponse.next();
    const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
    response.headers.set('x-nonce', nonce);

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)', // Apply middleware to all routes
    ],
};
