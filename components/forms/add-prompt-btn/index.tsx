'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddPromptForm from "./add-prompt-form";
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AddPromptBtn({ 
    teacherId, 
    closeSubMenu,
    variant='ghost' 
}: { 
    teacherId: string, 
    closeSubMenu: () => void,
    variant?: "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined 
}) {

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
            <Button variant={variant} onClick={() => setIsOpenModal(true)}>
                <Plus /> New Jot
            </Button>
        </>
    )
}
