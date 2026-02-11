"use client"

import { toggleResponseLike, deleteResponse as deleteResponseAction } from "@/lib/actions/response.action";
import { formatDateMonthDayYear } from "@/lib/utils";
import { ResponseLike, PromptSession, Response as QuipResponse } from "@/types";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function QuipSingleResponse({
    responseId,
    userId,
    responseText,
    responseDate,
    responseLikes,
    likeCount,
    responseAuthor,
    authorAvatarUrl,
    isTeacherView,
    teacherId,
    classId,
    quipId
}: {
    responseId: string;
    userId: string;
    responseText: string;
    responseDate: Date;
    responseLikes: ResponseLike[];
    likeCount: number;
    responseAuthor: string;
    authorAvatarUrl: string;
    isTeacherView: boolean;
    teacherId: string;
    classId: string;
    quipId: string;
}) {

    const queryClient = useQueryClient();
    const [isBlogLikedByUser, setIsBlogLikeByUser] = useState<boolean>(responseLikes?.some((like) => like.userId === userId));
    const [totalCommentLikes, setTotalCommentLikes] = useState<number>(likeCount);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

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
        onError: (err, _variables, context) => {
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

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('teacherId', teacherId);
            formData.append('response-id', responseId);
            return await deleteResponseAction(null, formData);
        },
        onMutate: async () => {
            // Cancel outgoing refetches to prevent race conditions
            await queryClient.cancelQueries({ queryKey: ['quipResponses', quipId] });
            await queryClient.cancelQueries({ queryKey: ['getAllQuips', classId] });

            // Snapshot the previous values for rollback
            const previousResponses = queryClient.getQueryData<QuipResponse[]>(['quipResponses', quipId]);
            const previousQuips = queryClient.getQueryData<PromptSession[]>(['getAllQuips', classId]);

            // Optimistically update quipResponses cache
            queryClient.setQueryData<QuipResponse[]>(['quipResponses', quipId], (old) => 
                old?.filter(response => response.id !== responseId) || []
            );

            // Optimistically update getAllQuips cache
            queryClient.setQueryData<PromptSession[]>(['getAllQuips', classId], (old) => {
                if (!old) return old;
                return old.map(quip => ({
                    ...quip,
                    responses: quip.responses?.filter(response => response.id !== responseId) || []
                }));
            });

            return { previousResponses, previousQuips };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            console.error('Error deleting response:', err);
            if (context?.previousResponses) {
                queryClient.setQueryData(['quipResponses', quipId], context.previousResponses);
            }
            if (context?.previousQuips) {
                queryClient.setQueryData(['getAllQuips', classId], context.previousQuips);
            }
            toast.error('Failed to delete response');
        },
        onSuccess: (data) => {
            if (data?.success) {
                toast.success('Response deleted successfully');
                setShowConfirmDelete(false);
            } else {
                toast.error(data?.message || 'Failed to delete response');
            }
        }
    });

    async function handleDeleteResponse() {
        deleteMutation.mutate();
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
                                        onClick={handleDeleteResponse}
                                        disabled={deleteMutation.isPending}
                                        className="p-0 text-destructive text-xs disabled:opacity-50"
                                    >
                                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                    </Button>
                                    <Button
                                        variant={"link"}
                                        className="p-0 text-xs"
                                        onClick={() => setShowConfirmDelete(false)}
                                        disabled={deleteMutation.isPending}
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
            <p className='ml-[2.8rem] pb-2 mb-2 text-foreground break-words'>
                {responseText}
            </p>
        </div>
    )
}
