import BlogMetaDetails from "@/components/blog-meta-details";
import CommentSection from "@/components/shared/comment-section";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { getSingleResponse } from "@/lib/actions/response.action"
import { Response, ResponseComment, ResponseData, Session } from "@/types";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/db/prisma";


export default async function SingleResponse({
    params
}: {
    params: Promise<{ responseId: string, sessionId: string }>
}) {

    const session = await auth() as Session
    const studentId = session?.user?.id
    const classroomId = session?.classroomId

    if (!session || !studentId || !classroomId) return notFound()

    const { responseId, sessionId } = await params;
    const response = await getSingleResponse(responseId, studentId) as unknown as Response

    const promptStatus = response?.promptSession?.status

    // Get Data to find out if cooldown time is in effect
    const { commentCoolDown } = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
            commentCoolDown: true,
        }
    }) as { commentCoolDown: number };

    return (
        <div className="max-w-[700px] px-3 mx-auto">
            <BlogMetaDetails
                responseData={response}
                studentId={studentId}
                teacherView={false}
            />

            <Image
                src={(response?.response as { answer: string }[])?.[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                width={700}
                height={394}
                alt={'blog cover photo'}
                className="block mx-auto mb-5 w-[700px] h-[394px]"
                priority
            />
            <p className="leading-[2rem] text-foreground text-[16px] sm:text-[19px] whitespace-pre-line">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
            <Separator className="my-5" />
            <CommentSection
                comments={response.comments as unknown as ResponseComment[]}
                responseId={responseId}
                studentId={studentId}
                sessionId={sessionId}
                classroomId={classroomId}
                discussionStatus={promptStatus as string}
                commentCoolDown={commentCoolDown}
            />
        </div>
    )
}
