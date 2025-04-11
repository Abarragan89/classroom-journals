import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptSession, Response, ResponseData, Session } from "@/types";
import { notFound } from "next/navigation";
import { getSingleStudentResponses } from "@/lib/actions/response.action";
import Link from "next/link";
import { formatDateMonthDayYear } from "@/lib/utils";
import { responsePercentage } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import StudentTodoTable from "@/components/shared/student-task-table";
import { tasksTodoColumns } from "@/components/shared/student-task-table/tasks-todo-columns";
import { gradedTasksColumns } from "@/components/shared/student-task-table/graded-tasks-columns";
import { getAllSessionsInClassForStudent } from "@/lib/actions/prompt.session.actions";


export default async function MyWork() {

    // Get Session Data
    const session = await auth() as Session
    if (!session) notFound()
    const classroomId = session?.classroomId
    if (!classroomId) notFound()


    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const studentResponses = await getSingleStudentResponses(studentId) as unknown as Response[]
    const allPromptSessions = await getAllSessionsInClassForStudent(classroomId) as unknown as { prompts: PromptSession[], totalCount: number }

    // Determine Incomplete Tasks
    const incompleteTasks = allPromptSessions?.prompts
        .filter(singleSession =>
            !singleSession?.responses?.some(response => response.studentId === studentId))
        .map(session => ({
            id: session.id,
            title: session.title,
            status: "Incomplete",
            createdAt: formatDateMonthDayYear(session.createdAt)
        })) as unknown as PromptSession[];

    // Determine Returned Work 
    const returnedWork = studentResponses.map(response => {
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
    const completedTasks = studentResponses.map(response => {
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
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <Link href='/student-dashboard' className="flex items-center hover:underline w-fit print:hidden">
                    <ArrowLeftIcon className="mr-1" size={20} />
                    Back to Dashboard
                </Link>
                <h1 className="h1-bold mt-2 line-clamp-1">My Work</h1>
                <div className="mt-5 space-y-5">

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
                </div>
            </main>
        </>
    )
}