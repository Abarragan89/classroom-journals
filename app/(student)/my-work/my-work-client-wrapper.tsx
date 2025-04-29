"use client"
import StudentTodoTable from "@/components/shared/student-task-table";
import { gradedTasksColumns } from "@/components/shared/student-task-table/graded-tasks-columns";
import { tasksTodoColumns } from "@/components/shared/student-task-table/tasks-todo-columns";
import { getAllSessionsInClassForStudent } from "@/lib/actions/prompt.session.actions";
import { getSingleStudentResponses } from "@/lib/actions/response.action";
import { formatDateMonthDayYear, responsePercentage } from "@/lib/utils";
import { PromptSession, Response, ResponseData } from "@/types";
import { useQuery } from "@tanstack/react-query";


export default function MyWorkClientWrapper({
    allPromptSessions,
    studentResponses,
    studentId,
    classroomId
}: {
    allPromptSessions: { prompts: PromptSession[], totalCount: number };
    studentResponses: Response[],
    studentId: string,
    classroomId: string
}) {

    const { data: allPromptSessionsData } = useQuery({
        queryKey: ['getSessionInStudentWork', studentId],
        queryFn: () => getAllSessionsInClassForStudent(classroomId) as unknown as { prompts: PromptSession[], totalCount: number },
        initialData: allPromptSessions
    })

    const { data: studentResponsesData } = useQuery({
        queryKey: ['getStudentResponseData', studentId],
        queryFn: () => getSingleStudentResponses(studentId) as unknown as Response[],
        initialData: studentResponses
    })


    // Determine Incomplete Tasks
    const incompleteTasks = allPromptSessionsData?.prompts
        .filter(singleSession =>
            !singleSession?.responses?.some(response => response.studentId === studentId))
        .map(session => ({
            id: session.id,
            title: session.title,
            status: "Incomplete",
            createdAt: formatDateMonthDayYear(session.createdAt)
        })) as unknown as PromptSession[];

    // Determine Returned Work 
    const returnedWork = studentResponsesData?.map(response => {
        if (response.isSubmittable) {
            return ({
                id: response.id,
                title: response?.promptSession?.title,
                status: "Returned",
                createdAt: formatDateMonthDayYear(response.submittedAt)
            })
        }
    }).filter(Boolean)

    const tasksToDo = [...returnedWork, ...incompleteTasks]
        .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as unknown as PromptSession[];

    // Completed Tasks
    const completedTasks = studentResponsesData.map(response => {
        // If it's submittable, then it has been returned and should not be on this table
        if (response.isSubmittable) return
        let score: string = 'N/A'
        if (response.promptSession?.promptType === 'single-question') {
            score = ((response?.response as { score?: number }[] | undefined)?.[0]?.score)?.toString() ?? 'N/A'
            score = score !== 'N/A' ? `${score}%` : score
        } else {
            // This returns 'N/A' if every question is not scored. 
            score = responsePercentage(response?.response as unknown as ResponseData[]);
        }
        return ({
            ...response,
            submittedAt: formatDateMonthDayYear(response.submittedAt),
            score,
        })
    }).filter(Boolean) as unknown as Response[]


    return (
        <>
            <div className="space-y-10">
                <div className="md:w-[90%] mx-auto">
                    <h2 className="h3-bold text-center mb-1">Tasks To Do</h2>
                    <StudentTodoTable
                        columns={tasksTodoColumns}
                        data={tasksToDo}
                    />
                </div>
                <div className="md:w-[90%] mx-auto">
                    <h2 className="h3-bold text-center mb-1">Completed Tasks</h2>
                    <StudentTodoTable
                        columns={gradedTasksColumns}
                        data={completedTasks}
                    />
                </div>
            </div>
        </>
    )
}
