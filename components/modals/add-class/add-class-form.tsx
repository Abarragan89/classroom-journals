'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { DialogFooter } from "@/components/ui/dialog";
import { createNewClass } from "@/lib/actions/classroom.actions";
import ColorSelect from "./color-select";

export default function AddClassForm() {

    const [errorMsg, action] = useActionState(createNewClass, {
        success: false,
        message: ''
    })

    const [selectedColor, setSelectedColor] = useState<string>('#f87171');

    // Handler for setting the color value when a color is selected
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    const CreateButton = () => {
        const { pending } = useFormStatus()
        return (
            <DialogFooter>
                <Button type="submit" className="mx-auto">
                    {pending ? 'Creating...' : 'Create Class'}
                </Button>
            </DialogFooter>
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
                <Label htmlFor="room" className="text-right">
                    Room
                </Label>
                <Input
                    id="room"
                    className="col-span-3"
                    name="room"
                />            </div>
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
                        value={selectedColor} // Set the selected color here
                    />
                </div>
            </div>
            <CreateButton />
            {errorMsg && !errorMsg.success && (
                <p className="text-center text-destructive">{errorMsg.message}</p>
            )}
        </form>
    )
}
