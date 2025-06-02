"use client"

import { toggleResponseLike } from "@/lib/actions/response.action";
import { formatDateMonthDayYear } from "@/lib/utils";
import { ResponseLike } from "@/types";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import Image from "next/image";

export default function QuipSingleResponse({
    responseId,
    userId,
    responseText,
    responseDate,
    responseLikes,
    likeCount,
    responseAuthor,
    authorAvatarUrl
}: {
    responseId: string;
    userId: string;
    responseText: string;
    responseDate: Date;
    responseLikes: ResponseLike[];
    likeCount: number;
    responseAuthor: string;
    authorAvatarUrl: string
}) {

    const [isBlogLikedByUser, setIsBlogLikeByUser] = useState<boolean>(responseLikes?.some((like) => like.userId === userId));
    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(likeCount);

    useEffect(() => {
        if (userId && responseLikes && likeCount) {
            const isLiked = responseLikes?.some((like) => like.userId === userId);
            setTotalCommentLikes(likeCount)
            setIsBlogLikeByUser(isLiked);
        }
    }, [userId, responseLikes, likeCount]);

    async function toggleResponseLikeHandler(toggleOption: string) {
        // there will not be a response id if it is in preview mode
        try {
            if (toggleOption === 'add') {
                setIsBlogLikeByUser(true)
                setTotalCommentLikes(prev => prev + 1)
            } else if (toggleOption === 'remove') {
                setIsBlogLikeByUser(false)
                setTotalCommentLikes(prev => prev - 1)
            }
            await toggleResponseLike(responseId, userId)
        } catch (error) {
            console.log('error adding comment ', error)
            if (toggleOption === 'add') {
                setIsBlogLikeByUser(true)
                setTotalCommentLikes(prev => prev - 1)
            } else if (toggleOption === 'remove') {
                setIsBlogLikeByUser(false)
                setTotalCommentLikes(prev => prev + 1)
            }
        }
    }

    return (
        <div className="mt-2">
            <div className='ml-12 flex'>
                <Image
                    src={authorAvatarUrl || '/images/demo-avatars/1.png'}
                    alt="blog cover photo"
                    width={1024}
                    height={1024}
                    className="rounded-full w-[35px] h-[35px]"
                />
                <div className="flex justify-between w-full items-start">
                    <div className='ml-2 text-input'>
                        <p className="leading-5 text-xs">{responseAuthor}</p>
                        <p className="leading-5 text-xs">{formatDateMonthDayYear(responseDate)}</p>
                    </div>
                    <div className="flex mt-[2px] text-input">
                        {isBlogLikedByUser ?
                            <FaHeart
                                onClick={() => toggleResponseLikeHandler('remove')}
                                className="text-[1.1rem] mr-[4px] hover:cursor-pointer text-sidebar-primary"
                            />
                            :
                            <FaRegHeart
                                onClick={() => toggleResponseLikeHandler('add')}
                                className="text-[1.1rem] mr-[4px] hover:cursor-pointer"
                            />
                        }
                        <p className="text-[.95rem] text-input">{totalCommentLikes}</p>
                    </div>
                </div>
            </div>
            <p className='ml-[5.55rem] text-foreground'>
                {responseText}
            </p>
        </div>
    )
}
