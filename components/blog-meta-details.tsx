'use client'
import { Response } from "@/types";
import { BiMessageRounded } from "react-icons/bi";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import Link from "next/link";
import { toggleResponseLike } from "@/lib/actions/response.action";
import { formatDateMonthDayYear } from "@/lib/utils";
import { PrinterIcon } from "lucide-react";
import Image from "next/image";

interface Props {
    responseData: Response,
    studentId: string;
    teacherView: boolean
}

export default function BlogMetaDetails({
    responseData,
    studentId,
    teacherView
}: Props) {

    const [isBlogLikedByUser, setIsBlogLikeByUser] = useState<boolean>(false);
    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(responseData.likeCount);
    const [totalComments, setTotalComments] = useState<number>(responseData?._count?.comments ?? 0)

    useEffect(() => {
        if (studentId && responseData._count) {
            const isLiked = responseData?.likes?.some((like) => like.userId === studentId);
            setIsBlogLikeByUser(isLiked);
            setTotalComments(responseData?._count?.comments ?? 0)
        }
    }, [responseData.likes, responseData._count, studentId]);


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
            // if studentId === 1, then it is the display on the landing page an should not actually like
            if (studentId !== '1') {
                await toggleResponseLike(responseData.id, studentId)
            }
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
        <>
            <h1 className="max-w-[700px] mx-auto leading-[2rem] sm:leading-[2.2rem] text-[30px] sm:text-[36px] mb-[18px] font-[700]">{(responseData?.response as { answer: string }[])?.[1]?.answer}</h1>
            {/* Author information */}
            <section className="flex max-w-[700px] mx-auto">
                <Image
                    src={responseData?.student?.avatarURL || '/images/demo-avatars/1.png'}
                    alt="blog cover photo"
                    width={40}
                    height={40}
                    className="rounded-full w-[40px] h-[40px]"
                />
                <div className="ml-2 w-full text-sm text-muted-foreground flex-between">
                    <div>
                        <p className="leading-5">{responseData.student.username}</p>
                        <div className="flex justify-between w-full">
                            <p className="leading-5">{formatDateMonthDayYear(responseData?.submittedAt)}</p>
                        </div>
                    </div>
                    {teacherView && (
                        <PrinterIcon
                            className="hover:cursor-pointer hover:text-ring"
                            onClick={() => window.print()}
                        />
                    )}
                </div>
            </section>
            {/* Comment LIke Bar */}
            <section className="flex items-center mx-auto mb-5 justify-between py-[5px] max-w-[700px] my-3 px-4 text-muted-foreground border-t border-b border-input">
                <div className="flex items-center text-muted-foreground">
                    {isBlogLikedByUser ?
                        <FaHeart
                            onClick={() => toggleResponseLikeHandler('remove')}
                            className="text-[1.5rem] mr-[4px] hover:cursor-pointer text-sidebar-primary"
                        />
                        :
                        <FaRegHeart
                            onClick={() => toggleResponseLikeHandler('add')}
                            className="text-[1.5rem] mr-[4px] hover:cursor-pointer"
                        />
                    }
                    <p className="mr-5 text-[.95rem]">{totalCommentLikes}</p>
                    <Link
                        href="#comment-section-main"
                    >
                        <BiMessageRounded
                            className="text-[1.5rem] mr-[2px] hover:cursor-pointer"
                        />
                    </Link>
                    <p className="text-[.95rem]">{totalComments}</p>
                </div>
            </section>
        </>
    )
}
