"use client"
import { PromptSession, Question, Response, ResponseData } from '@/types'
import React, { useEffect, useState } from 'react'
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import AnswerQuip from '@/components/forms/quip-forms/answer-quip'
import { deleteQuip, getReponsesForQuip } from '@/lib/actions/quips.action'
import { ClassUserRole } from '@prisma/client'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import LoadingAnimation from '@/components/loading-animation'
import { formatDateMonthDayYear } from '@/lib/utils'
import { Trash2, } from 'lucide-react'
import QuipSingleResponse from './quip-single-response'
import Image from 'next/image'

export default function QuipListItem({
    singleQuip,
    userId,
    role,
    classId,
    indexNumber
}: {
    singleQuip: PromptSession;
    userId: string;
    role: ClassUserRole;
    classId: string;
    indexNumber: string
}) {

    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
    const [isComplete, setIsComplete] = useState<boolean>(singleQuip?.responses?.some(res => res.studentId === userId) || false)
    const [showResponses, setShowResponses] = useState<boolean>(false)
    const queryClient = useQueryClient();

    // Fetch responses only when accordion is opened
    const { data: studentResponses = null } = useQuery({
        queryKey: ['quipResponses', singleQuip.id],
        queryFn: async () => {
            const responses = await getReponsesForQuip(userId, singleQuip.id);
            return responses as Response[];
        },
        enabled: showResponses && (isComplete || role === ClassUserRole.TEACHER),
        staleTime: 1000 * 60 * 5,
    });



    // Set complete status
    useEffect(() => {
        setIsComplete(singleQuip?.responses?.some(res => res.studentId === userId) || false)
    }, [singleQuip])

    function completeStatusTrue() {
        setIsComplete(true)
    }

    async function deleteQuipHandler() {
        try {
            if (role !== ClassUserRole.TEACHER) return;
            const deletedQuip = await deleteQuip(userId, singleQuip.id) as PromptSession
            queryClient.setQueryData<PromptSession[]>(['getAllQuips', classId], old =>
                (old || []).filter(q => q.id !== deletedQuip.id)
            );
            setOpenDeleteModal(false)
        } catch (error) {
            console.error('error deleting quip ', error)
        }
    }

    const quipQuestion = (singleQuip?.questions as Question[])[0]?.question

    return (
        <>
            <ResponsiveDialog
                isOpen={openDeleteModal}
                setIsOpen={setOpenDeleteModal}
                title="Delete Quip"
            >
                <p className='text-center'>Are you sure you want to delete this quip?</p>
                <Button variant='destructive' onClick={deleteQuipHandler} className='mx-auto'>
                    Delete Quip
                </Button>
            </ResponsiveDialog>


            <AccordionItem value={`item-${indexNumber}`} className='rounded-lg mb-5 bg-card shadow-sm overflow-hidden border data-[state=open]:border-primary hover:border-primary transition-all'>
                {/* Post Header */}
                <div className="flex items-center gap-3 p-4 pb-2">
                    <Image
                        src={singleQuip?.author?.avatarURL || '/images/demo-avatars/1.png'}
                        alt="author avatar"
                        width={44}
                        height={44}
                        className="rounded-full w-[44px] h-[44px] border"
                    />
                    <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">{singleQuip?.author?.username}</p>
                        <p className="text-xs text-muted-foreground">{formatDateMonthDayYear(singleQuip?.assignedAt)}</p>
                    </div>
                    {role === ClassUserRole.TEACHER && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDeleteModal(true);
                            }}
                        >
                            <Trash2 size={18} />
                        </Button>
                    )}
                </div>

                {/* Post Content - The Question */}
                <AccordionTrigger
                    onClick={() => setShowResponses(true)}
                    className='px-6 pt-1 pb-5 rounded-md hover:bg-accent/50 data-[state=open]:rounded-b-none  cursor-pointer hover:no-underline items-center hover:text-primary transition-colors'
                >
                    <p className='ml-1 mr-4 font-bold text-xl sm:text-2xl  '>
                        {quipQuestion}
                    </p>
                </AccordionTrigger>

                {/* Responses Section */}
                <AccordionContent className='bg-muted/30 px-4 py-4 space-y-3'>
                    {isComplete || role !== ClassUserRole.STUDENT ? (
                        studentResponses ? studentResponses.map((response) => (
                            <QuipSingleResponse
                                key={response.id}
                                responseId={response.id}
                                responseText={(response?.response as unknown as ResponseData[])[0]?.answer}
                                userId={userId}
                                responseDate={response?.createdAt}
                                isTeacherView={role === ClassUserRole.TEACHER}
                                responseLikes={response?.likes}
                                likeCount={response?.likeCount}
                                authorAvatarUrl={response?.student?.avatarURL as string}
                                responseAuthor={response?.student?.username as string}
                                teacherId={singleQuip.authorId || userId}
                                classId={classId}
                                quipId={singleQuip.id}
                            />
                        )) : (
                            <LoadingAnimation />
                        )
                    ) : (
                        <AnswerQuip
                            studentId={userId}
                            promptSessionId={singleQuip.id}
                            quipQuestion={quipQuestion}
                            completeStatusTrue={completeStatusTrue}
                        />
                    )}
                </AccordionContent>
            </AccordionItem>
        </>
    )
}
