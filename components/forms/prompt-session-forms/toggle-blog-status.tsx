'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { toggleBlogStatus } from "@/lib/actions/prompt.session.actions";

export default function ToggleBlogStatus({
    promptSessionId,
    promptSessionStatus,
    closeModal,
    setPromptSessionStatus
}: {
    promptSessionId: string,
    promptSessionStatus: string,
    setPromptSessionStatus: React.Dispatch<React.SetStateAction<string>>
    closeModal: () => void,
}) {

    console.log('prompt session status ', promptSessionStatus)
    const [state, action] = useActionState(toggleBlogStatus, {
        success: false,
        message: ''
    })

    const formVerb = promptSessionStatus === 'open' ? 'Closing' : 'Opening'
    const statusCapitalized = promptSessionStatus === 'open' ? 'Close' : 'Open'
    const newStatus = promptSessionStatus === 'open' ? 'closed' : 'open'
    const modalText = promptSessionStatus === 'open' ?
        'Are you sure you want to close this discussion? Students will no longer be able to comment.'
        :
        'Are you sure you want to open this discussion? Students will be able to comment.'


    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast(`Discussion ${newStatus}`);
            setPromptSessionStatus(newStatus)
            closeModal();
        }
    }, [state])


    function UpdateButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                disabled={pending}
                type="submit"
                className={`mx-auto block border-none ${promptSessionStatus === 'open' ? 'bg-destructive' : ''}`}
            >
                {pending ? `${formVerb}` : `${statusCapitalized} Discussion`}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-5">
            <div className="grid items-center gap-4">
                <Label htmlFor="year" className="text-center mx-auto mt-1 px-5 leading-normal">
                    <p>{modalText}</p>
                </Label>
                <input
                    hidden
                    defaultValue={promptSessionId}
                    id="promptId"
                    name="promptId"
                />
                <input
                    hidden
                    defaultValue={newStatus}
                    id="promptStatus"
                    name="promptStatus"
                />
            </div>
            <UpdateButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
