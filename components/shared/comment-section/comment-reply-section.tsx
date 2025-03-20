import { formatDateMonthDayYear } from "@/lib/utils";
import { ResponseComment } from "@/types";
import Image from "next/image"
import { useEffect, useState } from "react";
// import { FaHeart } from "react-icons/fa";
// import { FaRegHeart } from "react-icons/fa6";
// import { Comment } from "../../types/comment";
// import { formatDate } from "../../utils/formatDate";
// import { Session } from "../../types/users";
// import axios from "axios";

export default function CommentReplySection({
    replyCommentData,
}
    :
    {
        replyCommentData: ResponseComment,
    }) {

    const [isLikedByUser, setIsLikeByUser] = useState<boolean>(false)
    // const [totalCommentLikes, setTotalCommentLikes] = useState<number>(replyCommentData.likeCount || 0)


    // useEffect(() => {
    //     if (session.data?.user?.id && replyCommentData.likes.length > 0) {
    //         const isLiked = replyCommentData.likes.some((like) => like.userId === session?.data?.user?.id);
    //         setIsLikeByUser(isLiked);
    //     }
    // }, [replyCommentData?.likes, session.data?.user?.id]);

    // This to toggle replies an comment likes.
    // async function toggleCommentLike(toggleOption: string, commentId: string) {
    //     try {
    //         await axios.put('/api/userRoutes/comments', {
    //             commentId
    //         })
    //         if (toggleOption === 'add') {
    //             setIsLikeByUser(true)
    //             setTotalCommentLikes(prev => prev + 1)
    //         } else if (toggleOption === 'remove') {
    //             setIsLikeByUser(false)
    //             setTotalCommentLikes(prev => prev - 1)
    //         }
    //     } catch (error) {
    //         console.log('error adding comment ', error)
    //     }
    // }

    return (
        <div className="mb-4 border-l ps-4">
            <div className="flex items-center">
                <p className="relative w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-2">
                    {replyCommentData?.user?.username?.charAt(0).toUpperCase()}
                </p>
                <div className="flex justify-between items-center w-full ml-3">
                    <div>
                        <p className="leading-none text-[.95rem] mb-1">{replyCommentData.user.username}</p>
                        <p className="leading-none text-[.95rem] text-input">{formatDateMonthDayYear(replyCommentData.createdAt)}</p>
                    </div>
                    <div className="flex items-center text-[var(--gray-600)]">

                        {/* {isLikedByUser ?
                            <FaHeart
                                onClick={session.status === 'authenticated' ? () => toggleCommentLike('remove', replyCommentData.id) : handleShowLoginModal}
                                size={20}
                                className="hover:cursor-pointer text-[var(--success)]" />
                            :
                            <FaRegHeart
                                onClick={session.status === 'authenticated' ? () => toggleCommentLike('add', replyCommentData.id) : handleShowLoginModal}
                                size={20}
                                className="hover:cursor-pointer" />
                        } */}
                        {/* <p className="text-[.95rem] ml-1">{totalCommentLikes?.toString()}</p> */}
                    </div>
                </div>
            </div>
            <p className="text-[1rem] px-[50px] mt-2 whitespace-pre">{replyCommentData.text}</p>
        </div>
    )
}
