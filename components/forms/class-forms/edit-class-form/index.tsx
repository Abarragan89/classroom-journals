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
    closeModal,
    isInSettingsPage = false,
}: {
    classData: Class,
    closeModal: () => void,
    isInSettingsPage?: boolean
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
        <form action={action} className={`grid gap-4 ${isInSettingsPage ? '' : 'py-4'}`}>
            <div className={`
                grid items-center mx-auto
                ${isInSettingsPage ? 'grid-cols-1 w-full gap-1' : 'grid-cols-4 w-4/5 gap-4'}`
            }>
                <Label htmlFor="name" className={`${isInSettingsPage ? '' : 'text-right'}`}>
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
            <div className={`
                grid items-center mx-auto
                ${isInSettingsPage ? 'grid-cols-1 w-full gap-1' : 'grid-cols-4 w-4/5 gap-4'}`
            }>
                <Label htmlFor="year" className={`${isInSettingsPage ? '' : 'text-right'}`}>
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
            <div className={`
                grid items-center mx-auto
                ${isInSettingsPage ? 'grid-cols-1 w-full gap-1' : 'grid-cols-4 w-4/5 gap-4'}`
            }>
                <Label htmlFor="grade" className={`${isInSettingsPage ? '' : 'text-right'}`}>
                    Grade
                </Label>
                <Input
                    id="grade"
                    className="col-span-3"
                    name="grade"
                    maxLength={12}
                    defaultValue={classData?.grade ?? ''}
                    placeholder="optional"
                />
            </div>
            <div className={`
                grid items-center mx-auto
                ${isInSettingsPage ? 'grid-cols-1 w-full gap-1' : 'grid-cols-4 w-4/5 gap-4'}`
            }>
                <Label htmlFor="subject" className={`${isInSettingsPage ? '' : 'text-right'}`}>
                    Subject
                </Label>
                <Input
                    id="subject"
                    className="col-span-3"
                    name="subject"
                    defaultValue={classData?.subject ?? ''}
                    placeholder="optional"
                />
            </div>
            <div className={`
                grid items-center mx-auto
                ${isInSettingsPage ? 'grid-cols-1 w-full gap-1' : 'grid-cols-4 w-4/5 gap-4'}`
            }>
                <Label htmlFor="period" className={`${isInSettingsPage ? '' : 'text-right'}`}>
                    Period
                </Label>
                <Input
                    id="period"
                    className="col-span-3"
                    name="period"
                    defaultValue={classData?.period ?? ''}
                    placeholder="optional"
                />
            </div>
            {/* Color Selection */}
            <div className={`
                grid items-center mx-auto
                ${isInSettingsPage ? 'grid-cols-1 w-full gap-1' : 'grid-cols-4 w-4/5 gap-4'}`
            }>
                <Label htmlFor="color" className={`${isInSettingsPage ? '' : 'text-right'}`}>
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
