'use client'
import { useState } from "react"
import { useActionState, useEffect } from "react"
import { redirect } from "next/navigation"
import { useFormStatus } from "react-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { deleteClassroom } from "@/lib/actions/classroom.actions"

export default function DeleteClassForm({ classroomId }: { classroomId: string }) {

    const [state, action] = useActionState(deleteClassroom, {
        success: false,
        message: ''
    })

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            redirect('/dashboard')
        }
    }, [state])

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
            </div>
            <DeleteButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
