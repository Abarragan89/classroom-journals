'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateClassInfo } from "@/lib/actions/classroom.actions";
import ColorSelect from "../class-color-select";
import { Class } from "@/types";
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EditClassForm({
    classData,
    closeModal,
    isInSettingsPage = false,
    onSuccess
}: {
    classData: Class,
    closeModal?: () => void,
    isInSettingsPage?: boolean,
    onSuccess?: (updatedData: Class) => void
}) {

    const [state, action] = useActionState(updateClassInfo, {
        success: false,
        message: ''
    })

    // redirect if the state is success
    useEffect(() => {
        if (state?.success) {
            // close modal if closeModal function is provided
            if (closeModal) closeModal();
            // update cache
            if (onSuccess) onSuccess(state.data as Class);
            toast('Class Updated!');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    // Convert old color format to chart number, default to '1' if invalid
    const getInitialColor = (color: string | undefined): string => {
        if (!color) return '1';
        // If it's already a chart number (1-5), use it
        if (['1', '2', '3', '4', '5'].includes(color)) return color;
        // Otherwise default to '1'
        return '1';
    };

    const [selectedColor, setSelectedColor] = useState<string>(getInitialColor(classData?.color));

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

    const selectionGradeLevelOptions = [
        { value: 'kindergarten', label: 'Kindergarten' },
        { value: '1st Grade', label: '1st Grade' },
        { value: '2nd Grade', label: '2nd Grade' },
        { value: '3rd Grade', label: '3rd Grade' },
        { value: '4th Grade', label: '4th Grade' },
        { value: '5th Grade', label: '5th Grade' },
        { value: '6th Grade', label: '6th Grade' },
        { value: '7th Grade', label: '7th Grade' },
        { value: '8th Grade', label: '8th Grade' },
        { value: '9th Grade', label: '9th Grade' },
        { value: '10th Grade', label: '10th Grade' },
        { value: '11th Grade', label: '11th Grade' },
        { value: '12th Grade', label: '12th Grade' },
        { value: 'college', label: 'College Level' }
    ];

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
                <Select name="grade" defaultValue={classData.grade}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a grade level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Grade Levels</SelectLabel>
                            {selectionGradeLevelOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
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
                <div className="col-span-3 mt-2">
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
