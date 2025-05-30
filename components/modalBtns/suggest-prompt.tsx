'use client'
import { Button } from '../ui/button'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import SuggestPromptForm from '../forms/student-request/suggest-prompt-form'

export default function SuggestPrompt({
    studentId,
    teacherId,
    hasSentPromptRequest,
    handleUIChange,
    classId
}: {
    studentId: string,
    teacherId: string,
    hasSentPromptRequest: boolean;
    handleUIChange: (type: "username" | "prompt") => void;
    classId: string
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    function closeModal() {
        setIsModalOpen(false)
    }


    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title='Suggest a blog prompt to your teacher'
                description='Suggest a blog prompt to your teacher'
            >
                {hasSentPromptRequest ? (
                    <p className='text-accent text-center mx-5 pb-5'>You already have a pending request. You can only send one prompt suggestion at a time</p>
                ) : (
                    <SuggestPromptForm
                        studentId={studentId}
                        teacherId={teacherId}
                        closeModal={closeModal}
                        handleUIChange={handleUIChange}
                        classId={classId}
                    />
                )}
            </ResponsiveDialog>
            <Button
                onClick={() => setIsModalOpen(true)}
            >
                Suggestion
            </Button>
        </>
    )
}
