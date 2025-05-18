import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Apply Content Security Policy (CSP)
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
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

    // Skip middleware logic in development
    if (process.env.NODE_ENV !== "production") {
        return response;
    }

    const PROTECTED_PATHS = [
        "/student-dashboard",
        "/classes",
        "/classroom",
        "/discussion-board",
        "/jot-response",
        "/my-work",
        "/response-review",
        "/student-grades",
        "/student-notifications",
        "/typing-test",
        "/admin",
        "/prompt-form",
        "/prompt-library",
        "/teacher-account"
    ];

    const { pathname } = request.nextUrl;
    const method = request.method;

    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

    if (
        process.env.NODE_ENV === "production" &&
        isProtected &&
        method !== "GET"
    ) {
        return new NextResponse("Method Not Allowed", { status: 405 });
    }

    if (!isProtected) return response;

    const sessionToken =
        request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
        const loginUrl = new URL("/", request.url);
        return NextResponse.redirect(loginUrl);
    }
    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)', // Apply middleware to all routes
    ],
};