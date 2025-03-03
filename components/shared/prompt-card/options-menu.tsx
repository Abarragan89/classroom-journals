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
import DeleteClassForm from '@/components/forms/delete-class-form';
import { Prompt } from '@/types';


export default function OptionsMenu({ promptData }: { promptData: Prompt }) {
    const [mounted, setMounted] = useState<boolean>(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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
                title='Edit Class'
                description='Fill out the form below to create a new class.'
            >
                <p>Edit Form Content Here</p>
            </ResponsiveDialog>

            {/* Delete Modal */}
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={`Delete ${promptData.title}`}
                description='Confirm class deletion'
            >
                <DeleteClassForm classroomId={promptData.id} />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className='absolute right-4 top-4 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Ellipse */}
                        <EllipsisVertical className="hover:cursor-pointer text-accent" />
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
