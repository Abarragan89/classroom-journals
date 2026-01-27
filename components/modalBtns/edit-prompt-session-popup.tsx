'use client'
import { Circle, Edit, Monitor, Trash2Icon, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useState } from 'react'
import { ResponsiveDialog } from '../responsive-dialog'
import DeletePromptSessionForm from '../forms/prompt-session-forms/delete-prompt-session-form'
import ToggleBlogStatus from '../forms/prompt-session-forms/toggle-blog-status'
import TogglePrivatePublicStatus from '../forms/prompt-session-forms/toggle-private-public-status'
import Link from 'next/link'


export default function EditPromptSessionPopUp({
    promptSessionType,
    promptSessionId,
    initialStatus,
    initialPublicStatus,
    classId,
    teacherId,
    sessionId
}: {
    promptSessionType: string,
    promptSessionId: string,
    initialStatus: string,
    initialPublicStatus: boolean,
    classId: string,
    teacherId: string,
    sessionId: string
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
    const statusCapitalized = promptSessionStatus === 'OPEN' ? 'Close' : 'Open'
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
                    teacherId={teacherId}
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
                    teacherId={teacherId}
                />
            </ResponsiveDialog>

            {/* Options Menu */}
            {promptSessionType === 'BLOG' && isSessionPublic ? (
                <p className='text-muted-foreground text-left'>Discussion:
                    {
                        promptSessionStatus === 'OPEN' ? (
                            <span className="text-success font-bold text-sm"> Open</span>
                        ) : (
                            <span className="text-destructive font-bold text-sm"> Closed</span>
                        )
                    }
                </p>
            ) : (
                !isSessionPublic && promptSessionType !== 'ASSESSMENT' &&
                <p>Private Blog</p>
            )}
            <div className={`flex-end ${promptSessionType === 'ASSESSMENT' ? 'w-full' : ''} relative z-10`}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Edit size={22} className="hover:cursor-pointer hover:text-accent text-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-[2.5rem]'>
                        {promptSessionType === 'BLOG' && isSessionPublic &&
                            <DropdownMenuItem onClick={() => setIsDiscussionOpenModal(true)} className="hover:cursor-pointer rounded-md">
                                {promptSessionStatus === 'OPEN' ? (
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
                        {promptSessionType === 'BLOG' &&
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
                <Link
                    className="ml-6"
                    href={`/classroom/${classId}/${teacherId}/single-prompt-session/${sessionId}/review-assessment-questions`}
                >
                    <Monitor
                        className='hover:cursor-pointer hover:text-accent'
                    />
                </Link>
            </div>


        </>

    )
}
