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
import EditClassForm from '@/components/forms/edit-class-form';
import DeleteClassForm from '@/components/forms/delete-class-form';
import { Class } from '@/types';


export default function OptionsMenu({ classData }: { classData: Class }) {
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
                title='Edit Class'
                description='Fill out the form below to create a new class.'
            >
                <EditClassForm classData={classData} closeModal={closeEditModal} />
            </ResponsiveDialog>

            {/* Delete Modal */}
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={`Delete ${classData.name}`}
                description='Confirm class deletion'
            >
                <DeleteClassForm classroomId={classData.id} closeModal={closeDeleteModal} />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className='absolute right-4 top-4 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Ellipse */}
                        <div style={{ backgroundColor: classData.color }} className={`w-8 h-8 rounded-full flex-center`}>
                            <EllipsisVertical className="hover:cursor-pointer text-white" />
                        </div>

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
