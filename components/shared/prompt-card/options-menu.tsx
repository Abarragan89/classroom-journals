'use client'
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Edit, Trash2Icon } from "lucide-react";
import { Prompt } from '@/types';
import DeletePromptForm from '@/components/forms/delete-prompt-form';
import AssignPromptForm from '@/components/forms/assign-prompt-form';
import Link from 'next/link';

export default function OptionsMenu({
    promptData,
    updatePromptData
}: {
    promptData: Prompt,
    teacherId: string,
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
}) {

    const [mounted, setMounted] = useState<boolean>(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    function closeDeleteModal() {
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
                    closeModal={closeDeleteModal}
                    updatePromptData={updatePromptData}
                />
            </ResponsiveDialog>

            {/* Assign Prompt Modal */}
            <ResponsiveDialog
                isOpen={isAssignModalOpen}
                setIsOpen={setIsAssignModalOpen}
                title={`Assign Prompt`}
                description='Choose '
            >
                <AssignPromptForm
                    promptId={promptData.id}
                    promptTitle={promptData.title}
                    closeModal={closeDeleteModal}
                    updatePromptData={updatePromptData}
                />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className='absolute right-3 top-3 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Ellipse */}
                        <EllipsisVertical size={20} className="hover:cursor-pointer text-primary" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setIsAssignModalOpen(true)} className="hover:cursor-pointer rounded-md">
                            Assign
                        </DropdownMenuItem>
                        <Link href={`/edit-prompt/${promptData.id}?type=${promptData.promptType}`}>
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
