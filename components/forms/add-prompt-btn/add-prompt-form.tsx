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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator";

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

    // redirect if the state is success
    useEffect(() => {
        if (state.success) {
            redirect(`/jot-library/${teacherId}`)
        }
    }, [state])

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
                    <div className="mt-1">
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
                        <p onClick={() => handleRemoveQuestion(index)} className="hover:cursor-pointer hover:underline p-1 text-[.875rem] text-destructive w-fit relative right-[-23rem] leading-none">Delete</p>
                    }
                </div>
            ))}
            {/*   */}
            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}

            <Separator className="mt-5 mb-3" />
            <div className="flex-between">
                <div className="flex items-center space-x-2">
                    <Switch id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Add prompt to all classes</Label>
                </div>
                <Button asChild variant='link' className=" bottom-[0px] right-[6px]">
                    <p onClick={() => handleAddQuestion()} className="hover:cursor-pointer w-fit"><Plus />Add question</p>
                </Button>
            </div>
            <CreateButton />
            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
            />
        </form>
    )
}
