'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { deletePrompt } from "@/lib/actions/prompt.actions"
import { toast } from 'sonner'
import { Prompt } from "@/types"

export default function DeletePromptForm({
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
    }, [state, closeModal])


    function DeleteButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                disabled={pending}
                type="submit"
                className={`mx-auto block bg-destructive`}
            >
                {pending ? 'Deleting...' : 'Delete Jot'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-5">
            <div className="grid items-center gap-4">
                <Label htmlFor="year" className="text-center mx-auto mt-1 px-5 leading-normal">
                    <p>Are you sure you want to delete</p>
                    <span className="text-destructive py-3">{promptTitle}</span>
                    <p>from your library?</p>
                </Label>
                <input
                    hidden
                    defaultValue={promptId}
                    id="promptId"
                    name="promptId"
                />
            </div>
            <DeleteButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
