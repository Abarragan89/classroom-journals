"use client"
import StudentTodoTable from "@/components/shared/student-task-table";
import { gradedTasksColumns } from "@/components/shared/student-task-table/graded-tasks-columns";
import { tasksTodoColumns } from "@/components/shared/student-task-table/tasks-todo-columns";
import { getSingleStudentResponses } from "@/lib/actions/response.action";
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
        queryFn: () => getSingleStudentResponses(studentId) as unknown as Response[],
        initialData: studentResponses,
        // refetchOnMount: false,
        // refetchOnReconnect: false,
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
                createdAt: formatDateMonthDayYear(response.submittedAt)
            })
        }
    }).filter(Boolean)

    const returnedWork = studentResponsesData?.map(response => {
        if (response.completionStatus === 'RETURNED') {
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
