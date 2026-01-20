import NextAuth, { DefaultSession } from "next-auth";
// import Sendgrid from "next-auth/providers/sendgrid";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./types";
import { decryptText, encryptText } from "./lib/utils";
import crypto from 'crypto';
import { ClassUserRole } from "@prisma/client";

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string | unknown; // Extend session type to include accessToken
        refreshToken?: string | unknown; // Extend session type to include refreshToken
        refraccessTokenExpires?: string | unknown
        googleProviderId?: string | unknown
        iv?: Buffer | unknown
        username?: string
        classroomId?: string // Add classroomId to session
        teacherId?: string // Add teacherId to session
    }
    interface User {
        iv?: string;
        username?: string,
        role?: string,
        classroomId?: string // Add classroomId to user
        teacherId?: string // Add teacherId to user
        avatarURL?: string // Add avatarURL to user
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
        Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: `"JotterBlog" <${process.env.RESEND_ACCOUNT_EMAIL}>`
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
        CredentialsProvider({
            name: "Student Login",
            credentials: {
                classCode: { label: "Class Code", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                const classCode = credentials?.classCode as string;
                const password = credentials?.password as string

                if (!classCode || !password) {
                    throw new Error("Missing class code or password.");
                }

                // Find the classroom by class code
                const classroom = await prisma.classroom.findUnique({
                    where: { classCode: classCode.trim() as string },
                    select: {
                        id: true,
                        users: {
                            where: {
                                role: ClassUserRole.STUDENT,
                            },
                            select: { userId: true }
                        },

                    }
                });

                // return if no classroom found
                if (!classroom) {
                    throw new Error("Classroom not found.");
                }

                // get all Student Ids
                const studentIds = classroom?.users.map(student => student.userId)
                const allStudents = await prisma.user.findMany({
                    where: { id: { in: studentIds } },
                    select: {
                        password: true,
                        username: true,
                        name: true,
                        id: true,
                        iv: true,
                        avatarURL: true,
                    }
                })

                // Find student within the class
                const loggedInStudent = allStudents.find(student => decryptText(student.password as string, student.iv as string) === password) as User

                if (!loggedInStudent) {
                    throw new Error("Invalid password or not a student in this class.");
                }

                // Attach the teacher ID
                const teacher = await prisma.classUser.findFirst({
                    where: {
                        classId: classroom.id,
                        role: ClassUserRole.TEACHER,
                    },
                    select: {
                        userId: true,
                    },
                })

                // if no teacher found, throw error
                if (!teacher) {
                    throw new Error("Teacher not found.");
                }

                return {
                    id: loggedInStudent.id,
                    name: loggedInStudent.name,
                    username: loggedInStudent.username,
                    avatarURL: loggedInStudent.avatarURL,
                    role: 'STUDENT',
                    classroomId: classroom.id,
                    iv: loggedInStudent.iv,
                    teacherId: teacher.userId
                };
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
        // user only comes back when loggin in with  GOogle
        async session({ session, user, trigger, token }) {
            if (session.user) {
                // getRefresh
                session.refreshToken = token.refreshToken
                session.refraccessTokenExpires = token.refraccessTokenExpires
                // Set up the google classroom credentials for query 
                session.googleProviderId = token?.googleProviderID ?? '';
                session.accessToken = token.accessToken;
                // Set the user ID from the token
                // @ts-expect-error: let there be any here
                session.user.id = token.sub;
                session.user.role = token?.email ? 'TEACHER' : 'STUDENT';
                session.user.name = token.name;
                session.user.username = token.username as string;
                session.user.avatarURL = token.avatarURL as string;

                // Setting the classroomId and teacherId for student sessions
                if (token?.classroomId) {
                    session.classroomId = token.classroomId as string
                }
                if (token?.teacherId) {
                    session.teacherId = token.teacherId as string
                }
            }

            return session
        },
        async jwt({ token, user, trigger, account, session }) {
            try {
                // Handle session updates from update() calls
                if (trigger === 'update' && session?.user) {
                    if (session.user.avatarURL) {
                        token.avatarURL = session.user.avatarURL
                    }
                    if (session.user.name) {
                        token.name = session.user.name
                    }
                }

                if (user) {
                    if (account) {
                        // pass the accessToken and provierAccount ID to the token to pass to the session
                        token.googleProviderID = account?.provider === 'google' ? account?.providerAccountId : '';
                        token.accessToken = account.access_token;
                        token.refreshToken = account.refresh_token; // Store refresh token
                        token.accessTokenExpires = Date.now() + account.expires_at! * 1000; // used to create a new token
                        // Store student-specific data in token
                        if (user?.classroomId) {
                            token.classroomId = user.classroomId
                        }
                        if (user?.teacherId) {
                            token.teacherId = user.teacherId
                        }
                    }

                    if (trigger === 'signUp') {
                        // if signing up, encrypt name and save name and iv(random string) 
                        const iv = crypto.randomBytes(16);
                        // Encrypt the user name
                        const { encryptedData } = encryptText(user.name!, iv);
                        token.name = user.name;
                        token.iv = iv.toString('hex');

                        // Set premium subscription expiration to 14 days from now
                        const premiumExpiresAt = new Date();
                        premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 14);

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                name: encryptedData,
                                username: encryptedData,
                                iv: token.iv as string,
                                accountType: 'PREMIUM',
                                subscriptionExpires: premiumExpiresAt
                            }
                        })
                    } else if (trigger === 'signIn') {
                        // If signing back in, just set the token to the user name that is already encyrpted
                        token.name = decryptText(user.name as string, user.iv as string)
                        token.username = decryptText(user.username as string, user.iv as string)
                        token.avatarURL = user.avatarURL
                    }
                }
            } catch (error) {
                console.error('erroring signing in ', error)
            }
            return token
            //assign user fields to the token
        },
        async redirect({ url, baseUrl }) {
            // Ensure the user is redirected to a valid page after signing in
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
    }
})

