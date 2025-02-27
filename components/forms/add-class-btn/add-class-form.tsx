'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createNewClass } from "@/lib/actions/classroom.actions";
import ColorSelect from "../class-color-select";
import { redirect } from "next/navigation";
import { ClassForm } from "@/types";

export default function AddClassForm({ teacherId, formData }: { teacherId: string, formData?: ClassForm }) {

    const [state, action] = useActionState(createNewClass, {
        success: false,
        message: ''
    })

    //redirect if the state is success
    useEffect(() => {
        if (state.success) {
            redirect('/dashboard')
        }
    }, [state])

    const [selectedColor, setSelectedColor] = useState<string>('#f87171');

    // Handler for setting the color value when a color is selected
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    const CreateButton = () => {
        const { pending } = useFormStatus()
        return (
                <Button type="submit" className="mx-auto">
                    {pending ? 'Creating...' : 'Create Class'}
                </Button>
        )
    }

    return (
        <form action={action} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    Name
                </Label>
                <Input
                    id="name"
                    required
                    placeholder="required"
                    className="col-span-3"
                    name="name"
                    defaultValue={formData?.name ?? undefined}
                    maxLength={30}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                    Subject
                </Label>
                <Input
                    id="subject"
                    className="col-span-3"
                    name="subject"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
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
                name="teacherId"
                value={teacherId}
            />
            <CreateButton />
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
        </form>
    )
}
