'use client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import RequestNewUsernameForm from '../forms/student-request/request-new-username-form'

export default function RequestNewUsername({
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
                title='Request New Username'
                description='Make a request for a new username'
            >
                <RequestNewUsernameForm
                    studentId={studentId}
                    teacherId={teacherId}
                    closeModal={closeModal}
                />
            </ResponsiveDialog>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="relative top-[-50px]"
            >
                <Plus /> Request
            </Button>
        </>
    )
}
