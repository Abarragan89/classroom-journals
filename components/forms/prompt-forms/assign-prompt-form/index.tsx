'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { assignPrompt } from "@/lib/actions/prompt.actions"
import { toast } from 'sonner'
import { Classroom, Prompt } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

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
                {pending ? 'Assigning...' : 'Assign Jot'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-5">
            <div className="grid items-center gap-4">
                <p className="text-center">
                    {promptTitle}
                </p>
                <Separator />
                <div className="space-y-3">
                    {classroomData?.length > 0 && (
                        <>
                            <p className="text-sm text-center">Select Classes</p>
                            {/* remove the first element which is hte all classes default for search dropdown */}
                            {classroomData.slice(1).map((classroom: Classroom) => (
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
                <AssignButton />
                {state && !state.success && (
                    <p className="text-center text-destructive">{state.message}</p>
                )}
            </div>
        </form>
    )
}
