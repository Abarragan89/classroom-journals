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
import { useQueryClient } from '@tanstack/react-query'
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
    const [studentResponses, setStudentResponses] = useState<Response[] | null>(null)
    const [showResponses, setShowResponses] = useState<boolean>(false)
    const queryClient = useQueryClient();



    // Set complete status
    useEffect(() => {
        setIsComplete(singleQuip?.responses?.some(res => res.studentId === userId) || false)
    }, [singleQuip])

    useEffect(() => {
        if ((isComplete || role === "TEACHER") && showResponses) {
            getStudentResponses()
        }
    }, [isComplete, role, showResponses])

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
            console.log('error deleting quip ', error)
        }
    }

    async function getStudentResponses() {
        try {
            const responses = await getReponsesForQuip(userId, singleQuip.id) as Response[];
            setStudentResponses(responses)
        } catch (error) {
            console.log('error getting student reponses to quips', error)
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
            <AccordionItem value={`item-${indexNumber}`} className='relative'>
                <div className="flex flex-col mt-1">
                    <div className='flex'>
                        <Image
                            src={singleQuip?.author?.avatarURL || '/images/demo-avatars/1.png'}
                            alt="blog cover photo"
                            width={1024}
                            height={1024}
                            className="rounded-full w-[40px] h-[40px]"
                        />
                        <div className="flex-between">
                            <div className='ml-2 text-input'>
                                <p className="leading-5 text-sm">{singleQuip?.author?.username}</p>
                                <p className="leading-5 text-sm">{formatDateMonthDayYear(singleQuip?.assignedAt)}</p>
                            </div>
                            {role === ClassUserRole.TEACHER && (
                                <p onClick={(e) => { setOpenDeleteModal(true); e.stopPropagation(); }} className='text-destructive absolute top-1 -right-[2px]'>
                                    <Trash2
                                        className='hover:cursor-pointer opacity-80 hover:opacity-100'
                                        size={18}
                                    />
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <AccordionTrigger onClick={() => setShowResponses(true)} className='py-2 items-start'>
                    <p className='text-md font-bold text-foreground mx-12 tracking-wide'>{quipQuestion}</p>
                </AccordionTrigger>
                <AccordionContent>
                    {!isComplete || role !== ClassUserRole.STUDENT ? (
                        studentResponses ? studentResponses.map((response) => (
                            <QuipSingleResponse
                                key={response.id}
                                responseId={response.id}
                                responseText={(response?.response as unknown as ResponseData[])[0]?.answer}
                                userId={userId}
                                responseDate={response?.createdAt}
                                responseLikes={response?.likes}
                                likeCount={response?.likeCount}
                                authorAvatarUrl={response?.student?.avatarURL as string}
                                responseAuthor={response?.student?.username as string}
                            />
                        )) : (
                            <LoadingAnimation />
                        )
                    ) : (
                        <div className='sm:mx-14'>
                            <AnswerQuip
                                studentId={userId}
                                promptSessionId={singleQuip.id}
                                quipQuestion={quipQuestion}
                                completeStatusTrue={completeStatusTrue}
                            />
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem >
        </>
    )
}
