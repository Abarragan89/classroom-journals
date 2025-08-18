"use client"
import StudentTodoTable from "@/components/shared/student-task-table";
import { gradedTasksColumns } from "@/components/shared/student-task-table/graded-tasks-columns";
import { tasksTodoColumns } from "@/components/shared/student-task-table/tasks-todo-columns";
import { formatDateMonthDayYear, responsePercentage } from "@/lib/utils";
import { PromptSession, Response, ResponseData } from "@/types";
import { useQuery } from "@tanstack/react-query";


export default function MyWorkClientWrapper({
    studentResponses,
    studentId,
}: {
    studentResponses: Response[],
    studentId: string,
}) {

    const { data: studentResponsesData } = useQuery({
        queryKey: ['getStudentResponseData', studentId],
        queryFn: async () => {
            const response = await fetch(`/api/responses/student/${studentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch student responses');
            }
            const data = await response.json();
            return data.responses as Response[];
        },
        initialData: studentResponses,
        // refetchOnMount: false,
        refetchOnReconnect: false,
        // refetchOnWindowFocus: false,
        // staleTime: Infinity,
    })

    // Determine Returned Work 
    const incompleteTasks = studentResponsesData?.map(response => {
        if (response.completionStatus === 'INCOMPLETE') {
            return ({
                id: response.id,
                title: response?.promptSession?.title,
                status: "Incomplete",
                createdAt: formatDateMonthDayYear(response.createdAt)
            })
        }
    }).filter(Boolean)

    const returnedWork = studentResponsesData?.map(response => {
        if (response.completionStatus === 'RETURNED') {
            return ({
                id: response.id,
                title: response?.promptSession?.title,
                status: "Returned",
                createdAt: formatDateMonthDayYear(response.createdAt)
            })
        }
    }).filter(Boolean)

    const tasksToDo = [...returnedWork, ...incompleteTasks]
        .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as unknown as PromptSession[];

    // Completed Tasks
    const completedTasks = studentResponsesData.map(response => {
        // If it's submittable, then it has been returned and should not be on this table
        if (response.completionStatus === 'COMPLETE') {
            let score: string = 'N/A'
            if (response.promptSession?.promptType === 'BLOG') {
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
        }
    }).filter(Boolean) as unknown as Response[]

    return (
        <>
            <div className="space-y-10">
                <div>
                    <h2 className="font-bold text-center mb-1">Tasks To Do</h2>
                    <StudentTodoTable
                        columns={tasksTodoColumns}
                        data={tasksToDo}
                    />
                </div>
                <div>
                    <h2 className="font-bold text-center mb-1">Completed Tasks</h2>
                    <StudentTodoTable
                        columns={gradedTasksColumns}
                        data={completedTasks}
                    />
                </div>
            </div>
        </>
    )
}