'use client'
import ToggleGradesVisible from './single-response/toggle-grades-visible'
import DataClientWrapper from './data-client-wrapper'
import AssessmentTableData from './assessment-table-data'
import BlogTableData from './blog-table-data'
import { PromptSession, Question, User, Response, ResponseData } from '@/types'
import { responsePercentage } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getSinglePromptSessionTeacherDashboard } from '@/lib/actions/prompt.session.actions'
import Link from 'next/link'

export default function MainClientWrapper({
    promptSession,
    classId,
    teacherId,
    classRoster,
    sessionId
}: {
    promptSession: PromptSession;
    classId: string;
    teacherId: string;
    classRoster: User[];
    sessionId: string
}) {


    const { data: promptSessionData } = useQuery({
        queryKey: ['getSingleSessionData', sessionId],
        queryFn: () => getSinglePromptSessionTeacherDashboard(sessionId) as unknown as PromptSession,
        initialData: promptSession,
    })


    function calculateClassAverageAssessment() {
        let classTotal = 0;
        let totalResponses = 0
        promptSessionData?.responses?.forEach((response: Response) => {
            const newAverage = responsePercentage(response.response as unknown as ResponseData[])
            if (newAverage !== 'N/A') {
                classTotal += parseInt(newAverage)
                totalResponses += 1;
            }
        })
        return totalResponses === 0 ? 'N/A' : `${Math.round(classTotal / totalResponses)}%`
    }

    function calculateClassAverageBlog() {
        let classTotal = 0;
        let totalResponses = 0
        promptSessionData?.responses?.forEach((response: Response) => {
            if ((response.response as unknown as ResponseData[])[0].score) {
                classTotal += (response.response as unknown as ResponseData[])[0].score;
                totalResponses += 1
            }
        })
        return totalResponses === 0 ? 'N/A' : `${Math.round(classTotal / totalResponses)}%`
    }


    const classAverage = promptSessionData?.promptType === 'multi-question' ?
        calculateClassAverageAssessment()
        :
        calculateClassAverageBlog()

    // Get student list to show which students have not submitted
    const studentSubmittedIds = promptSessionData?.responses?.map(response => response.student.id);
    const notSubmitted = classRoster.filter(student => !studentSubmittedIds?.includes(student.id))

    return (
        <div>
            <div className='space-y-4'>
                <p className="text-input">Class Average: {classAverage}</p>
                <ToggleGradesVisible
                    promptSessionId={promptSessionData?.id}
                    gradesVisibility={promptSessionData?.areGradesVisible}
                />
                <Link href={`/classroom/${classId}/${teacherId}/single-prompt-session/${sessionId}/review-assessment-questions`}>
                    Review Questions
                </Link>
            </div>
            {/* Bar chart */}
            {promptSessionData?.promptType === 'multi-question' &&
                <DataClientWrapper
                    questions={(promptSessionData?.questions as unknown as Question[]) as unknown as Question[]}
                    responses={promptSessionData?.responses as unknown as Response[]}
                    sessionId={sessionId}
                />
            }

            {promptSessionData.promptType === 'multi-question' ? (
                <AssessmentTableData
                    promptSessionData={promptSessionData?.responses as unknown as Response[]}
                    teacherId={teacherId}
                    promptSessionId={promptSessionData.id}
                    classId={classId}
                    notSubmitted={notSubmitted}
                />
            ) : (
                // Journal Table
                <BlogTableData
                    promptSessionData={promptSessionData.responses as unknown as Response[]}
                    teacherId={teacherId}
                    promptSessionId={promptSessionData.id}
                    classId={classId}
                    notSubmitted={notSubmitted}
                />
            )}
        </div>
    )
}
