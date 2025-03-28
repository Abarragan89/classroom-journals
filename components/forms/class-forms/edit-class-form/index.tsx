'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateClassInfo } from "@/lib/actions/classroom.actions";
import ColorSelect from "../class-color-select";
import { Class } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { toast } from 'sonner'

export default function EditClassForm({
    classData,
    closeModal
}: {
    classData: Class,
    closeModal: () => void
}) {

    const [state, action] = useActionState(updateClassInfo, {
        success: false,
        message: ''
    })
    const pathname = usePathname()
    const router = useRouter();

    // redirect if the state is success
    useEffect(() => {
        if (state.success) {
            closeModal()
            toast('Class Updated!');
            router.push(pathname); // Navigates without losing state instantly
        }
    }, [state])

    const [selectedColor, setSelectedColor] = useState<string>(classData?.color ?? '#f87171');

    // Handler for setting the color value when a color is selected
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    const UpdateButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} type="submit" className="mx-auto">
                {pending ? 'Updating...' : 'Update Class'}
            </Button>
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
                    defaultValue={classData?.name ?? ''}
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
                    defaultValue={classData?.year ?? ''}
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
                    defaultValue={classData?.subject ?? ''}
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
                    defaultValue={classData?.period ?? ''}
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
                    />
                </div>
            </div>
            <input
                type="hidden"
                name="classroomId"
                value={classData.id}
            />
            <UpdateButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
