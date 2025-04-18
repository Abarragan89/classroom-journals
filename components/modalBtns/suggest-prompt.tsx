'use client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import SuggestPromptForm from '../forms/student-request/suggest-prompt-form'

export default function SuggestPrompt({
    studentId,
    teacherId,
    hasSentPromptRequest
}: {
    studentId: string,
    teacherId: string,
    hasSentPromptRequest: boolean
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isRequestPending, setIsRequestPending] = useState<boolean>(hasSentPromptRequest)
    function closeModal() {
        setIsModalOpen(false)
    }

    function requestSentUIHandler() {
        setIsRequestPending(true)
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title='Suggest a Prompt'
                description='Suggest a Prompt'
            >
                {isRequestPending ? (
                    <p className='text-accent text-center mx-5 pb-5'>You already have a pending request. You can only send one prompt suggestion at a time</p>
                ) : (
                    <SuggestPromptForm
                        studentId={studentId}
                        teacherId={teacherId}
                        closeModal={closeModal}
                        requestSentUIHandler={requestSentUIHandler}
                    />
                )}
            </ResponsiveDialog>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="relative top-[-50px]"
            >
                <Plus /> Prompt
            </Button>
        </>
    )
}
