'use client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { useQueryClient } from "@tanstack/react-query";

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
    const queryClient = useQueryClient();

    //redirect if the state is success
    useEffect(() => {
        if (state?.success) {
            toast.success('Student Updated!');
            closeModal()
            // update cache
            queryClient.setQueryData<User[]>(['getStudentRoster', classId], (old) => {
                if (!old) return old;
                return old.map((student: User) => student.id === studentInfo.id ? { ...student, ...state.data } as User : student);
            });
        } else if (state?.success === false && state.message !== '') {
            toast.error(state.message, {
                style: { background: 'hsl(0 84.2% 60.2%)', color: 'white' }
            });
        }
    }, [state, pathname, router, queryClient])


    const UpdateButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} type="submit" className="mx-auto opacity-90">
                {pending ? 'Updating...' : 'Update Student'}
            </Button>
        )
    }

    return (
        <form action={action} className="pb-4 pt-2 px-4 space-y-8">
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
            <div className="flex-between">
                <div>
                    <Label htmlFor="password" className="text-right">
                        Password
                    </Label>
                    <Input
                        id="password"
                        required
                        placeholder="required"
                        maxLength={5}
                        minLength={5}
                        defaultValue={studentInfo.password}
                        name="password"
                    />
                </div>
                <div>
                    <Label htmlFor="comment-cool-down" className="text-right">
                        Comment Cool Down
                    </Label>

                    <Select
                        defaultValue={studentInfo?.commentCoolDown?.toString()}
                        name="comment-cool-down"
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Comments Disabled" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">No cool down</SelectItem>
                            <SelectItem value="20">20 seconds</SelectItem>
                            <SelectItem value="40">40 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                            <SelectItem value="600">10 minutes</SelectItem>
                            <SelectItem value="1800">30 minutes</SelectItem>
                            <SelectItem value="3600">1 hour</SelectItem>
                            <SelectItem value="disabled">Comments Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex-center mt-8">
                <UpdateButton />
            </div>

            <input
                type="hidden"
                name="studentId"
                value={studentInfo.id}
                readOnly
                hidden
            />
            <input
                type="hidden"
                name="teacherId"
                id="teacherId"
                value={session.user.id}
                hidden
            />
            <input
                type="hidden"
                name="classId"
                value={classId}
                readOnly
                hidden
            />
            <input
                type="hidden"
                name="current-password"
                value={studentInfo.password}
                readOnly
                hidden
            />
            {state && !state.success === false && (
                <p className="text-center text-destructive mt-3">{state.message}</p>
            )}

        </form>
    )
}