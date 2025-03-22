import { formatDateMonthDayYear } from "@/lib/utils";
import { ResponseComment } from "@/types";
import { toggleCommentLike } from "@/lib/actions/comment.action";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";

export default function CommentReplySection({
    replyCommentData,
    studentId,
}: {
    replyCommentData: ResponseComment,
    studentId: string
}) {

    const [isLikedByUser, setIsLikeByUser] = useState<boolean>(false)
    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(replyCommentData?.likeCount || 0)


    useEffect(() => {
        if (studentId && replyCommentData?.likes?.length > 0) {
            const isLiked = replyCommentData.likes.some((like) => like.userId === studentId);
            setIsLikeByUser(isLiked);
        }
    }, [replyCommentData?.likes, studentId]);

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
            console.log('error adding comment ', error)
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
                <p className="relative w-9 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {replyCommentData?.user?.username?.charAt(0).toUpperCase()}
                </p>
                <div className="flex justify-between items-center w-full ml-3">
                    <div>
                        <p className="leading-none text-[.95rem] mb-1 text-primary">{replyCommentData.user.username}</p>
                        <p className="leading-none text-[.95rem] text-input">{formatDateMonthDayYear(replyCommentData.createdAt)}</p>
                    </div>
                    <div className="flex items-center text-primary">
                        {isLikedByUser ?
                            <FaHeart
                                onClick={() => toggleCommentLikeHandler('remove', replyCommentData.id)}
                                size={20}
                                className="hover:cursor-pointer text-sidebar-primary" />
                            :
                            <FaRegHeart
                                onClick={() => toggleCommentLikeHandler('add', replyCommentData.id)}
                                size={20}
                                className="hover:cursor-pointer" />
                        }
                        <p className="text-[.95rem] ml-1">{totalCommentLikes?.toString()}</p>
                    </div>
                </div>
            </div>
            <p className="px-[45px] whitespace-pre mt-1">{replyCommentData.text}</p>
        </div>
    )
}
