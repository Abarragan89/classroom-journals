import CommentSection from "@/components/shared/comment-section";
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
        <div className="max-w-[900px] px-3 mx-auto">
            <p className="bg-card text-card-foreground rounded-md p-8 leading-relaxed tracking-wide">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
            <Separator className="my-5" />
            <CommentSection
                comments={response.comments as unknown as ResponseComment[]}
                responseId={responseId}
                studentId={studentId}
            />
        </div>
    )
}
