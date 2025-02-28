'use client';
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus } from "lucide-react"
import AddClassForm from "./add-class-form"
import { ResponsiveDialog } from "@/components/responsive-dialog"

export default function AddClassBtn({ teacherId }: { teacherId: string }) {
    
    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsOpenModal}
                title="Create Class"
                description="Fill out the form below to create a new class."
            >
                <AddClassForm teacherId={teacherId} />
            </ResponsiveDialog>
            <Button variant='ghost' onClick={() => setIsOpenModal(true)} className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-[10px] py-2">
                <Plus />
            </Button>
        </>
    )
}
