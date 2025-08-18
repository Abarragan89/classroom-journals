import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { Response, ResponseData, Session } from "@/types";
import { notFound } from "next/navigation";
import MultipleQuestionEditor from "@/components/shared/prompt-response-editor/multiple-question-editor";
import SinglePromptEditor from "@/components/shared/prompt-response-editor/single-question-editor";
import { determineSubscriptionAllowance } from "@/lib/server/profile";
import { getClassroomGrade } from "@/lib/server/student-dashboard";
import { getSingleResponseForReview } from "@/lib/server/responses";

export default async function StudentDashboard({
    params
}: {
    params: Promise<{ responseId: string }>
}) {

    const session = await auth() as Session

    if (!session) return notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'STUDENT' || !studentId) {
        return notFound()
    }
    const classroomId = session?.classroomId
    const teacherId = session?.teacherId

    const { responseId } = await params

    const [studentResponse, { isPremiumTeacher }, grade] = await Promise.all([
        getSingleResponseForReview(responseId, studentId) as unknown as Response,
        determineSubscriptionAllowance(teacherId as string),
        getClassroomGrade(classroomId as string)
    ])

    return (
        <div>
            <Header session={session} />
            <main className="wrapper">
                {studentResponse?.promptSession?.promptType === 'ASSESSMENT' ?
                    <MultipleQuestionEditor
                        responseId={studentResponse.id}
                        studentResponse={studentResponse.response as unknown as ResponseData[]}
                        isTeacherPremium={isPremiumTeacher as boolean}
                        gradeLevel={grade as string}
                        spellCheckEnabled={studentResponse?.spellCheckEnabled}
                        studentId={studentId}
                    />
                    :
                    <SinglePromptEditor
                        studentResponse={studentResponse.response as unknown as ResponseData[]}
                        responseId={responseId}
                        spellCheckEnabled={studentResponse?.spellCheckEnabled}
                        studentId={studentId}
                    />
                }
            </main>
        </div>
    )
}
