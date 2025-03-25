import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { Session } from "@/types";
import { notFound } from "next/navigation";
import StudentTaskListItem from "@/components/student-task-list-item";
import { PromptSession } from "@/types";
import JotListBanner from "@/components/jot-list-banner";
import { getStudentCountByClassId } from "@/lib/actions/roster.action";
import { getUserNotifications } from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import Link from "next/link";
import ClassDiscussionCarousel from "@/components/carousels/class-discussion-carousel";
import NotificationsCarousel from "@/components/carousels/notifications-carousel";

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
                        select: { studentId: true, id: true }
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

    // Get the blog sessions to display to link to discussion board
    const blogPrompts = classroomData?.PromptSession.filter(singleSession => singleSession.promptType === 'single-question') as unknown as PromptSession[]

    console.log('blog prompt ', blogPrompts)

    if (!classroomData) return;

    const { count: studentCount } = await getStudentCountByClassId(classroomData.id)


    const userNotifications = await getUserNotifications(studentId) as unknown as UserNotification[]

    console.log('noties ', userNotifications)

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper">
                <h1 className="h1-bold mt-2 line-clamp-1">{classroomData?.name}</h1>
                {/* Show prompt sessions if they exist */}
                {tasksToDo?.length > 0 ? (
                    <section>
                        <h2 className="h3-bold my-5">Assignments</h2>
                        <div className="flex-start flex-wrap gap-10">
                            {tasksToDo.map((task: PromptSession) => (
                                <div key={task.id}>
                                    <StudentTaskListItem
                                        jotData={task}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <>
                        <section>
                            <h2 className="h3-bold my-5">Blog Posts</h2>
                            <ClassDiscussionCarousel
                                blogPrompts={blogPrompts as unknown as PromptSession[]}
                                studentId={studentId}
                            />
                        </section>
                        <section>
                            <h2 className="h3-bold my-5">Notifications</h2>
                            <NotificationsCarousel
                                notifications={userNotifications as UserNotification[]}
                                studentId={studentId}
                            />
                        </section>
                    </>
                )}
            </main>
        </>
    )
}
