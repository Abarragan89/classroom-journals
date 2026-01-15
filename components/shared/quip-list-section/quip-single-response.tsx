"use client"

import { toggleResponseLike } from "@/lib/actions/response.action";
import { formatDateMonthDayYear } from "@/lib/utils";
import { ResponseLike } from "@/types";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

export default function QuipSingleResponse({
    responseId,
    userId,
    responseText,
    responseDate,
    responseLikes,
    likeCount,
    responseAuthor,
    authorAvatarUrl,
    isTeacherView
}: {
    responseId: string;
    userId: string;
    responseText: string;
    responseDate: Date;
    responseLikes: ResponseLike[];
    likeCount: number;
    responseAuthor: string;
    authorAvatarUrl: string;
    isTeacherView: boolean
}) {


    const [isBlogLikedByUser, setIsBlogLikeByUser] = useState<boolean>(responseLikes?.some((like) => like.userId === userId));
    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(likeCount);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

    useEffect(() => {
        if (userId && responseLikes && likeCount) {
            const isLiked = responseLikes?.some((like) => like.userId === userId);
            setTotalCommentLikes(likeCount)
            setIsBlogLikeByUser(isLiked);
        }
    }, [userId, responseLikes, likeCount]);

    const likeMutation = useMutation({
        mutationFn: () => toggleResponseLike(responseId, userId),
        onMutate: async () => {
            // Save current state for rollback
            const previousLiked = isBlogLikedByUser;
            const previousCount = totalCommentLikes;

            // Optimistic update
            const newLiked = !isBlogLikedByUser;
            setIsBlogLikeByUser(newLiked);
            setTotalCommentLikes(prev => newLiked ? prev + 1 : prev - 1);

            return { previousLiked, previousCount };
        },
        onError: (err, variables, context) => {
            // Automatic rollback with saved state
            console.error('Error toggling like:', err);
            if (context) {
                setIsBlogLikeByUser(context.previousLiked);
                setTotalCommentLikes(context.previousCount);
            }
        }
    });

    function toggleResponseLikeHandler() {
        likeMutation.mutate();
    }

    async function deleteResponse(responseId: string) {
        console.log('delete response called for id: ', responseId)
    }

    return (
        <div className="mt-2 ml-2 border-b border-input last:border-b-0">
            <div className='mb-1 flex'>
                <Image
                    src={authorAvatarUrl || '/images/demo-avatars/1.png'}
                    alt="blog cover photo"
                    width={35}
                    height={35}
                    className="rounded-full w-[35px] h-[35px] border"
                />
                <div className="flex-between w-full items-start">
                    <div className='ml-2 text-muted-foreground'>
                        <p className="leading-4 text-xs">{responseAuthor}</p>
                        <p className="leading-4 text-xs">{formatDateMonthDayYear(responseDate)}</p>
                    </div>


                    {/* Like and Delete BTN if you are a teacher */}
                    <div className="flex-center gap-x-3 text-muted-foreground">
                        {isTeacherView && (
                            showConfirmDelete ? (
                                <div className="flex gap-x-3 items-center">
                                    <Button
                                        variant={"link"}
                                        onClick={async () => {
                                            // Call your delete function here
                                            await deleteResponse(responseId)
                                            setShowConfirmDelete(false)

                                        }}
                                        className="p-0 text-destructive text-xs"
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant={"link"}
                                        className="p-0 text-xs"
                                        onClick={() => setShowConfirmDelete(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant={"link"}
                                    onClick={() => setShowConfirmDelete(true)}
                                    className="p-0 m-0 text-xs text-destructive hover:text-destructive/80 hover:cursor-pointer transition-colors"
                                >
                                    Remove
                                </Button>
                            )
                        )}
                        <div className="flex-center">
                            {isBlogLikedByUser ?
                                <FaHeart
                                    onClick={toggleResponseLikeHandler}
                                    className="text-[1.1rem] mr-[4px] hover:cursor-pointer text-sidebar-primary"
                                />
                                :
                                <FaRegHeart
                                    onClick={toggleResponseLikeHandler}
                                    className="text-[1.1rem] mr-[4px] hover:cursor-pointer"
                                />
                            }
                            <p className="text-[.95rem] text-muted-foreground">{totalCommentLikes}</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className='ml-[2.8rem] pb-2 mb-2 text-foreground'>
                {responseText}
            </p>
        </div>
    )
}
