"use client";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { BarLoader } from "react-spinners";
import { ResponseComment } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { checkCommentCoolDown, formatDateMonthDayYear } from "@/lib/utils";
import { ChevronLeft, ChevronDown, SendHorizonalIcon } from "lucide-react";
import { deleteComment, replyComment, toggleCommentLike } from "@/lib/actions/comment.action";
import CommentReplySection from "./comment-reply-section";
import { toast } from "sonner";
import Image from "next/image";

export default function SingleComment({
    commentData,
    responseId,
    studentId,
    sessionId,
    discussionStatus,
    commentCoolDown,
    isTeacherView,
    deleteCommentHandler,
    classroomId
}: {
    commentData: ResponseComment,
    responseId: string,
    studentId: string,
    sessionId: string,
    discussionStatus: string,
    commentCoolDown?: number,
    isTeacherView: boolean,
    classroomId: string,
    deleteCommentHandler: (commentId: string) => void
}) {

    const [showReplies, setShowReplies] = useState<boolean>(false)
    const [isLikedByUser, setIsLikeByUser] = useState<boolean>(false)

    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(commentData.likeCount || 0)
    const [showReplyTextarea, setShowReplyTextarea] = useState<boolean>(false);
    const [replyText, setReplyText] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [totalReplies, setTotalReplies] = useState<number>(commentData?.replies?.length || 0)
    const [replyCommentState, setReplyCommentState] = useState<ResponseComment[]>(commentData?.replies || [])

    useEffect(() => {
        if (commentData?.likes?.length > 0) {
            const isLiked = commentData?.likes?.some((like) => like.userId === studentId);
            setTotalReplies(commentData.replies.length)
            setIsLikeByUser(isLiked);
        }
    }, [commentData?.likes, commentData.replies.length, studentId]);


    async function addCommentReplyHandler(e: React.FormEvent<HTMLFormElement>) {
        if (isLoading) return;
        e.preventDefault()
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
            const replyCommentData = await replyComment(responseId, commentData.id, replyText.trim(), studentId, sessionId, classroomId)
            setShowReplies(true)
            setReplyCommentState(prev => [replyCommentData as ResponseComment, ...prev])
            setTotalReplies(prev => prev + 1)
            setReplyText('')
            toast('Reply Added!')

            // Update the time stamp in the local storage
            const lastCommentStamp = new Date();
            localStorage.setItem('lastCommentDate', lastCommentStamp.toString())
        } catch (error) {
            console.error('error adding comment ', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function toggleCommentLikeHandler(toggleOption: string, commentId: string, studentId: string) {
        try {
            // change UI immediately, and revert in catch block if there is an error
            if (toggleOption === 'add') {
                setIsLikeByUser(true)
                setTotalCommentLikes(prev => prev + 1)
            } else if (toggleOption === 'remove') {
                setIsLikeByUser(false)
                setTotalCommentLikes(prev => prev - 1)
            }
            await toggleCommentLike(commentId, studentId)
        } catch (error) {
            console.error('error liking comments ', error)
            if (toggleOption === 'add') {
                setIsLikeByUser(true)
                setTotalCommentLikes(prev => prev - 1)
            } else if (toggleOption === 'remove') {
                setIsLikeByUser(false)
                setTotalCommentLikes(prev => prev + 1)
            }
        }
    }

    async function deleteReplyCommentHandler(commendId: string) {
        try {
            // Student Id is actually teacher Id in teacherView=True context
            const response = await deleteComment(commendId, studentId)
            if (response.success) {
                setReplyCommentState(prev => prev.filter(comment => comment.id !== commendId))
                toast.error(`Comment Deleted`, {
                    style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
                })
            }
        } catch (error) {
            console.error('error deleting comment', error)
        }
    }


    return (
        <div className="mb-10 mx-4">
            <div className="flex items-center">
                <Image
                    src={commentData?.user?.avatarURL || '/images/demo-avatars/1.png'}
                    alt={`${commentData?.user?.username ?? 'User'}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full w-[40px] h-[40px] mr-2 border"
                />
                <div className="flex justify-between items-center w-full">
                    <div>
                        <p className="leading-0 text-[.95rem] text-primary">{commentData?.user?.username}</p>
                        <p className="leading-none text-[.95rem] text-muted-foreground">{formatDateMonthDayYear(commentData?.createdAt)}</p>
                    </div>
                    <div className="flex items-center text-primary">
                        {isTeacherView &&
                            <button
                                type="button"
                                onClick={() => deleteCommentHandler(commentData.id)}
                                className="text-destructive mr-3 text-sm hover:cursor-pointer hover:underline"
                            >
                                Delete
                            </button>

                        }
                        {isLikedByUser ?
                            <button
                                type="button"
                                aria-label="Unlike this comment"
                                onClick={() => toggleCommentLikeHandler('remove', commentData?.id, studentId)}
                                className="hover:cursor-pointer text-sidebar-primary"
                            >
                                <FaHeart aria-hidden="true" size={20} />
                            </button>
                            :
                            <button
                                type="button"
                                aria-label="Like this comment"
                                onClick={() => toggleCommentLikeHandler('add', commentData?.id, studentId)}
                                className="hover:cursor-pointer"
                            >
                                <FaRegHeart aria-hidden="true" size={20} />
                            </button>
                        }
                        <span className="text-[.95rem] ml-1" aria-label={`${totalCommentLikes} likes`}>{totalCommentLikes?.toString()}</span>
                    </div>
                </div>
            </div>
            <p className="text-[1rem] mt-0 whitespace-pre-wrap break-words ml-[50px]">{commentData?.text}</p>

            {/* Conditionally render reply form */}
            {showReplyTextarea && discussionStatus === 'OPEN' &&
                <section className="relative max-w-[700px] mx-auto pb-2 pt-5" id="comment-section-main">
                    <form
                        onSubmit={(e) => addCommentReplyHandler(e)}
                        className="w-11/12 ml-auto mt-[-18px]"
                    >
                        <div>
                            <Textarea
                                onPaste={(e) => e.preventDefault()}
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                onDrop={(e) => e.preventDefault()}
                                onDragOver={(e) => e.preventDefault()}
                                required={true}
                                aria-label="Reply to comment"
                                placeholder="reply to comment..."
                                rows={3}
                                value={replyText}
                                className="pr-5 h-[90px] resize-none mt-2"
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                        <button
                            aria-label="Submit comment"
                            type="submit"
                            className={`absolute right-[17px] top-[65px] h-[30px]`}
                        >
                            {isLoading ?
                                <BarLoader
                                    width={15}
                                    height={2}
                                    loading={isLoading}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                    className="text-primary bg-primary"
                                />
                                :
                                <SendHorizonalIcon
                                    aria-hidden="true"
                                    className="text-primary"
                                    size={22}
                                />
                            }
                        </button>
                    </form>
                </section>
            }

            <div className="flex justify-between text-muted-foreground items-center text-[.975rem] mx-[50px] mt-2">
                <button
                    type="button"
                    aria-expanded={showReplies}
                    aria-label={`${showReplies ? 'Hide' : 'Show'} replies (${totalReplies})`}
                    onClick={() => setShowReplies(prev => !prev)}
                    className="w-fit mr-0 flex justify-end items-center hover:cursor-pointer"
                >
                    <span>replies</span>
                    <span className="text-[.9rem] ml-[4px]" aria-hidden="true">{totalReplies}</span>
                    {showReplies ? <ChevronLeft aria-hidden="true" size={18} /> : <ChevronDown aria-hidden="true" size={18} />}
                </button>
                {showReplyTextarea ?
                    <button
                        type="button"
                        onClick={() => setShowReplyTextarea(false)}
                        className="hover:cursor-pointer text-[.95rem] underline text-primary opacity-[0.7] hover:opacity-[1]"
                    >
                        Cancel
                    </button>
                    :
                    discussionStatus === 'OPEN' &&
                    <button
                        type="button"
                        onClick={() => setShowReplyTextarea(true)}
                        className="hover:cursor-pointer text-[.95rem] underline text-primary opacity-[0.7] hover:opacity-[1]"
                    >
                        Reply
                    </button>
                }
            </div>

            {/* Replies */}
            {showReplies &&
                <div style={{ transform: "scale(.97)" }}
                    className="ml-8 mt-4"
                >
                    {replyCommentState && replyCommentState.map((reply: ResponseComment, index: number) => (
                        <CommentReplySection
                            key={index}
                            replyCommentData={reply}
                            studentId={studentId}
                            isTeacherView={isTeacherView}
                            deleteCommentHandler={deleteReplyCommentHandler}
                        />
                    ))}
                </div>
            }
        </div>
    )
}
