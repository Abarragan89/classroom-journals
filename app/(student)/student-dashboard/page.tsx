import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { Session } from "@/types";
import { notFound } from "next/navigation";
import StudentTaskListItem from "@/components/student-task-list-item";
import { PromptSession } from "@prisma/client";

export default async function StudentDashboard() {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const classroomId = session?.classroomId


    const classroomData = await prisma.classroom.findUnique({
        where: { id: classroomId },
        include: {
            users: {
                include: {
                    user: {
                        select: { id: true, username: true }
                    }
                },
            },
            PromptSession: {
                include: {
                    responses: {
                        select: { studentId: true }
                    }
                }
            }
        }
    });

    // Extract the student IDs from responses and filter PromptSessions
    const tasksToDo = classroomData?.PromptSession.filter(singleSession =>
        singleSession.status === 'active' &&
        !singleSession.responses.some(response => response.studentId === studentId)
    ) as unknown as PromptSession[];


    if (!classroomData) return;



    return (
        <div>
            <Header session={session} />
            <main className="wrapper">
                <h1 className="h1-bold mt-2 line-clamp-1">{classroomData?.name}</h1>
                {/* Show prompto sessions if they exist */}
                {tasksToDo?.length > 0 ? tasksToDo.map((task: PromptSession) => (
                    <div key={task.id}>
                        <h2 className="h2-bold mt-5">Assignments</h2>
                        <StudentTaskListItem
                            jotData={task}
                        />
                    </div>
                )) : (
                    <p>No assignments this is your dashboard</p>
                )}
            </main>
        </div>
    )
}
