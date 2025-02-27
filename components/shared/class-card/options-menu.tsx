'use client'
import { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Edit, Trash2Icon } from "lucide-react";
import EditClassModal from '@/components/forms/edit-class-form';

export default function OptionsMenu({ teacherId }: { teacherId: string }) {
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
        <div className='absolute right-4 top-4 z-10'>
            <EditClassModal teacherId={teacherId} open={isModalOpen} />
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
    )
}
