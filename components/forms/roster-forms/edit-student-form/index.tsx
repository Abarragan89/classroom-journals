'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { editStudent } from "@/lib/actions/roster.action";
import { toast } from "sonner"
import { Session, User } from "@/types";


export default function EditStudentForm({
    closeModal,
    session,
    studentInfo,
    classId
}: {
    closeModal: () => void,
    session: Session,
    studentInfo: User,
    classId: string
}) {

    const [state, action] = useActionState(editStudent, {
        success: false,
        message: ''
    })
    const pathname = usePathname()
    const router = useRouter();


    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast.success('Student Updated!');
            closeModal()
            const teacherId = session.user.id
            router.push(`/classroom/${classId}/${teacherId}/roster`); // Navigates without losing state instantly
        }
    }, [state, pathname, router])


    const CreateButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} type="submit" className="mx-auto opacity-90">
                {pending ? 'Updating...' : 'Update Student'}
            </Button>
        )
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
                        defaultValue={studentInfo.name}
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
                        defaultValue={studentInfo.username}
                        placeholder="optional"
                    />
                </div>
            </div>
            <div className="flex-center mt-8">
                <CreateButton />
            </div>

            <input
                type="hidden"
                name="studentId"
                value={studentInfo.id}
                hidden
            />
            {state && !state.success === false && (
                <p className="text-center text-destructive mt-3">{state.message}</p>
            )}

        </form>
    )
}