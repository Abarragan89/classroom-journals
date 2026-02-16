'use client'
import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { assignPrompt } from "@/lib/actions/prompt.actions"
import { toast } from 'sonner'
import { Classroom } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CiCircleQuestion } from "react-icons/ci";
import { useQueryClient } from "@tanstack/react-query"

export default function AssignPromptForm({
    promptId,
    promptTitle,
    closeModal,
    classroomData,
    promptType,
    teacherId
}: {
    promptId: string,
    promptTitle: string,
    closeModal: () => void,
    classroomData: Classroom[],
    promptType: string,
    teacherId: string
}) {
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [enableSpellCheck, setEnableSpellCheck] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const [state, action] = useActionState(assignPrompt, {
        success: false,
        message: ''
    })


    // update the cache if successful
    useEffect(() => {
        if (state?.success && state.data) {
            toast('Jot Assigned!');
            queryClient.invalidateQueries({ queryKey: ['prompts', teacherId] });
            queryClient.invalidateQueries({ queryKey: ['assignmentListDash'] });
            closeModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);


    function AssignButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                type="submit"
                disabled={pending}
                className={`mx-auto block mt-5 shadow-sm ${pending ? 'cursor-not-allowed' : ''}`}
            >
                {pending ? 'Assigning...' : 'Assign'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-2">
            <div className="grid items-center gap-2">
                <p className="text-center italic line-clamp-4 text-primary bg-card p-4 border rounded-md">
                    {promptTitle}
                </p>
                {classroomData?.length > 0 && (
                    <>
                        <p className="text-md mt-5 font-bold">Select Classes</p>
                        {classroomData.map((classroom: Classroom) => (
                            <div key={classroom.id} className="flex items-center space-x-2 bg-card border p-4 rounded-md">
                                <Checkbox id={classroom.id} value={classroom.id} name={`classroom-organize-${classroom.id}`} />
                                <label
                                    htmlFor={classroom.id}
                                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {classroom.name}
                                </label>
                                <span className={`text-xs font-normal ${classroom._count?.users === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    ({classroom._count?.users || 0} {classroom._count?.users === 1 ? 'student' : 'students'})
                                </span>
                            </div>
                        ))}
                    </>
                )}
                <input
                    id="promptId"
                    name="promptId"
                    value={promptId}
                    required
                    readOnly
                    hidden
                />
                <input
                    id="teacherId"
                    name="teacherId"
                    value={teacherId}
                    required
                    readOnly
                    hidden
                />

                {/* Other Options */}
                <p className="text-md font-bold mt-3">Other Options</p>
                {/* Make it public switch */}

                <div className="bg-card border p-4 space-y-4 rounded-md">
                    {promptType === 'BLOG' &&
                        <div className="flex items-center space-x-2">
                            <Switch
                                onCheckedChange={(e) => setIsPublic(e)}
                                checked={isPublic}
                            />
                            <Label
                                className="text-md text-sm ml-2"
                            >
                                Make Public
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CiCircleQuestion size={20} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Responses are visible to everyone</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <input
                                type='hidden'
                                readOnly
                                name='is-public'
                                id='is-public'
                                value={isPublic.toString()}
                            />
                        </div>
                    }
                    {/* this is making spell check enabled */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            onCheckedChange={(e) => setEnableSpellCheck(e)}
                            checked={enableSpellCheck}
                        />
                        <Label
                            className="text-sm ml-2"
                        >
                            Enable Spell Check
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CiCircleQuestion size={20} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Text editor will spell check</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <input
                            type='hidden'
                            readOnly
                            name='enable-spellcheck'
                            id='enable-spellcheck'
                            value={enableSpellCheck.toString()}
                        />
                    </div>
                </div>

                <AssignButton />
                {state && !state.success && (
                    <p className="text-center text-destructive">{state.message}</p>
                )}
            </div>
        </form>
    )
}
