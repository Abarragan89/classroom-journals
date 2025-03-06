'use client';
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { updateAPrompt } from "@/lib/actions/prompt.actions";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox"
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { Classroom, Prompt } from "@/types";

interface Question {
    name: string;
    label: string;
    value: string;
}


export default function EditSinglePromptForm({
    promptData,
    teacherId,
}: {
    promptData: Prompt,
    teacherId: string,
}) {

    const [state, action] = useActionState(updateAPrompt, {
        success: false,
        message: ''
    })
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [questions, setQuestions] = useState<Question[]>([
        { name: "question1", label: "Prompt", value: promptData.title }
    ]);
    const router = useRouter()

    useEffect(() => {
        const fetchClassrooms = async () => {
            if (teacherId) {
                const data = await getAllClassroomIds(teacherId); // Fetch classroom IDs
                setClassrooms(data as Classroom[]);
                setIsLoaded(true)
            }
        };
        fetchClassrooms();
    }, [teacherId]);


    // redirect if the state is success
    useEffect(() => {
        if (state.success) {
            toast('Jot Added!');
            router.push('/prompt-library'); // Navigates without losing state instantly
        }
    }, [state])

    const handleChange = (index: number, newValue: string) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q, i) => (i === index ? { ...q, value: newValue } : q))
        );
    };

    const CreateButton = () => {
        const { pending } = useFormStatus();
        return <Button type="submit" className="mx-auto mt-5">{pending ? "Creating..." : "Create Jot"}</Button>;
    };

    if (!isLoaded) {
        return (
            <div className="min-h-full flex-center">
                Loading...
            </div>
        )
    }

    

    return (
        <form action={action} className="grid relative">
            {questions.map((question, index) => (
                <div key={question.name}>
                    <div className="mt-4">
                        <Label htmlFor={question.name} className="text-right">
                            Prompt
                        </Label>
                        <Textarea
                            id={question.name}
                            className="col-span-3"
                            name={question.name}
                            value={question.value} // Keep text state for deletion
                            onChange={(e) => handleChange(index, e.target.value)}
                            required
                            rows={5}
                        />
                    </div>
                </div>
            ))}

            <Separator className="mt-10 mb-5" />
            {/* Associate with a classroom */}
            <div className="space-y-3">
                {classrooms?.length > 0 && (
                    <>
                        <p className="text-sm">Organize Under:</p>
                        {classrooms.map((classroom: Classroom) => (
                            <div key={classroom.id} className="flex items-center space-x-2">
                                <Checkbox
                                    defaultChecked={promptData.classes?.some(currentClass => currentClass.id === classroom.id)}
                                    id={classroom.id}
                                    value={classroom.id}
                                    name={`classroom-organize-${classroom.id}`} />
                                <label
                                    htmlFor={classroom.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {classroom.name}
                                </label>
                            </div>
                        ))}
                    </>
                )}
            </div>
            {/* Assign to a classroom */}
            <div className="space-y-3 mt-5">
                {classrooms?.length > 0 && (
                    <>
                        <Separator />
                        <p className="text-sm">Assign To:</p>
                        {classrooms.map((classroom: Classroom) => (
                            <div key={`classroom-assign-${classroom.id}`} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`classroom-assign-${classroom.id}`}
                                    value={classroom.id}
                                    name={`classroom-assign-${classroom.id}`}
                                />
                                <label
                                    htmlFor={`classroom-assign-${classroom.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {classroom.name}
                                </label>
                            </div>
                        ))}
                    </>
                )}
            </div>
            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
            />
            <input
                type="hidden"
                name="promptId"
                value={promptData.id}
            />
            <input
                id="title"
                value={questions[0].value}
                name="title"
                required
                hidden
                readOnly
            />

            {state && !state.success && (
                <p className="text-center text-destructive mt-3">{state.message}</p>
            )}
            <div className="flex-center">
                <CreateButton />
            </div>
        </form>
    )
}
