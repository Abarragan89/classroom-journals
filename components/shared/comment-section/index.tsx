'use client'
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { BarLoader } from "react-spinners";
import { SendHorizonalIcon } from "lucide-react";
import { ResponseComment } from "@/types";
import { addComment } from "@/lib/actions/comment.action";
import SingleComment from "./single-comment";
import { toast } from "sonner";

export default function CommentSection({
    comments,
    studentId,
    responseId
}: {
    comments: ResponseComment[],
    studentId: string,
    responseId: string
}) {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [allComments, setAllComments] = useState<ResponseComment[]>(comments)
    const [commentText, setCommentText] = useState<string>('')


    async function addCommentHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsLoading(true)
            const newComment = await addComment(responseId, commentText, studentId)
            setAllComments(prev => [newComment as ResponseComment, ...prev])
            setCommentText('')
            toast('Comment Added!')
        } catch (error) {
            console.log('error adding comment ', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="relative mx-auto" id="comment-section-main">
            <h3 className="h3-bold text-center pb-3">Comments</h3>

            <form
                onSubmit={(e) => addCommentHandler(e)}
                className="relative"
            >
                <div className="mb-10">
                    <Textarea
                        placeholder="Add a comment..."
                        rows={3}
                        value={commentText}
                        className="pr-5 h-[90px] resize-none"
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className={`absolute right-[18px] top-[58px] h-[30px]`}
                >
                    {isLoading ?
                        <BarLoader
                            width={15}
                            height={2}
                            loading={isLoading}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                            className="text-primary"
                        />
                        :
                        <SendHorizonalIcon
                            className="text-primary"
                            size={22}
                        />
                    }
                </button>
            </form>
            {allComments?.length > 0 && allComments.map((comment: ResponseComment) => (
                <SingleComment
                    key={comment.id}
                    commentData={comment as ResponseComment}
                    responseId={responseId}
                    studentId={studentId}
                />
            ))}
        </section>
    )
}
