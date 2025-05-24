"use client"
// import { formatDateShort } from '@/lib/utils'
import { PromptSession, Question, Response, ResponseData } from '@/types'
import React, { useEffect, useState } from 'react'
import {
    Accordion,
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


export default function QuipListItem({
    singleQuip,
    userId,
    role,
    classId
}: {
    singleQuip: PromptSession;
    userId: string;
    role: ClassUserRole;
    classId: string;
}) {

    const [openModal, setOpenModal] = useState<boolean>(false)
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
        console.log('gettting the data')
        if ((isComplete || role === "TEACHER") && showResponses) {
            console.log('getting the data..')
            getStudentResponses()
        }
    }, [isComplete, role, showResponses])

    // Fetch the response data for the 
    function closeModal() {
        setOpenModal(false)
    }

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
            console.log('responses ', responses)
        } catch (error) {
            console.log('error getting student reponses to quips', error)
        }
    }

    const quipQuestion = (singleQuip?.questions as Question[])[0]?.question

    return (
        <>
            <ResponsiveDialog
                isOpen={openModal}
                setIsOpen={setOpenModal}
                title="Answer Quip"
            >
                <AnswerQuip
                    closeModal={closeModal}
                    studentId={userId}
                    promptSessionId={singleQuip.id}
                    quipQuestion={quipQuestion}
                    completeStatusTrue={completeStatusTrue}
                />
            </ResponsiveDialog>
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
            <Accordion className='mx-5' type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger onClick={() => setShowResponses(true)}>
                        <p className='text-md font-bold line-clamp-1 text-foreground'>{quipQuestion}</p>
                    </AccordionTrigger>
                    <AccordionContent>
                        {role === ClassUserRole.TEACHER && (
                            <div className='flex-end'>
                                <Button onClick={() => setOpenDeleteModal(true)} variant='link' className='text-destructive'>
                                    Delete Quip
                                </Button>
                            </div>
                        )}
                        {isComplete || role !== ClassUserRole.STUDENT ? (
                            studentResponses && studentResponses.map((response) => {
                                console.log('response ', response)
                                return (
                                    <p key={response.id}>
                                        {(response?.response as unknown as ResponseData[])[0]?.answer}
                                    </p>
                                )
                            })
                        ) : (
                            <div className="flex-center">
                                <Button onClick={() => setOpenModal(true)}>
                                    Response to Quip
                                </Button>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    )
}
