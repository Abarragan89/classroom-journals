import { auth } from "@/auth";
import Header from "@/components/shared/header";
import { PromptCategory, Response, ResponseData, Session } from "@/types";
import { notFound } from "next/navigation";
import { PromptSession } from "@/types";
import { getUserNotifications } from "@/lib/actions/notifications.action";
import { UserNotification } from "@/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllSessionsInClass } from "@/lib/actions/prompt.session.actions";
import AssignmentSectionClient from "./assignement-section.client";
import { getAllPromptCategories } from "@/lib/actions/prompt.categories";
import { prisma } from "@/db/prisma";
import Carousel from "@/components/carousel";
import Link from "next/link";
import BlogCard from "@/components/blog-card";
import { decryptText, formatDateShort } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
    // const tasksToDo = promptSessionWithMetaData?.filter(singleSession =>
    //     !singleSession?.responses?.some(response => response.studentId === studentId)
    // ) as unknown as PromptSession[];

    // Get the blog sessions to display to link to discussion board
    // const blogPrompts = promptSessionWithMetaData?.filter(singleSession => singleSession.promptType === 'single-question' && singleSession.isPublic) as unknown as PromptSession[]

    const userNotifications = await getUserNotifications(studentId) as unknown as UserNotification[]

    // Get all student Id
    const studentIds = await prisma.classUser.findMany({
        where: {
            classId: classroomId,
            role: 'student'
        },
        select: {
            userId: true
        }
    })
    const studentIdArray = studentIds.map(student => student.userId)

    // Get Featured Blog 
    const featuredBlogs = await prisma.response.findMany({
        where: {
            studentId: { in: studentIdArray },
            likeCount: { gt: 2 }
        },
        select: {
            id: true,
            promptSession: {
                select: {
                    id: true
                }
            },
            studentId: true,
            response: true,
            submittedAt: true,
            likeCount: true,
            _count: {
                select: {
                    comments: true
                }
            },
            student: {
                select: {
                    iv: true,
                    username: true
                }
            }
        },
        orderBy: {
            likeCount: 'desc'
        },
        take: 10,
    })

    // format and sort featured blogs for display
    const today = new Date();
    const decryptedBlogNames = featuredBlogs
        .map((blog) => {
            const responseData = blog?.response as unknown as ResponseData[];
            const answer = responseData?.[0]?.answer || "";
            const characterCount = answer.length;

            // Exclude very short blogs
            if (characterCount < 400) return;

            // Convert submittedAt to Date
            const submittedAtDate = new Date(blog.submittedAt);
            const daysAgo = (today.getTime() - submittedAtDate.getTime()) / (1000 * 60 * 60 * 24); // days since submission

            // Get interaction counts
            const totalLikes = blog?.likeCount || 0;
            const totalComments = blog?._count?.comments || 0;

            // Example priority score: weight likes, comments, and recency
            const priorityScore = totalLikes * 2 + totalComments * 1.5 - daysAgo;

            return {
                ...blog,
                student: {
                    username: decryptText(blog.student.username as string, blog.student.iv as string),
                },
                priorityScore,
            };
        })
        .filter(Boolean) // remove nulls
        .sort((a, b) => b!.priorityScore - a!.priorityScore); // descending

    return (
        <>
            <Header session={session} studentId={studentId} />
            <main className="wrapper relative">
                <h1 className="h2-bold mt-2 line-clamp-1 mb-10">Hi, {session?.user?.name}</h1>
                <div className="flex-end">
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
                <section>
                    <h3 className="h3-bold ml-1">Featured Blogs</h3>
                    <Carousel>
                        {decryptedBlogNames.map((response) => (
                            <Link
                                key={response?.id}
                                href={`/discussion-board/${response?.promptSession.id}/response/${response?.id}`}
                                className="embla__slide hover:shadow-[0_4px_10px_-3px_var(--secondary)] mx-5">
                                <BlogCard
                                    likeCount={response?.likeCount as number}
                                    author={response?.student?.username as string}
                                    totalCommentCount={response?._count?.comments as number}
                                    title={(response?.response as unknown as ResponseData[])?.[1].answer as string}
                                    description={(response?.response as unknown as ResponseData[])?.[0].answer as string}
                                    date={formatDateShort(response?.submittedAt as Date)}
                                    coverPhotoUrl={(response?.response as unknown as ResponseData[])?.[2].answer as string}
                                />
                            </Link>
                        ))}
                    </Carousel>
                </section>
                <Separator className="my-10" />
                <section>
                    <h3 className="h3-bold mb-2 ml-1">Assignments</h3>
                    <AssignmentSectionClient
                        initialPrompts={promptSessionWithMetaData}
                        classId={classroomId}
                        promptCountTotal={allPromptSessions.totalCount}
                        categories={allPromptCategories}
                        studentId={studentId}
                    />
                </section>
            </main>
        </>
    )
}
