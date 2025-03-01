'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddPromptForm from "./add-prompt-form";
import { ResponsiveDialog } from "@/components/responsive-dialog"

export default function AddPromptBtn({ teacherId, classId }: { teacherId: string, classId: string }) {

    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsOpenModal}
                title="Create Prompt"
                description="Fill out the form below to create a new prompt."
            >
                <AddPromptForm teacherId={teacherId} classId={classId} />
            </ResponsiveDialog>
            <Button variant='ghost' onClick={() => setIsOpenModal(true)} className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-[10px] py-2">
                <Plus />
            </Button>
        </>
    )
}
