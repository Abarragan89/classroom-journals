'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createNewClass } from "@/lib/actions/classroom.actions";
import ColorSelect from "../class-color-select";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { toast } from "sonner"
import { GoogleClassroom, Session } from "@/types";
import { getTeacherGoogleClassrooms } from "@/lib/actions/google.classroom.actions";

export default function AddClassForm({
    teacherId,
    closeModal,
    session,
    updateGoogleClassrooms,

}: {
    teacherId: string,
    closeModal: () => void,
    session: Session,
    updateGoogleClassrooms: (classes: GoogleClassroom[], isOpen: boolean) => void
}) {

    const [state, action] = useActionState(createNewClass, {
        success: false,
        message: ''
    })
    const pathname = usePathname()
    const router = useRouter();


    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast.success('Class Added!');
            closeModal()
            router.push(`/classroom/${state.data}/${teacherId}`); // Navigates without losing state instantly
        }
    }, [state, pathname, router])

    const [selectedColor, setSelectedColor] = useState<string>('#dc2626');

    // Handler for setting the color value when a color is selected
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    const CreateButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} type="submit" className="mx-auto">
                {pending ? 'Creating...' : 'Create Class'}
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
        <form action={action} className="py-4 px-2">
            <div className="grid grid-cols-3 gap-x-5 mb-5">
                <div className="flex flex-col col-span-2 items-start space-y-1">
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
                <div className="flex flex-col col-span-1 items-start space-y-1">
                    <Label htmlFor="year" className="text-right">
                        Year
                    </Label>
                    <Input
                        id="year"
                        name="year"
                        required
                        maxLength={12}
                        placeholder="required"
                    />
                </div>

            </div>
            <div className="grid grid-cols-3 gap-x-5 mb-4">
                <div className="flex flex-col col-span-2 items-start space-y-1">
                    <Label htmlFor="subject" className="text-right">
                        Subject
                    </Label>
                    <Input
                        id="subject"
                        name="subject"
                    />
                </div>
                <div className="flex flex-col col-span-1 items-start space-y-1">
                    <Label htmlFor="period" className="text-right">
                        Period
                    </Label>
                    <Input
                        id="period"
                        name="period"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-x-5 items-end mb-2">
                {/* Color Selection */}
                <div className="items-center gap-x-2 col-span-2">
                    <Label htmlFor="color" className="text-right">
                        Color
                    </Label>
                    <div>
                        <ColorSelect setColor={handleColorSelect} selectedColor={selectedColor} />
                        {/* Hidden input to store selected color */}
                        <input
                            type="hidden"
                            name="color"
                            value={selectedColor}
                            hidden
                        />
                    </div>
                </div>

                <div className="col-span-1">
                    <CreateButton />
                </div>

            </div>


            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
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
                        Import From Google Classroom
                    </Button>
                </div>
            )}

        </form>
    )
}