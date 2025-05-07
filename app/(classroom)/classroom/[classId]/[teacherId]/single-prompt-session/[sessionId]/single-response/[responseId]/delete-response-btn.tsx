'use client'
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import DeleteResponseForm from "@/components/forms/response-forms/delete-response-form"

export default function DeleteResponseBtn({
    responseId,
    classId,
    teacherId,
    sessionId,
}: {
    responseId: string,
    classId: string,
    teacherId: string,
    sessionId: string

}) {

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    return (
        <>

            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title="Remove Assignment"
            >
                <DeleteResponseForm
                    responseId={responseId}
                    sessionId={sessionId}
                    teacherId={teacherId}
                    classId={classId}
                />
            </ResponsiveDialog>
            <Button onClick={() => setIsDeleteModalOpen(true)} variant='link' className='text-destructive'>Remove Assignment</Button>
        </>
    )
}
