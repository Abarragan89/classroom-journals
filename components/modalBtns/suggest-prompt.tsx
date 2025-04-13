'use client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import SuggestPromptForm from '../forms/student-request/suggest-prompt-form'

export default function SuggestPrompt({
    studentId,
    teacherId
}: {
    studentId: string,
    teacherId: string
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
                title='Suggest a Prompt'
                description='Suggest a Prompt'
            >
                <SuggestPromptForm
                    studentId={studentId}
                    teacherId={teacherId}
                    closeModal={closeModal}
                />
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
