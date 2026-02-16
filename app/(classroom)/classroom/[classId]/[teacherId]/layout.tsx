import { AppSidebar } from "@/components/shared/teacher-sidebar/classroom-teacher-sidebar";
import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { notFound } from "next/navigation";
import { Classroom, Session } from "@/types";
import { getAllClassrooms, getSingleClassroom, getAllStudents } from "@/lib/server/classroom";
import DynamicHeader from "@/components/dynamic-header";
import { determineSubscriptionAllowance } from "@/lib/server/profile";
import { Suspense } from "react";
import Loading from "@/app/loading";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import { getAllTeacherPrompts } from "@/lib/server/prompts";
import { getAllSessionsInClass } from "@/lib/server/prompt-sessions";

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

    const { classId } = await params
    if (!classId) return notFound()

    // Parallel queries - only fetch what's needed
    const [teacherClasses, classroomData, subscriptionData, studentCount, teacherJotsData, assignmentsData] = await Promise.all([
        getAllClassrooms(teacherId),
        getSingleClassroom(classId, teacherId), // Already includes auth check
        determineSubscriptionAllowance(teacherId),
        getAllStudents(classId, teacherId).then(students => students.length),
        getAllTeacherPrompts(teacherId),
        getAllSessionsInClass(classId, teacherId),
    ]);

    // getSingleClassroom returns null if not authorized
    if (!classroomData) {
        return notFound()
    }

    const { isAllowedToMakeNewClass } = subscriptionData

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
                    <Suspense fallback={<div className="h-10" />}>
                        <DynamicHeader
                            classId={classId}
                            teacherId={teacherId}
                        />
                    </Suspense>
                    <h1 className="h1-bold mt-2 text-muted-foreground line-clamp-1 print:hidden">{classroomData.name}</h1>
                    <Suspense fallback={<Loading />}>
                        {children}
                    </Suspense>
                </main>
            </SidebarInset>

            {/* Persistent Onboarding Toast */}
            <OnboardingFlow
                classId={classId}
                teacherId={teacherId}
                initialStudentCount={studentCount}
                initialJotCount={(teacherJotsData as { totalCount: number }).totalCount}
                initialAssignmentCount={(assignmentsData as { totalCount: number }).totalCount}
            />
        </SidebarProvider>
    );
}