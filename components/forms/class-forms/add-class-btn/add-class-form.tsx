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
import { useQueryClient } from "@tanstack/react-query";
import { getTeacherGoogleClassrooms } from "@/lib/actions/google.classroom.actions";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    const queryClient = useQueryClient();

    //redirect if the state is success
    useEffect(() => {
        if (state?.success) {
            toast.success('Class Added!');
            // invalidate the teacherClassrooms useQuery
            queryClient.invalidateQueries({ queryKey: ['teacherClassrooms', teacherId] });
            closeModal()
            router.push(`/classroom/${state.data}/${teacherId}/roster`); // Navigates without losing state instantly
        }
    }, [state, pathname, router])

    const [selectedColor, setSelectedColor] = useState<string>('rgba(220, 38, 38, 0.90)');

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
        <form action={action} className="py-4 px-2">
            <div className="grid grid-cols-2 gap-x-5 mb-5">
                <div className="flex flex-col col-span-1 items-start space-y-1">
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
                    <Label htmlFor="subject" className="text-right">
                        Subject
                    </Label>
                    <Input
                        id="subject"
                        name="subject"
                        placeholder="optional"
                    />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-x-5 mb-4">
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
                <div className="flex flex-col col-span-1 items-start space-y-1">
                    <Label htmlFor="grade" className="text-right">
                        Grade
                    </Label>
                    <Select name="grade">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a grade level" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                            <SelectGroup>
                                <SelectLabel>Photo Categories</SelectLabel>
                                {selectionGradeLevelOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col col-span-1 items-start space-y-1">
                    <Label htmlFor="period" className="text-right">
                        Period
                    </Label>
                    <Input
                        id="period"
                        name="period"
                        placeholder="optional"
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

                <div className="flex-center mt-5">
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