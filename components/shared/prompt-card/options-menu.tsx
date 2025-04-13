'use client'
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Edit, Trash2Icon, Pin } from "lucide-react";
import { Classroom, Prompt } from '@/types';
import DeletePromptForm from '@/components/forms/prompt-forms/delete-prompt-form';
import AssignPromptForm from '@/components/forms/prompt-forms/assign-prompt-form';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export default function OptionsMenu({
    promptData,
    updatePromptData,
    classroomData
}: {
    promptData: Prompt,
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
    classroomData: Classroom[],
}) {

    const pathname = usePathname();

    const [mounted, setMounted] = useState<boolean>(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    function closeModal() {
        setIsAssignModalOpen(false)
        setIsDeleteModalOpen(false)
    }

    // Prevents Hydration Warnings/Errors
    if (!mounted) {
        return null
    }

    return (
        <>
            {/* Delete Modal */}
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={`Confirm Delete`}
                description='Confirm prompt deletion'
            >
                <DeletePromptForm
                    promptId={promptData.id}
                    promptTitle={promptData.title}
                    closeModal={closeModal}
                    updatePromptData={updatePromptData}
                />
            </ResponsiveDialog>

            {/* Assign Prompt Modal */}
            <ResponsiveDialog
                isOpen={isAssignModalOpen}
                setIsOpen={setIsAssignModalOpen}
                title={`Assign`}
                description='Select which classes to assign to'
            >
                <AssignPromptForm
                    promptId={promptData?.id}
                    promptTitle={promptData?.title}
                    promptType={promptData?.promptType as string}
                    closeModal={closeModal}
                    updatePromptData={updatePromptData}
                    classroomData={classroomData}
                />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className='absolute right-3 top-3 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Ellipse */}
                        <EllipsisVertical size={20} className="hover:cursor-pointer text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setIsAssignModalOpen(true)} className="hover:cursor-pointer rounded-md">
                        <Pin />Assign
                        </DropdownMenuItem>
                        <Link href={`/prompt-form/?type=${promptData.promptType}&edit=${promptData.id}&callbackUrl=${pathname}`}>
                            <DropdownMenuItem className="hover:cursor-pointer rounded-md">
                                <Edit />Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="hover:cursor-pointer text-destructive rounded-md">
                            <Trash2Icon />Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
