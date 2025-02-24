import NextAuth from "next-auth"
import Sendgrid from "next-auth/providers/sendgrid"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Sendgrid({
            apiKey: process.env.AUTH_SENDGRID_KEY,
            from: "customer.team@math-fact-missions.com"
        }),
    ],
    pages: {
        signIn: '/sign-in',
        error: '/sign-in'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 days 
    },
    callbacks: {
        async session({ session, user, trigger, token }) {
            // Set the user ID from the token
            // @ts-expect-error: let there be any here
            session.user.id = token.sub;
            // @ts-expect-error: let there be any here
            session.user.role = token.role;
            session.user.name = token.name;
            // It there is an update, set the user name
            if (trigger === 'update') {
                session.user.name = user.name
            }
            return session
        },
        async jwt({ token, user, trigger, session }) {
            //assign user fields to the token
            if (user) {
                // @ts-expect-error: let there be any here
                token.role = user.role;

                // If user has no name, then use the email
                if (user.name === 'NO_NAME') {
                    // Assign Email to name
                    token.name = token.email!.split('@')[0];
                }
                // update database to reflect token name
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        name: token.name
                    }
                })
            }
            return token
        }
    }
})