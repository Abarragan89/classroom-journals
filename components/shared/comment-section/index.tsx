'use client'
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { BarLoader } from "react-spinners";
import { SendHorizonalIcon } from "lucide-react";
import { ResponseComment } from "@/types";
import { addComment, deleteComment } from "@/lib/actions/comment.action";
import SingleComment from "./single-comment";
import { toast } from "sonner";
import { checkCommentCoolDown } from "@/lib/utils";

export default function CommentSection({
    comments,
    studentId,
    responseId,
    sessionId,
    discussionStatus,
    commentCoolDown,
    isTeacherView = false,
    classroomId
}: {
    comments: ResponseComment[],
    studentId: string,
    responseId: string,
    sessionId: string,
    discussionStatus: string,
    commentCoolDown?: number,
    isTeacherView?: boolean,
    classroomId: string
}) {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [allComments, setAllComments] = useState<ResponseComment[]>(comments)
    const [commentText, setCommentText] = useState<string>('')

    async function addCommentHandler(e: React.FormEvent<HTMLFormElement>) {
        if (isLoading) return;
        // student id === 1 if it is displayed as demo on landing page
        e.preventDefault();
        if (studentId === '1') {
            toast('This is just a demo blog. Only actual student blogs can be commented.')
            return;
        }
        // Check cool down time
        if (commentCoolDown === null) {
            toast.error(`Commenting has been disabled for you account`, {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            })
            return;
        }
        if (commentCoolDown) {
            const response = checkCommentCoolDown(commentCoolDown) as { remaining: string, isDisabled: boolean }
            if (response.isDisabled) {
                toast.error(`Cooldown in progress. Please wait ${response.remaining} seconds.`, {
                    style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
                })
                return;
            }
        }
        try {
            setIsLoading(true)
            const newComment = await addComment(responseId, commentText, studentId, sessionId, classroomId)
            setAllComments(prev => [newComment as unknown as ResponseComment, ...prev])
            setCommentText('');
            toast('Comment Added!');

            // Update the time stamp in the local storage
            const lastCommentStamp = new Date();
            localStorage.setItem('lastCommentDate', lastCommentStamp.toString())
        } catch (error) {
            console.log('error adding comment ', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function deleteCommentHandler(commentId: string) {
        try {
            // studentId here is actually teacherId in this context
            const response = await deleteComment(commentId, studentId)
            if (response.success) {
                setAllComments(prev => prev.filter(comment => comment.id !== commentId))
                toast.error(`Comment Deleted`, {
                    style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
                })
            }
        } catch (error) {
            console.log('error deleting comment', error)
        }
    }


    return (
        <section className="relative mx-auto" id="comment-section-main">
            <h3 className="h3-bold text-center pb-3">Comments</h3>

            {discussionStatus === 'OPEN' &&
                <form
                    onSubmit={(e) => addCommentHandler(e)}
                    className="relative"
                >
                    <div className="mb-10">
                        <Textarea
                            onPaste={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onDrop={(e) => e.preventDefault()}
                            onDragOver={(e) => e.preventDefault()}
                            placeholder="Add a comment..."
                            required={true}
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
                                color="gray"
                            />
                            :
                            <SendHorizonalIcon
                                className="text-primary"
                                size={22}
                            />
                        }
                    </button>
                </form>
            }
            {allComments?.length > 0 && allComments.map((comment: ResponseComment) => (
                <SingleComment
                    key={comment?.id}
                    commentData={comment as ResponseComment}
                    responseId={responseId}
                    studentId={studentId}
                    sessionId={sessionId}
                    discussionStatus={discussionStatus}
                    commentCoolDown={commentCoolDown}
                    deleteCommentHandler={deleteCommentHandler}
                    isTeacherView={isTeacherView}
                    classroomId={classroomId}
                />
            ))}
        </section>
    )
}
