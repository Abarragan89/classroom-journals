'use client';
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { createNewPrompt, updateAPrompt } from "@/lib/actions/prompt.actions";
import { Checkbox } from "@/components/ui/checkbox"
import { Classroom, Prompt, PromptCategory } from "@/types";
import { addPromptCategory } from "@/lib/actions/prompt.categories";
import { useSearchParams } from "next/navigation";
import CategorySection from "./category-section";
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CiCircleQuestion } from "react-icons/ci";
import LoadingAnimation from "@/components/loading-animation";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";


interface Question {
    name: string;
    label: string;
    value: string;
}

export default function SinglePromptForm({ teacherId }: { teacherId: string }) {

    const searchParams = useSearchParams()
    const existingPromptId = searchParams.get('edit')
    const callBackUrl = searchParams.get('callbackUrl')

    const actionFunction = existingPromptId ? updateAPrompt : createNewPrompt

    const [state, action] = useActionState(actionFunction, {
        success: false,
        message: ''
    })
    const queryClient = useQueryClient();

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [categories, setCategories] = useState<PromptCategory[]>([]);
    const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false)
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
    const [questions, setQuestions] = useState<Question[]>([
        { name: "question1", label: "Prompt", value: "" }
    ]);
    const [enableSpellCheck, setEnableSpellCheck] = useState<boolean>(false);


    const router = useRouter()

    // Reset state when navigating to the same page with different query params
    useEffect(() => {
        setEditingPrompt(null);
        setQuestions([{ name: "question1", label: "Prompt", value: "" }]);
    }, [existingPromptId]);

    useEffect(() => {
        const fetchClassrooms = async () => {
            if (teacherId) {
                // Create array of promises for parallel execution
                const promises = [
                    fetch(`/api/classrooms/ids?teacherId=${teacherId}`), // Fetch classroom IDs
                    fetch(`/api/prompt-categories?userId=${teacherId}`) // Fetch categories
                ];

                // Add prompt fetch if editing existing prompt
                if (existingPromptId) {
                    promises.push(fetch(`/api/prompts/${existingPromptId}?teacherId=${teacherId}`));
                }

                try {
                    const results = await Promise.all(promises);

                    // Process classroom data (first result)
                    const classroomResponse = results[0] as Response;
                    if (classroomResponse.ok) {
                        const { classrooms } = await classroomResponse.json();
                        setClassrooms(classrooms as Classroom[]);
                    }

                    // Process categories data (second result)
                    const categoryResponse = results[1] as Response;
                    if (categoryResponse.ok) {
                        const { categories: categoryData } = await categoryResponse.json();
                        setCategories(categoryData as PromptCategory[]);
                    }

                    // Process prompt data if it exists (third result, optional)
                    if (existingPromptId && results[2]) {
                        const promptResponse = results[2] as Response;
                        if (promptResponse.ok) {
                            const { prompt: promptData } = await promptResponse.json();
                            setQuestions([{ name: "question1", label: "Prompt", value: promptData.questions[0].question }]);
                            setEditingPrompt(promptData as Prompt);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }

                setIsLoaded(true);
            }
        };
        fetchClassrooms();
    }, [teacherId, existingPromptId]);

    // redirect if the state is success
    useEffect(() => {
        if (state?.success) {
            toast('Jot Saved!');
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === 'prompts' &&
                    query.queryKey[1] === teacherId,
            });
            router.push(callBackUrl as string);
        }
    }, [state, router, teacherId])

    const handleChange = (index: number, newValue: string) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q, i) => (i === index ? { ...q, value: newValue } : q))
        );
    };


    async function handleAddCategory(categoryName: string) {
        try {
            setIsAddingCategory(true)
            if (!categoryName) return
            const newCategory = await addPromptCategory(categoryName, teacherId) as PromptCategory
            setCategories(prev => [newCategory, ...prev])
            setNewCategoryName('')
        } catch (error) {
            console.error('error adding category ', error)
        } finally {
            setIsAddingCategory(false)
        }
    }

    const buttonText = existingPromptId ? 'Update Jot' : 'Create Jot'
    const buttonVerb = existingPromptId ? 'Updating...' : 'Creating...'

    const CreateButton = () => {
        const { pending } = useFormStatus();
        return <Button disabled={pending} type="submit" className="mx-auto mt-5">{pending ? buttonVerb : buttonText}</Button>;
    };

    if (!isLoaded) {
        return (
            <div className="min-h-full flex-center">
                <LoadingAnimation />
            </div>
        )
    }

    console.log("classrooms", classrooms)
    return (
        <form action={action} className="grid relative space-y-5">
            {questions.map((question, index) => (
                <Card key={question.name} className="shadow-sm hover:scale-[1.01] transition-transform duration-100">
                    <CardContent>
                        <Label htmlFor={question.name} className="text-md font-bold ml-1">
                            {question.label}
                        </Label>
                        <Textarea
                            id={question.name}
                            className="col-span-3 bg-background mt-1 resize-none shadow-none"
                            name={question.name}
                            value={question.value} // Keep text state for deletion
                            onChange={(e) => handleChange(index, e.target.value)}
                            required
                            autoFocus
                            rows={5}
                        />
                    </CardContent>
                </Card>
            ))}

            {/* Associate with a category*/}
            <CategorySection
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleAddCategory={handleAddCategory}
                setCategories={setCategories}
                categories={categories}
                editingPrompt={editingPrompt as Prompt}
                isAddingCategory={isAddingCategory}
                teacherId={teacherId}
            />

            {/* Assign to a classroom */}
            <Card className="shadow-sm hover:scale-[1.01] transition-transform duration-100">
                <CardContent>
                    <p className="text-md font-bold">Assign <span className="text-sm font-normal">(optional)</span></p>
                    <div className="space-y-3 mt-5">
                        {/* <Separator /> */}
                        {classrooms?.length > 0 && (
                            <>
                                {classrooms.map((classroom: Classroom) => (
                                    <div key={`classroom-assign-${classroom.id}`} className="flex items-center space-x-2">
                                        <Checkbox id={`classroom-assign-${classroom.id}`} value={classroom.id} name={`classroom-assign-${classroom.id}`} />
                                        <label
                                            htmlFor={`classroom-assign-${classroom.id}`}
                                            className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {classroom.name}
                                        </label>
                                    </div>
                                ))}
                            </>
                        )}
                        <div className="flex items-center space-x-2">
                            <Switch
                                onCheckedChange={(e) => setIsPublic(e)}
                                checked={isPublic}
                            />
                            <Label
                                className="text-md ml-2"
                            >
                                Public
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CiCircleQuestion size={20} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Responses are visible to everyone</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <input
                                type='hidden'
                                readOnly
                                name='is-public'
                                id='is-public'
                                value={isPublic.toString()}
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>
            {/* this is making spell check enabled */}
            <div>
                <div className="flex items-center justify-center space-x-2 my-2">
                    <Switch
                        onCheckedChange={(e) => setEnableSpellCheck(e)}
                        checked={enableSpellCheck}
                    />
                    <Label
                        className="text-md ml-2"
                    >
                        Enable Spell Check
                    </Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CiCircleQuestion size={20} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Student text editor will spell check</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <input
                        type='hidden'
                        readOnly
                        name='enable-spellcheck'
                        id='enable-spellcheck'
                        value={enableSpellCheck.toString()}
                    />
                </div>
                {state && !state.success && (
                    <p className="text-center text-destructive">{state.message}</p>
                )}
                <div className="flex-center">
                    <CreateButton />
                </div>
            </div>
            <input
                type="hidden"
                name="teacherId"
                defaultValue={teacherId}
            />
            <input
                id="title"
                value={questions[0].value}
                name="title"
                required
                hidden
                readOnly
            />
            <input
                id="prompt-type"
                defaultValue='BLOG'
                name="prompt-type"
                required
                hidden
            />
            {existingPromptId &&
                <input
                    id="promptId"
                    defaultValue={existingPromptId}
                    name="promptId"
                    required
                    hidden
                />
            }
        </form>
    )
}
