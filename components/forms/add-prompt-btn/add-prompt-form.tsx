'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { redirect } from "next/navigation";
import { createNewPrompt } from "@/lib/actions/prompt.actions";

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
            redirect('/dashboard')
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
            <div>
                <Label htmlFor="title" className="text-right">
                    Title
                </Label>
                <Input
                    id="title"
                    placeholder="optional"
                    className="col-span-3"
                    name="title"
                />
            </div>
            {questions.map((question, index) => (
                <div key={question.name}>
                    <div className="mt-5">
                        <Label htmlFor={question.name} className="text-right">
                            {question.label}
                        </Label>
                        <Textarea
                            id={question.name}
                            className="col-span-3"
                            name={question.name}
                            value={question.value} // Keep text state
                            onChange={(e) => handleChange(index, e.target.value)}
                            required
                        />
                    </div>
                    <Button asChild variant='link' className="flex-start p-1 underline">
                        <p onClick={() => handleRemoveQuestion(index)} className="hover:cursor-pointer">Delete question</p>
                    </Button>
                </div>
            ))}
            <Button asChild variant='link' className="absolute bottom-[56px] right-[6px] underline">
                <p onClick={() => handleAddQuestion()} className="hover:cursor-pointer">Add question</p>
            </Button>
            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
            />

            <CreateButton />
            {/* {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )} */}
        </form>
    )
}
