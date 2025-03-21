import BlogMetaDetails from "@/components/blog-meta-details";
import CommentSection from "@/components/shared/comment-section";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { getSingleResponse } from "@/lib/actions/response.action"
import { Response, ResponseComment, ResponseData } from "@/types";


export default async function SingleResponse({
    params
}: {
    params: Promise<{ responseId: string, studentId: string }>
}) {

    const { responseId, studentId } = await params;
    const response = await getSingleResponse(responseId) as unknown as Response

    return (
        <div className="max-w-[700px] px-3 mx-auto">
            <BlogMetaDetails
                responseData={response}
                studentId={studentId}
            />

            <Image
                src={'https://unfinished-pages.s3.us-east-2.amazonaws.com/blob-1737094660753'}
                width={700}
                height={394}
                alt={'blog cover photo'}
                className="block mx-auto mb-5"
                priority
            />
            <p className="leading-[2rem] text-card-foreground text-[16px] sm:text-[19px]">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
            <Separator className="my-5" />
            <CommentSection
                comments={response.comments as unknown as ResponseComment[]}
                responseId={responseId}
                studentId={studentId}
            />
        </div>
    )
}
