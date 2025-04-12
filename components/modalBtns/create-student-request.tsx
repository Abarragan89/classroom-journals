'use client'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialog } from '../responsive-dialog'
import { useState } from 'react'
import RequestNewUsernameForm from '../forms/student-request/request-new-username-form'

export default function CreateStudentRequest() {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title='New Request'
            >
                <RequestNewUsernameForm />
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
