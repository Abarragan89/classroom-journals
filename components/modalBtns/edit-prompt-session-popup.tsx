'use client'
import { Circle, Edit, Trash2Icon, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useState } from 'react'
import { ResponsiveDialog } from '../responsive-dialog'
import DeletePromptSessionForm from '../forms/prompt-session-forms/delete-prompt-session-form'
import ToggleBlogStatus from '../forms/prompt-session-forms/toggle-blog-status'
import TogglePrivatePublicStatus from '../forms/prompt-session-forms/toggle-private-public-status'


export default function EditPromptSessionPopUp({
    promptSessionType,
    promptSessionId,
    initialStatus,
    initialPublicStatus,
}: {
    promptSessionType: string,
    promptSessionId: string,
    initialStatus: string,
    initialPublicStatus: boolean,
}) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isPublicModal, setisPublicModal] = useState<boolean>(false);
    const [isDiscussionOpenModal, setIsDiscussionOpenModal] = useState<boolean>(false);
    const [promptSessionStatus, setPromptSessionStatus] = useState<string>(initialStatus)
    const [isSessionPublic, setIsSessionPublic] = useState<boolean>(initialPublicStatus)

    function closeModal() {
        setIsDeleteModalOpen(false)
        setIsDiscussionOpenModal(false)
        setisPublicModal(false);
    }
    const statusCapitalized = promptSessionStatus === 'open' ? 'Close' : 'Open'
    const publicCapitalized = isSessionPublic ? 'private' : 'public'

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
                />
            </ResponsiveDialog>

            {/* Open/Close Discussion Prompt Modal */}
            <ResponsiveDialog
                isOpen={isDiscussionOpenModal}
                setIsOpen={setIsDiscussionOpenModal}
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

            {/* Public/Private Prompt Modal */}
            <ResponsiveDialog
                isOpen={isPublicModal}
                setIsOpen={setisPublicModal}
                title={`Make responses ${publicCapitalized} `}
                description='toggle the status of your blog'
            >
                <TogglePrivatePublicStatus
                    promptSessionId={promptSessionId}
                    isPublic={isSessionPublic}
                    setPromptSessionStatus={setIsSessionPublic}
                    closeModal={closeModal}
                />
            </ResponsiveDialog>

            {/* Options Menu */}
            <div className={`${promptSessionType === 'single-question' ? 'flex-between' : 'flex-end'} relative mt-5 z-10`}>
                {promptSessionType === 'single-question' && isSessionPublic ? (
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
                    !isSessionPublic && promptSessionType !== 'multi-question' &&
                    <p>Private</p>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Edit size={22} className="top-0 hover:cursor-pointer text-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-[2.5rem]'>
                        {promptSessionType === 'single-question' && isSessionPublic &&
                            <DropdownMenuItem onClick={() => setIsDiscussionOpenModal(true)} className="hover:cursor-pointer rounded-md">
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
                        {promptSessionType === 'single-question' &&
                            <DropdownMenuItem onClick={() => setisPublicModal(true)} className="hover:cursor-pointer rounded-md">
                                {isSessionPublic ? (
                                    <>
                                        <X />{`Make Private`}
                                    </>
                                ) : (
                                    <>
                                        <Circle />{`Make Public`}
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
