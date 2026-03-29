'use client'
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Edit, Trash2Icon } from "lucide-react";
import { Prompt } from '@/types';
import DeletePromptForm from '@/components/forms/prompt-forms/delete-prompt-form';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export default function OptionsMenu({
    promptData,
    teacherId
}: {
    promptData: Prompt,
    teacherId: string
}) {

    const pathname = usePathname();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

    function closeModal() {
        setIsDeleteModalOpen(false)
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
                    teacherId={teacherId}
                />
            </ResponsiveDialog>


            {/* Options Menu */}
            <div className='absolute right-3 top-3 z-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger aria-label="Prompt options" className="hover:cursor-pointer text-primary">
                        <EllipsisVertical aria-hidden="true" size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <Link href={`/prompt-form/?type=${promptData.promptType}&edit=${promptData.id}&callbackUrl=${pathname}`}>
                            <DropdownMenuItem className="hover:cursor-pointer rounded-md">
                                <Edit aria-hidden="true" />Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="hover:cursor-pointer text-destructive rounded-md">
                            <Trash2Icon aria-hidden="true" />Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
