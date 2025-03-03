'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddClassForm from "./add-class-form"
import { ResponsiveDialog } from "@/components/responsive-dialog"

export default function AddClassBtn({ teacherId, closeSubMenu }: { teacherId: string, closeSubMenu: () => void }) {

    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    function closeModal() {
        setIsOpenModal(false)
        closeSubMenu()
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={closeModal}
                title="Create Class"
                description="Fill out the form below to create a new class."
            >
                <AddClassForm teacherId={teacherId} closeModal={closeModal} />
            </ResponsiveDialog>
            <Button variant='ghost' onClick={() => setIsOpenModal(true)}>
                <Plus />Add Class
            </Button>
        </>
    )
}
