'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddPromptForm from "./add-prompt-form";
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AddPromptBtn({ teacherId }: { teacherId: string }) {

    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    const pathname = usePathname()
    console.log('pathname in add promt btn', pathname)



    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsOpenModal}
                title="Create Prompt"
                description="Fill out the form below to create a new prompt."
            >
                <ScrollArea className="rounded-md max-h-[50vh] pr-11 pl-5">
                    <AddPromptForm teacherId={teacherId} />
                </ScrollArea>
            </ResponsiveDialog>
            <Button variant='ghost' onClick={() => setIsOpenModal(true)}>
                <Plus /> New Jot
            </Button>
        </>
    )
}
