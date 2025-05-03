import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { PromptSession, Response, ResponseData, Session } from "@/types";
import { notFound } from "next/navigation";
import MultipleQuestionEditor from "@/components/shared/prompt-response-editor/multiple-question-editor";
import SinglePromptEditor from "@/components/shared/prompt-response-editor/single-question-editor";
import { determineSubscriptionAllowance } from "@/lib/actions/profile.action";
import { getClassroomGrade, getTeacherId } from "@/lib/actions/student.dashboard.actions";
import { InputJsonArray } from "@prisma/client/runtime/library";

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


    // const promptSessionData = await prisma.promptSession.findUnique({
    //     where: {
    //         id: promptSessionId,
    //         classId: classroomId
    //     },

    // }) as unknown as PromptSession

    const promptSessionData = await prisma.promptSession.findUnique({
        where: {
            id: promptSessionId,
            classId: classroomId,
        },
        select: {
            promptType: true,
            id: true,
            questions: true,
            responses: {
                where: {
                    studentId: studentId,
                },
                take: 1, // Just get the first if there's only one per student
            },
        },
    }) as unknown as PromptSession & { responses: Response[] };

    if (!promptSessionData) return;

    let questions = promptSessionData?.questions as unknown as ResponseData[]
    questions = questions.map(q => ({ ...q, answer: '', })) as unknown as ResponseData[]


    console.log('prompt session data ', promptSessionData)
    let studentResponse = promptSessionData?.responses[0] as Response

    if (!studentResponse) {
        console.log('response inside the if statement', studentResponse)
        studentResponse = await prisma.response.create({
            data: {
                promptSessionId: promptSessionId,
                studentId: studentId,
                response: promptSessionData.questions as InputJsonArray,
            },
        }) as unknown as Response;
    }

    console.log('student response after the if statement ', studentResponse)

    const teacherId = await getTeacherId(classroomId as string)

    const { isSubscriptionActive } = await determineSubscriptionAllowance(teacherId as string)
    const grade = await getClassroomGrade(classroomId as string)

    return (
        <div>
            <Header session={session} />
            <main className="wrapper">
                {promptSessionData.promptType === 'multi-question' ?
                    <MultipleQuestionEditor
                        questions={questions}
                        studentResponse={studentResponse as Response}
                        isTeacherPremium={isSubscriptionActive as boolean}
                        gradeLevel={grade as string}
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
