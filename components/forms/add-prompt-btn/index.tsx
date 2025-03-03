'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddPromptForm from "./add-prompt-form";
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AddPromptBtn({ teacherId, closeSubMenu }: { teacherId: string, closeSubMenu: () => void }) {

    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    function closeModal() {
        setIsOpenModal(false)
        closeSubMenu()
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={closeSubMenu}
                title="Create Jot"
                description="Fill out the form below to create a new jot."
            >
                <ScrollArea className="max-h-[50vh] pr-11 pl-5">
                    <AddPromptForm teacherId={teacherId} closeModal={closeModal} />
                </ScrollArea>
            </ResponsiveDialog>
            <Button variant='ghost' onClick={() => setIsOpenModal(true)}>
                <Plus /> New Jot
            </Button>
        </>
    )
}
