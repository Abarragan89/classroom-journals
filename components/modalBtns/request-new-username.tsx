'use client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
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
    handleUIChange: (type: "username" | "prompt") => void;
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
                onClick={() => setIsModalOpen(true)}
                className="relative top-[-20px]"
            >
                <Plus /> Request
            </Button>
        </>
    )
}
