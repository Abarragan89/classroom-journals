'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { togglePublicPrivateStatus } from "@/lib/actions/prompt.session.actions";

export default function TogglePrivatePublicStatus({
    promptSessionId,
    isPublic,
    closeModal,
    setPromptSessionStatus,
    teacherId
}: {
    promptSessionId: string,
    isPublic: boolean,
    setPromptSessionStatus: React.Dispatch<React.SetStateAction<boolean>>
    closeModal: () => void,
    teacherId: string
}) {

    const [state, action] = useActionState(togglePublicPrivateStatus, {
        success: false,
        message: ''
    })

    const newStatusString = isPublic ? 'private' : 'public';
    const newStatusBoolean = isPublic ? false : true;
    const modalText = isPublic ?
        'Are you sure you want to make this private? Responses will only be visible to teacher.'
        :
        'Are you sure you want to make this public? Students and teachers will be able to view and comment.'


    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast(`Discussion ${newStatusString}`);
            setPromptSessionStatus(newStatusBoolean)
            closeModal();
        }
    }, [state])


    function UpdateButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                disabled={pending}
                type="submit"
                className={`mx-auto block border-none`}
            >
                {pending ? "Updating" : `Make ${newStatusString}`}
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
                    defaultValue={newStatusString}
                    id="promptStatus"
                    name="promptStatus"
                />
                <input
                    hidden
                    defaultValue={teacherId}
                    id="teacherId"
                    name="teacherId"
                />
            </div>
            <UpdateButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
