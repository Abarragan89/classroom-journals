'use client'
import { Button } from '../ui/button'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import RequestNewUsernameForm from '../forms/student-request/request-new-username-form'

export default function RequestNewUsername({
    studentId,
    teacherId,
    hasSentUsernameRequest,
    handleUIChange,
    classId,
}: {
    studentId: string,
    teacherId: string,
    hasSentUsernameRequest: boolean;
    classId: string;
    handleUIChange: () => void;
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
                {hasSentUsernameRequest ? (
                    <p className='text-accent text-center mx-5 pb-5'>You already have a pending request. You can only send one username request at a time</p>
                ) : (
                    <RequestNewUsernameForm
                        studentId={studentId}
                        teacherId={teacherId}
                        closeModal={closeModal}
                        handleUIChange={handleUIChange}
                        classId={classId}
                    />
                )}
            </ResponsiveDialog>
            <Button
                variant='link'
                onClick={() => setIsModalOpen(true)}
                className='absolute -top-1 right-0'
            >
                Change
            </Button>
        </>
    )
}
