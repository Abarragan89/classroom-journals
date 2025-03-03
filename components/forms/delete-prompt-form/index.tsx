'use client'
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { deletePrompt } from "@/lib/actions/prompt.actions"
import { usePathname, useRouter } from "next/navigation"
import { toast } from 'sonner'

export default function DeletePromptForm({ promptId, promptTitle, closeModal }: { promptId: string, promptTitle: string, closeModal: () => void }) {

    const [state, action] = useActionState(deletePrompt, {
        success: false,
        message: ''
    })
    const pathname = usePathname()
    const router = useRouter()

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast('Jot Deleted!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
            closeModal()
            router.push(pathname); // Navigates without losing state instantly
        }
    }, [state])


    function DeleteButton() {
        const { pending } = useFormStatus();
        return (
            <Button
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
