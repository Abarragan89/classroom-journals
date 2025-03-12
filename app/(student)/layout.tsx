import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { notFound } from "next/navigation";
import { Session } from "@/types";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/db/prisma";


export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }


    // Check if the authenticated teacher is part of the classroom and has the role of 'teacher'
    const currentClass = await prisma.classUser.findFirst({
        where: {
            userId: studentId,
            role: 'student'
        },
        include: {
            class: {
                include: {
                    PromptSession: true
                }
            }
        }
    });

    if (!currentClass) notFound()

    return (
        <>
            <Header session={session} />
            <main className="wrapper">
                <Link href={'/classes'} className="flex items-center hover:underline w-fit">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all classes
                </Link>
                <h1 className="h1-bold mt-2 line-clamp-1">{currentClass.class.name}</h1>
                {children}
            </main>
        </>
    );
}