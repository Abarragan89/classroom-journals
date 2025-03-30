'use client'
import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { assignPrompt } from "@/lib/actions/prompt.actions"
import { toast } from 'sonner'
import { Classroom, Prompt } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CiCircleQuestion } from "react-icons/ci"

export default function AssignPromptForm({
    promptId,
    promptTitle,
    closeModal,
    updatePromptData,
    classroomData
}: {
    promptId: string,
    promptTitle: string,
    closeModal: () => void,
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>,
    classroomData: Classroom[],
}) {
    const [isPublic, setIsPublic] = useState<boolean>(true);

    const [state, action] = useActionState(assignPrompt, {
        success: false,
        message: ''
    })


    //redirect if the state is success
    useEffect(() => {
        if (state.success && state.data) {
            toast('Jot Assigned!');
            updatePromptData(prev => prev.map(prompt => prompt.id === state.data.id ? state.data : prompt))
            closeModal();
        }
    }, [state.success]);


    function AssignButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                type="submit"
                disabled={pending}
                className={`mx-auto block mt-3`}
            >
                {pending ? 'Assigning...' : 'Assign'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-2">
            <div className="grid items-center gap-3">
                <p className="text-center italic line-clamp-4 text-primary">
                    &ldquo;{promptTitle}&rdquo;
                </p>
                <Separator />
                <div className="space-y-3">
                    {classroomData?.length > 0 && (
                        <>
                            <p className="text-md font-bold">Select Classes</p>
                            {classroomData.map((classroom: Classroom) => (
                                <div key={classroom.id} className="flex items-center space-x-2">
                                    <Checkbox id={classroom.id} value={classroom.id} name={`classroom-organize-${classroom.id}`} />
                                    <label
                                        htmlFor={classroom.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {classroom.name}
                                    </label>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <input
                    id="promptId"
                    name="promptId"
                    value={promptId}
                    required
                    readOnly
                    hidden
                />
                <div className="flex items-center space-x-2">
                    <Switch
                        onCheckedChange={(e) => setIsPublic(e)}
                        checked={isPublic}
                    />
                    <Label
                        className="text-md ml-2"
                    >
                        Public
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
                <AssignButton />
                {state && !state.success && (
                    <p className="text-center text-destructive">{state.message}</p>
                )}
            </div>
        </form>
    )
}
