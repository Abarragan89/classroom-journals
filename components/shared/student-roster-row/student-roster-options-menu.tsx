'use client'
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useState } from 'react'
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

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

    function closeDeleteModal() {
        setIsDeleteModalOpen(false)
    }
    function closeEditModal() {
        setIsEditModalOpen(false)
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
                <DropdownMenuTrigger aria-label="Student options" className="hover:cursor-pointer text-foreground">
                    <Ellipsis aria-hidden="true" size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Link href={`/classroom/${classId}/${session.user.id}/roster/${studentInfo.id}`}>
                        <DropdownMenuItem className="hover:cursor-pointer rounded-md">
                            <Eye aria-hidden="true" />Work
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="hover:cursor-pointer rounded-md">
                        <Edit aria-hidden="true" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="hover:cursor-pointer text-destructive rounded-md">
                        <Trash2Icon aria-hidden="true" />Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
