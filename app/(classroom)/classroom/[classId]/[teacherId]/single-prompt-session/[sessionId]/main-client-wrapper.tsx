'use client'
import ToggleGradesVisible from './single-response/toggle-grades-visible'
import DataClientWrapper from './data-client-wrapper'
import AssessmentTableData from './assessment-table-data'
import BlogTableData from './blog-table-data'
import { PromptSession, Question, User, Response, ResponseData } from '@/types'
import { responsePercentage } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getSinglePromptSessionTeacherDashboard } from '@/lib/actions/prompt.session.actions'
import { ResponseStatus } from '@prisma/client'

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
        queryFn: () => getSinglePromptSessionTeacherDashboard(sessionId, teacherId) as unknown as PromptSession,
        initialData: promptSession,
        // refetchOnMount: false,
        // refetchOnReconnect: false,
        // refetchOnWindowFocus: false,
        // staleTime: Infinity,
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


    const classAverage = promptSessionData?.promptType === 'ASSESSMENT' ?
        calculateClassAverageAssessment()
        :
        calculateClassAverageBlog()


    // grab all the respones with this promptSessionId
    // Get student list to show which students have not submitted
    const completedResponses = promptSessionData?.responses?.filter(response => response.completionStatus === ResponseStatus.COMPLETE)
    const incompleteResponses = promptSessionData?.responses?.filter(response => response.completionStatus === ResponseStatus.INCOMPLETE)
    const returnedResponses = promptSessionData?.responses?.filter(response => response.completionStatus === ResponseStatus.RETURNED)

    // Find out which student have not been assigned it.
    const studentSubmittedIds = promptSessionData?.responses?.map(response => response.student.id);
    const notAssigned = classRoster.filter(student => !studentSubmittedIds?.includes(student.id))

    // needed for creating a response to unassigned studnets
    const promptSessionQuestions = promptSessionData.questions as unknown as ResponseData[];

    return (
        <div>
            <div className="flex">
                <div className='space-y-4'>
                    <p className="text-input">Class Average: {classAverage}</p>
                    <ToggleGradesVisible
                        promptSessionId={promptSessionData?.id}
                        gradesVisibility={promptSessionData?.areGradesVisible}
                        teacherId={teacherId}
                    />
                </div>
            </div>
            {/* Bar chart */}
            {promptSessionData?.promptType === 'ASSESSMENT' &&
                <DataClientWrapper
                    questions={(promptSessionData?.questions as unknown as Question[]) as unknown as Question[]}
                    responses={promptSessionData?.responses as unknown as Response[]}
                    sessionId={sessionId}
                    teacherId={teacherId}
                />
            }

            {promptSessionData.promptType === 'ASSESSMENT' ? (
                <AssessmentTableData
                    teacherId={teacherId}
                    promptSessionId={promptSessionData.id}
                    classId={classId}
                    notAssigned={notAssigned}
                    completedResponses={completedResponses as Response[]}
                    incompleteResponses={incompleteResponses as Response[]}
                    returnedResponses={returnedResponses as Response[]}
                    promptSessionQuestions={promptSessionQuestions}
                />
            ) : (
                // Journal Table
                <BlogTableData
                    teacherId={teacherId}
                    promptSessionId={promptSessionData.id}
                    classId={classId}
                    notAssigned={notAssigned}
                    completedResponses={completedResponses as Response[]}
                    incompleteResponses={incompleteResponses as Response[]}
                    returnedResponses={returnedResponses as Response[]}
                    promptSessionQuestions={promptSessionQuestions}
                />
            )}
        </div>
    )
}
