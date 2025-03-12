'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { addStudentToRoster } from "@/lib/actions/roster.action";
import { toast } from "sonner"
import { GoogleClassroom, Session } from "@/types";
import { getTeacherGoogleClassrooms } from "@/lib/actions/google.classroom.actions";


export default function AddStudentForm({
    closeModal,
    session,
    updateGoogleClassrooms,
    classId

}: {
    closeModal: () => void,
    session: Session,
    classId: string,
    updateGoogleClassrooms: (classes: GoogleClassroom[], isOpen: boolean) => void
}) {

    const [state, action] = useActionState(addStudentToRoster, {
        success: false,
        message: ''
    })
    const pathname = usePathname()
    const router = useRouter();


    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast.success('Student Added!');
            closeModal()
            router.push(`/classroom/${state.data}/${session.user.id}/roster`); // Navigates without losing state instantly
        }
    }, [state, pathname, router])


    const CreateButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} type="submit" className="mx-auto opacity-90">
                {pending ? 'Add...' : 'Add Student'}
            </Button>
        )
    }

    async function fetchGoogleClassrooms() {
        try {
            const response = await getTeacherGoogleClassrooms(session.googleProviderId)
            updateGoogleClassrooms(response, true)
        } catch (error) {
            console.log('error fetching google classrooms', error)
        }
    }


    return (
        <form action={action} className="pb-4 pt-2 px-4">
            <div className="flex-between">
                <div>
                    <Label htmlFor="name" className="text-right">
                        Name
                    </Label>
                    <Input
                        id="name"
                        required
                        placeholder="required"
                        name="name"
                    />
                </div>
                <div>
                    <Label htmlFor="username" className="text-right">
                        Username
                    </Label>
                    <Input
                        id="username"
                        name="username"
                        placeholder="optional"
                    />
                </div>
            </div>
            <div className="flex-center mt-6">
                <CreateButton />
            </div>


            <input
                type="hidden"
                name="classId"
                value={classId}
                hidden
            />
            {state && !state.success === false && (
                <p className="text-center text-destructive mt-3">{state.message}</p>
            )}

            {session?.googleProviderId && (
                <div className="flex flex-col mx-auto w-2/3">
                    <p className="my-3 text-center relative">
                        <span className="relative z-10 bg-background px-3">or</span>
                        <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-t border-gray-500"></span>
                    </p>

                    <Button type="button" onClick={fetchGoogleClassrooms} className="mx-auto">
                        Import Roster From Google Classroom
                    </Button>
                </div>
            )}

        </form>
    )
}