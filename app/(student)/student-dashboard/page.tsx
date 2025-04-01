import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { prisma } from "@/db/prisma";
import { Session } from "@/types";
import { notFound } from "next/navigation";
import StudentTaskListItem from "@/components/student-task-list-item";
import { PromptSession } from "@/types";
import { getUserNotifications } from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import ClassDiscussionCarousel from "@/components/carousels/class-discussion-carousel";
import NotificationsCarousel from "@/components/carousels/notifications-carousel";
import { decryptText } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    // Extract the student IDs from responses and filter PromptSessions
    const tasksToDo = classroomData?.PromptSession.filter(singleSession =>
        !singleSession.responses.some(response => response.studentId === studentId)
    ) as unknown as PromptSession[];

    // Get the blog sessions to display to link to discussion board
    const blogPrompts = classroomData?.PromptSession.filter(singleSession => singleSession.promptType === 'single-question' && singleSession.isPublic) as unknown as PromptSession[]

    if (!classroomData) return;

    const userNotifications = await getUserNotifications(studentId) as unknown as UserNotification[]

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper relative">
                <h1 className="h1-bold mt-2 line-clamp-1">{classroomData?.name}</h1>
                <h1 className="h2-bold mt-2 line-clamp-1">Hi, {session?.user?.name}</h1>
                <Button
                    className="absolute right-10"
                ><Plus /> Request</Button>
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
                    // Else show dashboard
                ) : (
                    <section className="mb-36">
                        <article className="my-10">
                            <h2 className="text-lg lg:text-xl ml-2 mb-2">Blog Discussions</h2>
                            <ClassDiscussionCarousel
                                blogPrompts={blogPrompts as unknown as PromptSession[]}
                            />
                        </article>
                        <article>
                            <h2 className="text-lg lg:text-xl ml-2 mb-2">Notifications</h2>
                            <NotificationsCarousel
                                notifications={userNotifications as UserNotification[]}
                                studentId={studentId}
                            />
                        </article>
                    </section>
                )}
            </main>
        </>
    )
}
