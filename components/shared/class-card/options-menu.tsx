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
import EditClassModal from '@/components/forms/edit-class-form';
import { ClassForm, Class } from '@/types';


export default function OptionsMenu({ teacherId, classData }: { teacherId: string, classData: Class }) {
    const [mounted, setMounted] = useState<boolean>(false)
    const [isModalOpen, setIsOpenModal] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevents Hydration Warnings/Errors
    if (!mounted) {
        return null
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsOpenModal}
                title='Edit Class'
                description='Fill out the form below to create a new class.'
            >
                <EditClassModal classData={classData} />
            </ResponsiveDialog>
            <div className='absolute right-4 top-4 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="hover:cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setIsOpenModal(true)} className="hover:cursor-pointer">
                            <Edit />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:cursor-pointer text-destructive">
                            <Trash2Icon />Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
