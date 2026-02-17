'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { addStudentToRoster } from "@/lib/actions/roster.action";
import { toast } from "sonner"
import { GoogleClassroom, Session, User } from "@/types";
import { getTeacherGoogleClassrooms } from "@/lib/actions/google.classroom.actions";
import { FaGoogle } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";


export default function AddStudentForm({
    session,
    updateGoogleClassrooms,
    classId

}: {
    session: Session,
    classId: string,
    updateGoogleClassrooms: (classes: GoogleClassroom[], isOpen: boolean) => void
}) {

    const [state, action] = useActionState(addStudentToRoster, {
        success: false,
        message: ''
    })
    const pathname = usePathname()
    const queryClient = useQueryClient();


    //redirect if the state is success
    useEffect(() => {
        if (state?.success) {
            toast.success(`${state?.data?.name || 'Student'} Added!`);
            // update quietClient cache 
            queryClient.setQueryData<User[]>(['getStudentRoster', classId], (old) => {
                return [...(old ?? []), state.data as User];
            });
            window.scrollTo(0, 0);
        }
    }, [state, pathname, classId, queryClient])


    const CreateButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} type="submit" className="mx-auto w-[80px] shadow-sm">
                {pending ? 'Adding...' : 'Add'}
            </Button>
        )
    }

    async function fetchGoogleClassrooms() {
        try {
            const response = await getTeacherGoogleClassrooms(session.googleProviderId)
            updateGoogleClassrooms(response, true)
        } catch (error) {
            console.error('error fetching google classrooms', error)
        }
    }


    return (
        <form action={action} className="pb-4 pt-2">
            <div className="flex-between gap-x-5">
                <div>
                    <Label htmlFor="name" className="text-right relative">
                        Name <span className="absolute -bottom-1.5 -right-2.5 text-lg text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        required
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
                        className="placeholder:italic"
                    />
                </div>
                <div className="flex-center mt-5">
                    <CreateButton />
                </div>
            </div>

            <input
                type="hidden"
                name="classId"
                id="classId"
                value={classId}
                hidden
            />
            <input
                type="hidden"
                name="teacherId"
                id="teacherId"
                value={session.user.id}
                hidden
            />
            {state && !state.success && (
                <p className="text-center text-destructive mt-3">{state.message}</p>
            )}

            {session?.googleProviderId && (
                <>
                <div className="flex flex-col mx-auto w-2/3">
                    <p className="my-3 text-center relative">
                        <span className="relative z-10 bg-background px-5">or</span>
                        <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-t border-gray-500"></span>
                    </p>

                </div>
                <div className="flex-center">
                    <Button size="lg" type="button" onClick={fetchGoogleClassrooms} className="mx-auto px-2 md:px-5">
                        <FaGoogle />   Import From Google Classroom
                    </Button>
                </div>
                </>
            )}

        </form>
    )
}