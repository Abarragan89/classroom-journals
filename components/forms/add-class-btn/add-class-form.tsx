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
    updateGoogleClassrooms: React.Dispatch<React.SetStateAction<GoogleClassroom[]>>
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
            router.push(`/classroom/${state.data}`); // Navigates without losing state instantly
        }
    }, [state, closeModal, pathname, router])

    const [selectedColor, setSelectedColor] = useState<string>('#dc2626');
    const [googleClassrooms, setGoogleClassrooms] = useState<[]>([]);

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
                updateGoogleClassrooms(response)
                console.log('response ', response)
            } catch (error) {
                
            }
        }

    if (googleClassrooms.length > 0) {
        return (
            <p>Here are your classes</p>
        )
    }


    return (
        <form action={action} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4 mx-auto w-4/5">
                <Label htmlFor="name" className="text-right">
                    Name
                </Label>
                <Input
                    id="name"
                    required
                    placeholder="required"
                    className="col-span-3"
                    name="name"
                    maxLength={30}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mx-auto w-4/5">
                <Label htmlFor="year" className="text-right">
                    Year
                </Label>
                <Input
                    id="year"
                    className="col-span-3"
                    name="year"
                    required
                    maxLength={12}
                    placeholder="required"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mx-auto w-4/5">
                <Label htmlFor="subject" className="text-right">
                    Subject
                </Label>
                <Input
                    id="subject"
                    className="col-span-3"
                    name="subject"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mx-auto w-4/5">
                <Label htmlFor="period" className="text-right">
                    Period
                </Label>
                <Input
                    id="period"
                    className="col-span-3"
                    name="period"
                />
            </div>
            {/* Color Selection */}
            <div className="grid grid-cols-4 items-center gap-4 mx-auto w-4/5">
                <Label htmlFor="color" className="text-right">
                    Color
                </Label>
                <div className="col-span-3">
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
            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
                hidden
            />
            {state && !state.success === false && (
                <p className="text-center text-destructive mt-3">{state.message}</p>
            )}
            <CreateButton />

            {session?.googleProviderId && (
                <div className="flex flex-col mx-auto w-2/3">
                    <p className="mb-3 text-center relative">
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