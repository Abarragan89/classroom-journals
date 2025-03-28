'use client'
import { useState } from "react"
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { deleteStudent } from "@/lib/actions/roster.action"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Session, User } from "@/types"


export default function DeleteStudentForm({
    studentInfo,
    closeModal,
    session,
    classId
}: {
    classId: string,
    closeModal: () => void,
    studentInfo: User,
    session: Session
}) {

    const [state, action] = useActionState(deleteStudent, {
        success: false,
        message: ''
    })
    const pathname = usePathname();
    const router = useRouter();

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            closeModal()
            const teacherId = session.user.id
            router.push(`/classroom/${classId}/${teacherId}/roster`); // Navigates without losing state instantly
            toast.error('Student Deleted!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
        }
    }, [state, router, pathname])

    const [userText, setUserText] = useState<string>('')

    function DeleteButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                disabled={pending || userText !== `Delete ${studentInfo.name}`}
                type="submit"
                className={`mx-auto block ${userText === `Delete ${studentInfo.name}` ? 'opacity-80' : 'opacity-50'}`}
            >
                {pending ? 'Deleting...' : 'Delete Student'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-5">
            <div className="grid items-center gap-4">
                <Label htmlFor="confirmText" className="text-center mx-auto mt-1">
                    Type <span className="text-destructive">Delete {studentInfo.name}</span> to confirm delete.
                </Label>
                <Input
                    id="confirmText"
                    className="max-w-[320px] mx-auto"
                    name="confirmText"
                    required
                    placeholder="required"
                    onChange={(e) => setUserText(e.target.value)}
                />
                <input
                    hidden
                    defaultValue={studentInfo.id}
                    id="studentId"
                    name="studentId"
                />
            </div>
            <DeleteButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
