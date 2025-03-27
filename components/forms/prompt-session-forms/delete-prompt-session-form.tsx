'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { deletePromptSession } from "@/lib/actions/prompt.session.actions";
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function DeletePromptSessionForm({
    promptSessionId,
    closeModal,
}: {
    promptSessionId: string,
    closeModal: () => void,
}) {

    const router = useRouter();
    const { classId, teacherId} = useParams()

    const [state, action] = useActionState(deletePromptSession, {
        success: false,
        message: ''
    })

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast('Assignment Deleted!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
            router.push(`/classroom/${classId}/${teacherId}`);
        }
    }, [state])


    function DeleteButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                disabled={pending}
                type="submit"
                className={`mx-auto block bg-destructive border-none`}
            >
                {pending ? 'Deleting...' : 'Delete Jot'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-5">
            <div className="grid items-center gap-4">
                <Label htmlFor="year" className="text-center mx-auto mt-1 px-5 leading-normal">
                    <p>Are you sure you want to delete this assignment?</p>
                </Label>
                <input
                    hidden
                    defaultValue={promptSessionId}
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
