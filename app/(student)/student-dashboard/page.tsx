import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, Session } from "@/types";
import { notFound } from "next/navigation";
import { PromptSession } from "@/types";
import { getUserNotifications } from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import ClassDiscussionCarousel from "@/components/carousels/class-discussion-carousel";
import NotificationsCarousel from "@/components/carousels/notifications-carousel";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/actions/prompt.session.actions";
import AssignmentSectionClient from "./assignement-section.client";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";
import { prisma } from "@/db/prisma";

export default async function StudentDashboard() {

    const session = await auth() as Session

    if (!session) notFound()

    const studentId = session?.user?.id as string
    if (session?.user?.role !== 'student' || !studentId) {
        notFound()
    }

    const classroomId = session?.classroomId

    if (!classroomId) notFound()

    // Get Class categories for filtering
    const { userId: teacherId } = await prisma.classUser.findFirst({
        where: {
            classId: classroomId,
            role: 'teacher'
        },
        select: {
            userId: true
        }
    }) as { userId: string }
    let allPromptCategories = await getAllPromptCategories(teacherId) as unknown as PromptCategory[]

    // Get all Sessions from class and add meta data
    const allPromptSessions = await getAllSessionsInClass(classroomId) as unknown as { prompts: PromptSession[], totalCount: number }
    const promptSessionWithMetaData = allPromptSessions?.prompts?.map(session => {
        // Determine if assignment is completed
        const isCompleted = session?.responses?.some(response => response.studentId === studentId)
        let studentResponseId: string | null = null
        let isSubmittable: boolean = false;
        if (isCompleted) {
            // if completed, get their responseID so we can navigate them to their '/review-reponse/${responseID}'
            const { id, isSubmittable: isReturned } = session?.responses?.find(res => res.studentId === studentId) as unknown as Response
            studentResponseId = id;
            isSubmittable = isReturned
        }
        // Add fields is completed, and their specific responseID to the promptSession
        return ({
            ...session,
            isCompleted,
            isSubmittable,
            studentResponseId,
        })
    }) as unknown as PromptSession[]



    // Extract the student IDs from responses and filter PromptSessions
    const tasksToDo = promptSessionWithMetaData?.filter(singleSession =>
        !singleSession?.responses?.some(response => response.studentId === studentId)
    ) as unknown as PromptSession[];

    // Get the blog sessions to display to link to discussion board
    // const blogPrompts = promptSessionWithMetaData?.filter(singleSession => singleSession.promptType === 'single-question' && singleSession.isPublic) as unknown as PromptSession[]

    const userNotifications = await getUserNotifications(studentId) as unknown as UserNotification[]

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper relative">
                {/* <h1 className="h1-bold mt-2 line-clamp-1">{allPromptSessions?.prompts?.name}</h1> */}
                <h1 className="h2-bold mt-2 line-clamp-1 mb-10">Hi, {session?.user?.name}</h1>
                <div className="flex-end mb-5">
                    <Button
                    >
                        <Plus /> Request
                    </Button>
                </div>
                {/* Show prompt sessions if they exist */}
                {/* {tasksToDo?.length > 0 ? (
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
                )} */}


                
                <h3 className="h3-bold mb-2 ml-1">Assignments</h3>
                <AssignmentSectionClient
                    initialPrompts={promptSessionWithMetaData}
                    classId={classroomId}
                    promptCountTotal={allPromptSessions.totalCount}
                    categories={allPromptCategories}
                />
            </main>
        </>
    )
}
