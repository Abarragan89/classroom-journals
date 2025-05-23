import { auth } from "@/auth";
import { DiscussionSidebar } from "@/components/shared/discussion-sidebar";
import Header from "@/components/shared/header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSinglePromptSessionStudentDiscussion } from "@/lib/actions/prompt.session.actions";
import { PromptSession, Session } from "@/types";
import { notFound } from "next/navigation";


export default async function StudentDashboardLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode,
    params: Promise<{ sessionId: string }>
}>,
) {

    const session = await auth() as Session

    if (!session) return notFound()

    const classId = session?.classroomId as string

    const { sessionId } = await params;

    const promptSession = await getSinglePromptSessionStudentDiscussion(sessionId, classId) as unknown as PromptSession

    return (
        <SidebarProvider>
            <DiscussionSidebar prompt_data={promptSession as unknown as PromptSession} />
            <SidebarInset>
                <Header
                    session={session as Session}
                    studentId={session?.user?.id}
                />
                <div className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger size='sm' className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
                <main className="wrapper">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
