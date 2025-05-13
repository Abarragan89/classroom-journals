'use client'
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Edit, Eye, Trash2Icon } from "lucide-react";
import { Ellipsis } from "lucide-react"
import { Session, User } from '@/types';
import EditStudentForm from '../../forms/roster-forms/edit-student-form';
import DeleteStudentForm from '../../forms/roster-forms/delete-student-form';
import Link from 'next/link';

export default function StudentRosterOptionsMenu({
    studentInfo,
    session,
    classId
}: {
    studentInfo: User,
    session: Session,
    classId: string
}) {

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
                title={`Edit ${studentInfo.name}`}
                description='Fill out the form below to create a new class.'
            >
                <EditStudentForm
                    closeModal={closeEditModal}
                    studentInfo={studentInfo}
                    session={session}
                    classId={classId}
                />
            </ResponsiveDialog>

            {/* Delete Modal */}
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={`Delete ${studentInfo.name}`}
                description='Confirm class deletion'
            >
                <DeleteStudentForm
                    closeModal={closeDeleteModal}
                    studentInfo={studentInfo}
                    session={session}
                    classId={classId}
                />
            </ResponsiveDialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* Ellipse trigger */}
                    <Ellipsis size={20} className="hover:cursor-pointer text-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Link href={`/classroom/${classId}/${session.user.id}/roster/${studentInfo.id}`}>
                        <DropdownMenuItem className="hover:cursor-pointer rounded-md">
                            <Eye />Work
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="hover:cursor-pointer rounded-md">
                        <Edit />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="hover:cursor-pointer text-destructive rounded-md">
                        <Trash2Icon />Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
