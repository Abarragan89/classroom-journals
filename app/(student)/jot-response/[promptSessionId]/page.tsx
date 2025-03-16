import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { PromptSession, Question, Session } from "@/types";
import { notFound } from "next/navigation";
import PromptResponseEditor from "@/components/shared/prompt-response-editor";

export default async function StudentDashboard({
    params
}: {
    params: Promise<{ promptSessionId: string }>
}) {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const classroomId = session?.classroomId

    const { promptSessionId } = await params


    const promptSessionData = await prisma.promptSession.findUnique({
        where: {
            id: promptSessionId,
            classId: classroomId
        },

    }) as unknown as PromptSession

    if (!promptSessionData) return;

    const questions = promptSessionData?.questions as unknown as Question[]

    return (
        <div>
            <Header session={session} />
            <main className="wrapper">
            <PromptResponseEditor 
                questions={questions}
                studentId={studentId}
            />
            </main>
        </div>
    )
}
