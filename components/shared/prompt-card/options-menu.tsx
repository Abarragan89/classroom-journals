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
import EditPromptForm from '@/components/forms/edit-prompt-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import DeletePromptForm from '@/components/forms/delete-prompt-form';

export default function OptionsMenu({ promptData, teacherId }: { promptData: Prompt, teacherId: string }) {

    const [mounted, setMounted] = useState<boolean>(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    function closeDeleteModal() {
        setIsDeleteModalOpen(false)
    }
    
    function closeEditModal() {
        setIsEditModalOpen(false)
    }

    // Prevents Hydration Warnings/Errors
    if (!mounted) {
        return null
    }

    return (
        <>
            {/* Edit Modal */}
            <ResponsiveDialog
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                title='Edit Jot'
                description='Fill out the form below to edit your jot.'
            >
                <ScrollArea className="max-h-[50vh] pr-11 pl-5">
                    <EditPromptForm
                        teacherId={teacherId}
                        promptData={promptData}
                        closeModal={closeEditModal}
                    />
                </ScrollArea>
            </ResponsiveDialog>

            {/* Delete Modal */}
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={`Confirm Delete`}
                description='Confirm prompt deletion'
            >
                <DeletePromptForm promptId={promptData.id} promptTitle={promptData.title} closeModal={closeDeleteModal} />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className='absolute right-4 top-4 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Ellipse */}
                        <EllipsisVertical className="hover:cursor-pointer text-primary" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="hover:cursor-pointer rounded-md">
                            <Edit />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="hover:cursor-pointer text-destructive rounded-md">
                            <Trash2Icon />Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
