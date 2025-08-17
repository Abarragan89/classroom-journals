import { AppSidebar } from "@/components/shared/teacher-sidebar/classroom-teacher-sidebar";
import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { notFound } from "next/navigation";
import { Class, Classroom, Session } from "@/types";
import { getAllClassrooms, getSingleClassroom } from "@/lib/actions/classroom.actions";
import { prisma } from "@/db/prisma";
import DynamicHeader from "@/components/dynamic-header";
import { determineSubscriptionAllowance } from "@/lib/server/profile";
import { ClassUserRole } from "@prisma/client";

export default async function DashboardLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ classId: string }>
}>) {

    const session = await auth()

    if (!session) return notFound()

    const teacherId = session?.user?.id as string
    if (!teacherId) return notFound()

    // Get all classrooms to render 
    const teacherClasses = await getAllClassrooms(teacherId)

    const { classId } = await params
    if (!classId) return notFound()

    // Check if the authenticated teacher is part of the classroom and has the role of 'teacher'
    const isTeacherAuthorized = await prisma.classUser.findFirst({
        where: {
            classId: classId,
            userId: teacherId,
            role: ClassUserRole.TEACHER
        },
        select: { userId: true }
    });

    if (!isTeacherAuthorized) return notFound()


    const { isAllowedToMakeNewClass } = await determineSubscriptionAllowance(teacherId)
    // Get Class Data
    const classroomData = await getSingleClassroom(classId, teacherId) as Class;

    return (
        <SidebarProvider>
            <AppSidebar classes={teacherClasses as Classroom[]} />
            <SidebarInset>
                <Header
                    teacherId={teacherId}
                    session={session as Session}
                    isAllowedToMakeNewClass={isAllowedToMakeNewClass as boolean}
                />
                <div className="flex h-10 shrink-0 items-center gap-2 border-b px-4 print:hidden">
                    <SidebarTrigger size='sm' className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
                <main className="wrapper">
                    <DynamicHeader
                        classId={classId}
                        teacherId={teacherId}
                    />
                    <h1 className="h1-bold mt-2 line-clamp-1 print:hidden">{classroomData.name}</h1>
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}