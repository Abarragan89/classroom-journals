'use client'
import { Circle, Edit, Edit2Icon, Ellipsis, Trash2Icon, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useState } from 'react'
import { ResponsiveDialog } from '../responsive-dialog'
import DeletePromptSessionForm from '../forms/prompt-session-forms/delete-prompt-session-form'
import ToggleBlogStatus from '../forms/prompt-session-forms/toggle-blog-status'


export default function EditPromptSessionPopUp({
    promptSessionType,
    promptSessionId,
    initialStatus,
}: {
    promptSessionType: string,
    promptSessionId: string,
    initialStatus: string
}) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [promptSessionStatus, setPromptSessionStatus] = useState<string>(initialStatus)

    function closeModal() {
        setIsDeleteModalOpen(false)
        setIsEditModalOpen(false)
    }
    const statusCapitalized = promptSessionStatus === 'open' ? 'Close' : 'Open'

    return (
        <>
            {/* Delete Modal */}
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={`Confirm Delete`}
                description='Confirm prompt deletion'
            >
                <DeletePromptSessionForm
                    promptSessionId={promptSessionId}
                    closeModal={closeModal}
                />
            </ResponsiveDialog>

            {/* Edit Prompt Modal */}
            <ResponsiveDialog
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                title={`${statusCapitalized} Discussion`}
                description='toggle the status of your blog'
            >
                <ToggleBlogStatus
                    promptSessionId={promptSessionId}
                    promptSessionStatus={promptSessionStatus}
                    setPromptSessionStatus={setPromptSessionStatus}
                    closeModal={closeModal}
                />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className=' flex-between relative mt-5 z-10'>
                {promptSessionType === 'single-question' ? (
                    <p className='text-input'>Discussion:
                        {
                            promptSessionStatus === 'open' ? (
                                <span className="text-success font-bold text-sm"> Open</span>
                            ) : (
                                <span className="text-destructive font-bold text-sm"> Closed</span>
                            )
                        }
                    </p>
                ) : (
                    <p>&nbsp;</p>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Ellipse */}
                        <Edit size={22} className="top-0 hover:cursor-pointer text-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-[2.5rem]'>
                        {/* Only show open and close discussions for blogs (i.e. single question) */}
                        {promptSessionType === 'single-question' &&
                            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="hover:cursor-pointer rounded-md">
                                {promptSessionStatus === 'open' ? (
                                    <>
                                        <X />{`${statusCapitalized} Discussion`}
                                    </>
                                ) : (
                                    <>
                                        <Circle />{`${statusCapitalized} Discussion`}
                                    </>
                                )}
                            </DropdownMenuItem>
                        }
                        <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="hover:cursor-pointer text-destructive rounded-md">
                            <Trash2Icon />Delete Assignment
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>

    )
}
