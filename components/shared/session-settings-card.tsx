'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import DeletePromptSessionForm from '@/components/forms/prompt-session-forms/delete-prompt-session-form'
import { toggleHideShowGrades } from '@/lib/actions/response.action'
import { togglePublicPrivateStatus } from '@/lib/actions/prompt.session.actions'
import { toggleBlogStatus } from '@/lib/actions/prompt.session.actions'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export default function SessionSettingsCard({
    promptSessionType,
    promptSessionId,
    initialStatus,
    initialPublicStatus,
    initialGradesVisible,
    classId,
    teacherId,
    sessionId,
}: {
    promptSessionType: string
    promptSessionId: string
    initialStatus: string
    initialPublicStatus: boolean
    initialGradesVisible: boolean
    classId: string
    teacherId: string
    sessionId: string
}) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isSessionPublic, setIsSessionPublic] = useState(initialPublicStatus)
    const [discussionOpen, setDiscussionOpen] = useState(initialStatus === 'OPEN')
    const [areGradesVisible, setAreGradesVisible] = useState(initialGradesVisible)
    const [publicPending, setPublicPending] = useState(false)
    const [discussionPending, setDiscussionPending] = useState(false)
    const [gradesPending, setGradesPending] = useState(false)

    async function handleGradesToggle(checked: boolean) {
        setGradesPending(true)
        try {
            const result = await toggleHideShowGrades(promptSessionId, checked, teacherId)
            if (result.success) {
                setAreGradesVisible(checked)
                toast(checked ? 'Grades are now visible to students' : 'Grades are now hidden from students')
            } else {
                toast.error('Failed to update grade visibility')
            }
        } catch {
            toast.error('Failed to update grade visibility')
        } finally {
            setGradesPending(false)
        }
    }

    async function handlePublicToggle(checked: boolean) {
        setPublicPending(true)
        const formData = new FormData()
        formData.append('promptId', promptSessionId)
        formData.append('promptStatus', checked ? 'public' : 'private')
        formData.append('teacherId', teacherId)
        try {
            const result = await togglePublicPrivateStatus(undefined, formData)
            if (result?.success) {
                setIsSessionPublic(checked)
                // If making private, also close the discussion
                if (!checked && discussionOpen) {
                    setDiscussionOpen(false)
                }
                toast(checked ? 'Responses are now public' : 'Responses are now private')
            } else {
                toast.error('Failed to update visibility')
            }
        } catch {
            toast.error('Failed to update visibility')
        } finally {
            setPublicPending(false)
        }
    }

    async function handleDiscussionToggle(checked: boolean) {
        setDiscussionPending(true)
        const formData = new FormData()
        formData.append('promptId', promptSessionId)
        formData.append('promptStatus', checked ? 'OPEN' : 'CLOSED')
        formData.append('teacherId', teacherId)
        try {
            const result = await toggleBlogStatus(undefined, formData)
            if (result?.success) {
                setDiscussionOpen(checked)
                toast(checked ? 'Discussion is now open' : 'Discussion is now closed')
            } else {
                toast.error('Failed to update discussion status')
            }
        } catch {
            toast.error('Failed to update discussion status')
        } finally {
            setDiscussionPending(false)
        }
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title="Confirm Delete"
                description="Confirm prompt deletion"
            >
                <DeletePromptSessionForm promptSessionId={promptSessionId} />
            </ResponsiveDialog>

            <Card className="w-full my-8 shadow-sm">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Assignment Settings</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={`/classroom/${classId}/${teacherId}/single-prompt-session/${sessionId}/review-assessment-questions`}
                                    aria-label="Review assignment questions"
                                    className="text-muted-foreground hover:text-accent transition-colors"
                                >
                                    <ClipboardList size={20} aria-hidden="true" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="left">Review Questions</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>

                <CardContent className="space-y-5 p-4">
                    {/* Show Grades */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="grades-toggle" className="text-sm font-medium leading-none">
                                Show Grades to Students
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Students can see their scores after submission
                            </p>
                        </div>
                        <Switch
                            id="grades-toggle"
                            checked={areGradesVisible}
                            onCheckedChange={handleGradesToggle}
                            disabled={gradesPending}
                            aria-label="Toggle grade visibility"
                        />
                    </div>

                    {/* BLOG-only settings */}
                    {promptSessionType === 'BLOG' && (
                        <>
                            <div className="border-t pt-4 space-y-5">
                                {/* Public / Private */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="public-toggle" className="text-sm font-medium leading-none">
                                            Public Responses
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Students can view each other&apos;s work
                                        </p>
                                    </div>
                                    <Switch
                                        id="public-toggle"
                                        checked={isSessionPublic}
                                        onCheckedChange={handlePublicToggle}
                                        disabled={publicPending}
                                        aria-label="Toggle public responses"
                                    />
                                </div>

                                {/* Discussion — sub-option, indented */}
                                <div
                                    className={`transition-opacity ${isSessionPublic ? 'border-border opacity-100' : 'border-border opacity-40 pointer-events-none'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="discussion-toggle"
                                                className="text-sm font-medium leading-none"
                                            >
                                                Discussion Open
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {isSessionPublic
                                                    ? 'Allow students to comment'
                                                    : 'Enable Public Responses first'}
                                            </p>
                                        </div>
                                        <Switch
                                            id="discussion-toggle"
                                            checked={discussionOpen}
                                            onCheckedChange={handleDiscussionToggle}
                                            disabled={discussionPending || !isSessionPublic}
                                            aria-label="Toggle discussion"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Delete */}
                    <div className="border-t pt-3 px-0">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 justify-start gap-2 px-0"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            <Trash2Icon size={16} />
                            Delete Assignment
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
