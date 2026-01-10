'use client'
import { useState } from "react"
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { deleteClassroom } from "@/lib/actions/classroom.actions"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Class } from "@/types"

export default function DeleteClassForm({ classroomId, closeModal, teacherId }: { classroomId: string, closeModal: () => void, teacherId: string }) {

    const [state, action] = useActionState(deleteClassroom, {
        success: false,
        message: ''
    })
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();

    //redirect if the state is success
    useEffect(() => {
        if (state?.success) {
            closeModal()
            // Remove deleted class from cache
            queryClient.setQueryData<Class[]>(['teacherClassrooms', teacherId], (old) => {
                if (!old) return old;
                return old.filter((classroom: Class) => classroom.id !== classroomId);
            });
            toast.error('Class Deleted!', {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
        }
    }, [state, router, pathname])

    const [userText, setUserText] = useState<string>('')

    function DeleteButton() {
        const { pending } = useFormStatus();
        return (
            <Button
                disabled={pending || userText !== 'Delete my class'}
                type="submit"
                className={`mx-auto block ${userText === 'Delete my class' ? 'opacity-80' : 'opacity-50'}`}
            >
                {pending ? 'Deleting...' : 'Delete Class'}
            </Button>
        );
    }

    return (
        <form action={action} className="space-y-5">
            <div className="grid items-center gap-4">
                <Label htmlFor="year" className="text-center mx-auto mt-1">
                    Type <span className="text-destructive">Delete my class</span> to confirm delete.
                </Label>
                <Input
                    id="year"
                    className="max-w-[320px] mx-auto"
                    name="year"
                    required
                    placeholder="required"
                    onChange={(e) => setUserText(e.target.value)}
                />
                <input
                    hidden
                    defaultValue={classroomId}
                    id="classroomId"
                    name="classroomId"
                />
                <input
                    hidden
                    defaultValue={teacherId}
                    id="teacherId"
                    name="teacherId"
                />
            </div>
            <DeleteButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
