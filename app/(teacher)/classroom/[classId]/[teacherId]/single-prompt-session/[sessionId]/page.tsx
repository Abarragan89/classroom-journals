import { prisma } from '@/db/prisma';
import { decryptText, responsePercentage } from "@/lib/utils";
import { Question, Response, ResponseData, User } from "@/types";
import { PromptSession } from "@/types";
import { getAllStudents } from "@/lib/actions/classroom.actions";
import EditPromptSessionPopUp from "@/components/modalBtns/edit-prompt-session-popup";
import AssessmentTableData from "./assessment-table-data";
import BlogTableData from "./blog-table-data";
import DataClientWrapper from './data-client-wrapper';
import ToggleGradesVisible from './single-response/toggle-grades-visible';

export default async function SinglePromptSession({
    params
}: {
    params: Promise<{ classId: string, teacherId: string, sessionId: string }>
}) {

    const { sessionId, classId, teacherId } = await params;

    if (!sessionId) {
        return <div>No session ID provided</div>;
    }

    const promptSession = await prisma.promptSession.findUnique({
        where: { id: sessionId },
        select: {
            status: true,
            id: true,
            promptType: true,
            questions: true,
            isPublic: true,
            areGradesVisible: true,
            responses: {
                select: {
                    id: true,
                    submittedAt: true,
                    response: true,
                    student: {
                        select: {
                            id: true,
                            name: true,
                            iv: true,
                            username: true,
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                },
            },
            prompt: {
                select: {
                    title: true,
                    category: {
                        select: {
                            name: true
                        }
                    }
                },
            },
        },
    }) as unknown as PromptSession;

    if (!promptSession) {
        return <div>Prompt session not found</div>;
    }

    // Ensure that responses exist before mapping
    const decryptedResponses = promptSession.responses?.map((response) => ({
        ...response,
        student: {
            id: response.id,
            username: decryptText(response.student.username as string, response.student.iv as string),
        }
    }));

    // Keep the rest of the promptSession unchanged
    const updatedPromptSession = {
        ...promptSession,
        responses: decryptedResponses,
    };

    const studentSubmittedWithFormattedNamed = promptSession?.responses?.map((response: Response) => ({
        ...response,
        student: {
            name: decryptText(response.student.name as string, response.student.iv as string)
        }
    })) as Response[];

    // Get student list to show which students have not submitted
    const classRoster = await getAllStudents(classId) as User[]
    const studentSubmittedIds = promptSession?.responses?.map(user => user.student.id)
    const notSubmitted = classRoster.filter(student => !studentSubmittedIds?.includes(student.id))



    function calculateClassAverageAssessment() {
        let classTotal = 0;
        let totalResponses = 0
        promptSession?.responses?.forEach((response: Response) => {
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
        promptSession?.responses?.forEach((response: Response) => {
            if ((response.response as unknown as ResponseData[])[0].score) {
                classTotal += (response.response as unknown as ResponseData[])[0].score;
                totalResponses += 1
            }
        })
        return totalResponses === 0 ? 'N/A' : `${Math.round(classTotal / totalResponses)}%`
    }


    const classAverage = promptSession?.promptType === 'multi-question' ?
        calculateClassAverageAssessment()
        :
        calculateClassAverageBlog()

    return (
        <div>
            <h2 className="text-xl lg:text-2xl line-clamp-3 mt-5">{promptSession?.prompt?.title}</h2>
            <EditPromptSessionPopUp
                promptSessionType={promptSession?.promptType}
                promptSessionId={promptSession?.id}
                initialStatus={promptSession?.status}
                initialPublicStatus={promptSession?.isPublic}
            />
            <div className='space-y-4'>
                <p className="text-input">Class Average: {classAverage}</p>
                <ToggleGradesVisible
                    promptSessionId={promptSession?.id}
                    gradesVisibility={promptSession?.areGradesVisible}
                />
            </div>
            {/* Bar chart */}
            {promptSession?.promptType === 'multi-question' &&
                <DataClientWrapper
                    questions={(updatedPromptSession?.questions as unknown as Question[]) as unknown as Question[]}
                    responses={updatedPromptSession?.responses as unknown as Response[]}
                />
            }

            {promptSession.promptType === 'multi-question' ? (
                <AssessmentTableData
                    studentSubmittedWithFormattedNamed={studentSubmittedWithFormattedNamed as unknown as Response[]}
                    teacherId={teacherId}
                    promptSessionId={promptSession.id}
                    classId={classId}
                    notSubmitted={notSubmitted}
                />
            ) : (
                // Journal Table
                <BlogTableData
                    studentSubmittedWithFormattedNamed={studentSubmittedWithFormattedNamed as unknown as Response[]}
                    teacherId={teacherId}
                    promptSessionId={promptSession.id}
                    classId={classId}
                    notSubmitted={notSubmitted}
                />
            )}
        </div>
    );
}

