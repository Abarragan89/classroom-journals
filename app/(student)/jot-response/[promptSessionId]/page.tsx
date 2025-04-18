import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { PromptSession, ResponseData, Session } from "@/types";
import { notFound } from "next/navigation";
import MultipleQuestionEditor from "@/components/shared/prompt-response-editor/multiple-question-editor";
import SinglePromptEditor from "@/components/shared/prompt-response-editor/single-question-editor";
import { determineSubscriptionAllowance } from "@/lib/actions/profile.action";

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

    let questions = promptSessionData?.questions as unknown as ResponseData[]
    questions = questions.map(q => ({ ...q, answer: '', })) as unknown as ResponseData[]

    const { userId: teacherId } = await prisma.classUser.findFirst({
        where: {
            classId: classroomId,
            role: 'teacher'
        },
        select: {
            userId: true
        }
    }) as { userId: string }

    const { isSubscriptionActive } = await determineSubscriptionAllowance(teacherId)

    console.log('isSubscription activ e', isSubscriptionActive)

    const { grade } = await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: {
            grade: true
        }
    }) as { grade: string }

    console.log('grade ', grade)

    return (
        <div>
            <Header session={session} />
            <main className="wrapper">
                {promptSessionData.promptType === 'multi-question' ?
                    <MultipleQuestionEditor
                        questions={questions}
                        studentId={studentId}
                        isTeacherPremium={isSubscriptionActive as boolean}
                        gradeLevel={grade}
                    />
                    :
                    <SinglePromptEditor
                        questions={questions}
                        studentId={studentId}
                    />
                }
            </main>
        </div>
    )
}
