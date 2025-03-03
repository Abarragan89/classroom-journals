'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { redirect } from "next/navigation";
import { createNewPrompt } from "@/lib/actions/prompt.actions";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox"
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { ClassroomIds } from "@/types";

interface Question {
    name: string;
    label: string;
    value: string;
}


export default function AddPromptForm({ teacherId }: { teacherId: string }) {

    const [state, action] = useActionState(createNewPrompt, {
        success: false,
        message: ''
    })
    const [classrooms, setClassrooms] = useState<ClassroomIds[]>([]);

    useEffect(() => {
        const fetchClassrooms = async () => {
            if (teacherId) {
                const data = await getAllClassroomIds(teacherId); // Fetch classroom IDs
                setClassrooms(data as ClassroomIds[]);
            }
        };
        fetchClassrooms();
    }, [teacherId]);

    
    // redirect if the state is success
    useEffect(() => {
        if (state.success) {
            redirect(`/prompt-library`)
        }
    }, [state])
    
    if (!classrooms.length) return null;
    
    const [questions, setQuestions] = useState<Question[]>([
        { name: "question1", label: "Question 1", value: "" }
    ]);

    const handleAddQuestion = () => {
        setQuestions(prevQuestions => [
            ...prevQuestions,
            { name: `question${prevQuestions.length + 1}`, label: `Question ${prevQuestions.length + 1}`, value: "" }
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(prevQuestions =>
            prevQuestions
                .filter((_, i) => i !== index)
                .map((q, i) => ({ ...q, name: `question${i + 1}`, label: `Question ${i + 1}` })) // Renumbering
        );
    };

    const handleChange = (index: number, newValue: string) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q, i) => (i === index ? { ...q, value: newValue } : q))
        );
    };

    const CreateButton = () => {
        const { pending } = useFormStatus();
        return <Button type="submit" className="mx-auto mt-5">{pending ? "Creating..." : "Create Prompt"}</Button>;
    };

    return (
        <form action={action} className="grid relative">
            <div className="mb-3">
                <Label htmlFor="title" className="text-right">
                    Title
                </Label>
                <Input
                    id="title"
                    className="col-span-3"
                    name="title"
                    required
                />
            </div>
            {questions.map((question, index) => (
                <div key={question.name}>
                    <div className="mt-4">
                        <Label htmlFor={question.name} className="text-right">
                            {question.label}
                        </Label>
                        <Textarea
                            id={question.name}
                            className="col-span-3"
                            name={question.name}
                            value={question.value} // Keep text state for deletion
                            onChange={(e) => handleChange(index, e.target.value)}
                            required
                        />
                    </div>
                    {questions.length > 1 &&
                        <p onClick={() => handleRemoveQuestion(index)} className="hover:cursor-pointer hover:underline p-1 text-[.875rem] text-destructive w-fit leading-none">Delete</p>
                    }
                </div>
            ))}

            <Button asChild variant='link' className="flex justify-end w-full pt-0">
                <p onClick={() => handleAddQuestion()} className="hover:cursor-pointer w-fit justify-end"><Plus />Add question</p>
            </Button>

            <Separator className="my-3" />
            {/* Associate with a classroom */}
            <div className="space-y-3">
                <p className="text-sm">Organize Under Classrooms (Optional)</p>
                {classrooms.length > 0 && classrooms.map((classroom: ClassroomIds) => (
                    <div key={classroom.id} className="flex items-center space-x-2">
                        <Checkbox id={classroom.id} value={classroom.id} name={`classroom-${classroom.id}`} />
                        <label
                            htmlFor={classroom.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {classroom.name}
                        </label>
                    </div>
                ))}
            </div>
            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
            />

            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}

            <CreateButton />
        </form>
    )
}
