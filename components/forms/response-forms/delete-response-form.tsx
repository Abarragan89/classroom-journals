import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { deleteResponse } from "@/lib/actions/response.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteResponseForm({
    responseId,
    classId,
    teacherId,
    sessionId,
}: {
    responseId: string,
    classId: string,
    teacherId: string,
    sessionId: string

}) {
    
    const router = useRouter();
    const [state, action] = useActionState(deleteResponse, {
        success: false,
        message: ''
    })

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast('Assignment removed!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
            router.push(`/classroom/${classId}/${teacherId}/single-prompt-session/${sessionId}`);
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
                {pending ? 'Removing...' : 'Remove Assignment'}
            </Button>
        );
    }

    return (
        <form action={action}>
            <p className="mt-2 mb-5">Are you sure you want to remove this assignment from this student?</p>
            <input
                type="hidden"
                name="response-id"
                id="response-id"
                readOnly
                defaultValue={responseId}
            />
            <input
                type="hidden"
                name="teacherId"
                id="teacherId"
                readOnly
                defaultValue={teacherId}
            />
            <DeleteButton />
        </form>
    )
}
