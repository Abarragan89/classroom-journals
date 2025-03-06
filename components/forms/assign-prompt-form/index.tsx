'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { deletePrompt } from "@/lib/actions/prompt.actions"
import { toast } from 'sonner'
import { Prompt } from "@/types"
import { getAllClassroomIds } from "@/lib/actions/classroom.actions"

export default function AssignPromptForm({
    promptId,
    promptTitle,
    closeModal,
    updatePromptData
}: {
    promptId: string,
    promptTitle: string,
    closeModal: () => void,
    updatePromptData: React.Dispatch<React.SetStateAction<Prompt[]>>
}) {

    const [state, action] = useActionState(deletePrompt, {
        success: false,
        message: ''
    })

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast('Jot Deleted!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
            closeModal()
            updatePromptData(prev => [...prev.filter((prompt: Prompt) => prompt.id !== state.promptId)])
        }
    }, [state])


    function DeleteButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                type="submit"
                className={`mx-auto block`}
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
            </div>
            <DeleteButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
