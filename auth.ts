import NextAuth, { DefaultSession } from "next-auth"
import Sendgrid from "next-auth/providers/sendgrid"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma";


declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string | unknown; // Extend session type to include accessToken
        refreshToken?: string | unknown; // Extend session type to include refreshToken
        refraccessTokenExpires?: string | unknown
        googleProviderId?: string | unknown
    }
    interface JWT {
        accessToken?: string | unknown; // Extend JWT type to include accessToken
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
        Sendgrid({
            apiKey: process.env.AUTH_SENDGRID_KEY,
            from: "customer.team@math-fact-missions.com"
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly"
                },
            },
        }),
    ],
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 days 
    },
    callbacks: {
        async session({ session, user, trigger, token }) {
            if (session.user) {
                // getRefresh
                session.refreshToken = token.refreshToken
                session.refraccessTokenExpires = token.refraccessTokenExpires
                // Set up the google classroom credentials for query 
                session.googleProviderId = token.googleProviderID;
                session.accessToken = token.accessToken;
                // Set the user ID from the token
                // @ts-expect-error: let there be any here
                session.user.id = token.sub;
                // @ts-expect-error: let there be any here
                session.user.role = token.role;
                session.user.name = token.name;
            }
            // It there is an update, set the user name
            if (trigger === 'update') {
                session.user.name = user.name
            }

            return session
        },
        async jwt({ token, user, trigger, session, account }) {
            //assign user fields to the token
            if (user) {
                if (account) {
                    // pass the accessToken and provierAccount ID to the token to pass to the session
                    token.googleProviderID = account.providerAccountId;
                    token.accessToken = account.access_token;
                    token.refreshToken = account.refresh_token; // Store refresh token
                    token.accessTokenExpires = Date.now() + account.expires_at! * 1000;
                }
                // @ts-expect-error: let there be any here
                token.role = user.role;
                // If user has no name, then use the email
                if (user.name === 'NO_NAME') {
                    // Assign Email to name
                    token.name = token.email!.split('@')[0];

                    // update database to reflect token name
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            name: token.name
                        }
                    })
                }
            }
            return token
        },
        async redirect({ url, baseUrl }) {
            // Ensure the user is redirected to a valid page after signing in
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
    }
})