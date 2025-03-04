'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddClassForm from "./add-class-form"
import { ResponsiveDialog } from "@/components/responsive-dialog"

export default function AddClassBtn({
    teacherId,
    closeSubMenu,
    variant = 'ghost'
}: {
    teacherId: string,
    closeSubMenu?: () => void,
    variant?: "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined
}) {

    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    function closeModal() {
        setIsOpenModal(false)
        if (closeSubMenu) closeSubMenu()
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
            <Button variant={variant} onClick={() => setIsOpenModal(true)}>
                <Plus />Add Class
            </Button>
        </>
    )
}
