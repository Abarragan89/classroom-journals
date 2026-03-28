import { formatDateMonthDayYear } from "@/lib/utils";
import { ResponseComment } from "@/types";
import { toggleCommentLike } from "@/lib/actions/comment.action";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import Image from "next/image";

export default function CommentReplySection({
    replyCommentData,
    studentId,
    isTeacherView,
    deleteCommentHandler
}: {
    replyCommentData: ResponseComment,
    studentId: string,
    isTeacherView: boolean,
    deleteCommentHandler: (commentId: string) => void
}) {

    const [isLikedByUser, setIsLikeByUser] = useState<boolean>(
        replyCommentData?.likes?.some((like) => like.userId === studentId) ?? false
    )
    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(replyCommentData?.likeCount || 0)

    // This to toggle replies an comment likes.
    async function toggleCommentLikeHandler(toggleOption: string, commentId: string) {
        try {
            if (toggleOption === 'add') {
                setIsLikeByUser(true)
                setTotalCommentLikes(prev => prev + 1)
            } else if (toggleOption === 'remove') {
                setIsLikeByUser(false)
                setTotalCommentLikes(prev => prev - 1)
            }
            await toggleCommentLike(commentId, studentId)
        } catch (error) {
            console.error('error adding comment ', error)
            if (toggleOption === 'add') {
                setIsLikeByUser(true)
                setTotalCommentLikes(prev => prev - 1)
            } else if (toggleOption === 'remove') {
                setIsLikeByUser(false)
                setTotalCommentLikes(prev => prev + 1)
            }
        }
    }

    return (
        <div className="mb-4 border-l ps-4">
            <div className="flex items-center">
                <Image
                    src={replyCommentData?.user?.avatarURL || '/images/demo-avatars/1.png'}
                    alt={`${replyCommentData?.user?.username ?? 'User'}'s avatar`}
                    width={80}
                    height={80}
                    className="rounded-full w-[40px] h-[40px] border"
                />
                <div className="flex justify-between items-center w-full ml-3">
                    <div>
                        <p className="leading-none text-[.95rem] mb-1 text-primary">{replyCommentData?.user?.username}</p>
                        <p className="leading-none text-[.95rem] text-muted-foreground">{formatDateMonthDayYear(replyCommentData?.createdAt)}</p>
                    </div>
                    <div className="flex items-center text-primary">
                        {isTeacherView &&
                            <button
                                type="button"
                                onClick={() => deleteCommentHandler(replyCommentData.id)}
                                className="text-destructive mr-3 text-sm hover:cursor-pointer hover:underline"
                            >
                                Delete
                            </button>

                        }
                        {isLikedByUser ?
                            <button
                                type="button"
                                aria-label="Unlike this reply"
                                onClick={() => toggleCommentLikeHandler('remove', replyCommentData?.id)}
                                className="hover:cursor-pointer text-sidebar-primary"
                            >
                                <FaHeart aria-hidden="true" size={20} />
                            </button>
                            :
                            <button
                                type="button"
                                aria-label="Like this reply"
                                onClick={() => toggleCommentLikeHandler('add', replyCommentData?.id)}
                                className="hover:cursor-pointer"
                            >
                                <FaRegHeart aria-hidden="true" size={20} />
                            </button>
                        }
                        <span className="text-[.95rem] ml-1" aria-label={`${totalCommentLikes} likes`}>{totalCommentLikes?.toString()}</span>
                    </div>
                </div>
            </div>
            <p className="px-[55px] whitespace-pre-wrap break-words mt-1">{replyCommentData?.text}</p>
        </div>
    )
}
