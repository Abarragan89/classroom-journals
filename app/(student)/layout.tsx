import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { notFound } from "next/navigation";
import { Class, Classroom, Session } from "@/types";
import { getAllClassrooms, getSingleClassroom } from "@/lib/actions/classroom.actions";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/db/prisma";


export default async function DashboardLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ classId: string }>
}>) {

    const session = await auth() as Session
    console.log('sessiona in afj layout ', session)

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

    console.log('current class', currentClass)

    if (!currentClass) notFound()

    return (
        <>
            <Header />
            <main className="wrapper">
                <Link href={'/classes'} className="flex items-center hover:underline w-fit">
                    <ArrowLeftIcon className="mr-1" size={20} />Back to all classes
                </Link>
                {/* <h1 className="h1-bold mt-2 line-clamp-1">{classroomData.name}</h1>
            {children} */}
            </main>
        </>
    );
}