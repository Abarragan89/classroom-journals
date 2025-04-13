'use client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import RequestNewUsernameForm from '../forms/student-request/request-new-username-form'

export default function RequestNewUsername({
    studentId,
    teacherId,
    hasSentUsernameRequest
}: {
    studentId: string,
    teacherId: string,
    hasSentUsernameRequest: boolean
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isRequestPending, setIsRequestPending] = useState<boolean>(hasSentUsernameRequest)

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
                title='Request New Username'
                description='Make a request for a new username'
            >
                {isRequestPending ? (
                    <p className='text-accent text-center mx-5 pb-5'>You already have a pending request. You can only send one username request at a time</p>
                ) : (
                    <RequestNewUsernameForm
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
                <Plus /> Request
            </Button>
        </>
    )
}
