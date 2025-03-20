"use client";
import { useState, useEffect } from "react";
// import { IoChevronDownOutline } from "react-icons/io5";
// import { FaHeart } from "react-icons/fa";
// import { FaRegHeart } from "react-icons/fa6";
// import { FiChevronLeft } from "react-icons/fi";
// import { Session } from "../../types/users";
// import { Comment } from "../../types/comment";
// import { formatDate } from "../../utils/formatDate";
import { useRouter, usePathname } from "next/navigation";
// import axios from "axios";
// import TextareaLabel from "./FormInputs/TextareaLabel";
import { BarLoader } from "react-spinners";
// import CommentReplySection from "./comment-reply-section";
import { ResponseComment } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { formatDateMonthDayYear } from "@/lib/utils";
import { ChevronLeft, ChevronDown, SendHorizonalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { replyComment } from "@/lib/actions/comment.action";

export default function SingleComment({
    commentData, responseId, studentId
}: {
    commentData: ResponseComment, responseId: string, studentId: string
}) {
    const [showReplies, setShowReplies] = useState<boolean>(false)
    const [isLikedByUser, setIsLikeByUser] = useState<boolean>(false)

    // const [totalCommentLikes, setTotalCommentLikes] = useState<number>(commentData.likeCount || 0)
    const [showReplyTextarea, setShowReplyTextarea] = useState<boolean>(false);
    const [replyText, setReplyText] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [replyCommentState, setReplyCommentState] = useState<Comment[]>(commentData.replies)

    const router = useRouter();
    const pathname = usePathname();

    // useEffect(() => {
    //     if (session.data?.user?.id && commentData.likes.length > 0) {
    //         const isLiked = commentData.likes.some((like) => like.userId === session?.data?.user?.id);
    //         setIsLikeByUser(isLiked);
    //     }
    // }, [commentData?.likes, session?.data?.user?.id]);

    const handleShowLoginModal = () => {
        // Use router.push with the new query parameter
        router.push(`${window.location.origin}/${pathname}?showModal=login`, {
            scroll: false
        })
    };


    async function addCommentReplyHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        try {
            const replyCommentData = await replyComment(responseId, commentData.id, replyText, studentId)
            console.log('replay comment data in front end, ', replyCommentData)
        } catch (error) {
            console.log('error adding comment ', error)
        }
    }

    // async function addCommentReplyHandler(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault();
    //     try {
    //         setIsLoading(true);
    //         const { data } = await axios.post('/api/userRoutes/commentReplies', {
    //             text: replyText.trim(),
    //             blogId: blogId,
    //             commentId: commentData.id
    //         })

    //         setReplyCommentState(prev => [data.comment, ...prev])

    //         // create notifications. Someone replied to your comment
    //         await axios.post('/api/userRoutes/notifications/replyToComment', {
    //             blogId,
    //             replierId: session.data?.user?.id,
    //             commentOwnerId: commentData?.user?.id,
    //             replierName: session.data?.user?.name,
    //             blogSlug: pathname.split('/')[2],
    //             commentText: replyText.trim(),
    //             blogTitle
    //         })

    //     } catch (error) {
    //         console.log('error adding comment ', error)
    //     } finally {
    //         setIsLoading(false);
    //         setReplyText('');
    //         setShowReplyTextarea(false)
    //         setShowReplies(true)
    //     }
    // }

    // This to toggle likes in main comment

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
        <div className="mb-7 mx-4">
            <div className="flex items-center">
                <p className="relative w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-2">
                    {commentData?.user?.username?.charAt(0).toUpperCase()}
                </p>
                <div className="flex justify-betweenitems-center w-full">
                    <div>
                        <p className="leading-0 text-[.95rem] text-primary">{commentData.user.username}</p>
                        <p className="leading-none text-[.95rem] text-input">{formatDateMonthDayYear(commentData.createdAt)}</p>
                    </div>
                    <div className="flex items-center text-primary">
                        {/* {isLikedByUser ?
                            <FaHeart
                                onClick={session.status === 'authenticated' ? () => toggleCommentLike('remove', commentData.id) : handleShowLoginModal}
                                size={20}
                                className="hover:cursor-pointer text-[var(--success)]" />
                            :
                            <FaRegHeart
                                onClick={session.status === 'authenticated' ? () => toggleCommentLike('add', commentData.id) : handleShowLoginModal}
                                size={20}
                                className="hover:cursor-pointer" />
                        } */}
                        {/* <p className="text-[.95rem] ml-1">{totalCommentLikes?.toString()}</p> */}
                    </div>
                </div>
            </div>
            <p className="text-[1rem] mt-0 whitespace-pre ml-[45px] pb-3">{commentData.text}</p>

            {/* Conditionally render reply form */}
            {showReplyTextarea &&
                <section className="relative max-w-[700px] mx-auto pb-5 pt-5" id="comment-section-main">
                    <form
                        onSubmit={(e) => addCommentReplyHandler(e)}
                        className="w-11/12 ml-auto mt-[-18px]"
                    >
                        <div>
                            <Textarea
                                placeholder="reply to comment..."
                                rows={3}
                                className="pr-5 h-[90px] resize-none"
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`absolute right-[17px] top-[58px] h-[30px]`}
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
                </section>
            }

            <div className="flex justify-between text-input items-center text-[.975rem] mx-[50px] mt-2">
                <div
                    onClick={() => setShowReplies(prev => !prev)}
                    className="w-fit mr-0 flex justify-end  items-center hover:cursor-pointer"
                >
                    <p>replies</p>
                    <p className="text-[.9rem] ml-[4px]">{commentData?.replies?.length || 0}</p>
                    {showReplies ? <ChevronLeft size={18} /> : <ChevronDown size={18} />}
                </div>
                {showReplyTextarea ?
                    <p
                        onClick={() => setShowReplyTextarea(false)}
                        className="hover:cursor-pointer text-[.95rem] underline text-primary opacity-[0.7] hover:opacity-[1]"
                    >
                        Cancel
                    </p>
                    :
                    <p
                        onClick={() => setShowReplyTextarea(true)}
                        className="hover:cursor-pointer text-[.95rem] underline text-primary opacity-[0.7] hover:opacity-[1]"
                    >
                        Reply
                    </p>
                }
            </div>

            {/* Replies */}
            {showReplies &&
                <div style={{ transform: "scale(0.88)" }}
                    className=""
                >
                    {replyCommentState && replyCommentState.map((reply: Comment, index: number) => (
                        <CommentReplySection
                            key={index}
                            handleShowLoginModal={handleShowLoginModal}
                            replyCommentData={reply}
                        />
                    ))}
                </div>
            }
        </div>
    )
}
