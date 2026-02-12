'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"
import { createNewPrompt, updateAPrompt } from "@/lib/actions/prompt.actions";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { Classroom, Prompt, PromptCategory } from "@/types";
import { addPromptCategory } from "@/lib/actions/prompt.categories";
import CategorySection from "../single-prompt-form/category-section";
import UpgradeAccountBtn from "@/components/buttons/upgrade-account-btn";
import { Switch } from "@/components/ui/switch";
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


export default function MultiPromptForm({
    teacherId,
}: {
    teacherId: string,
}) {

    const searchParams = useSearchParams()
    const existingPromptId = searchParams.get('edit')

    const actionFunction = existingPromptId ? updateAPrompt : createNewPrompt

    const [state, action] = useActionState(actionFunction, {
        success: false,
        message: ''
    })
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false)
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [categories, setCategories] = useState<PromptCategory[]>([]);
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [isTeacherPremium, setIsTeacherPremium] = useState<boolean>(false);
    const [enableSpellCheck, setEnableSpellCheck] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const [questions, setQuestions] = useState<Question[]>([
        { name: "question1", label: "Question 1", value: "" }
    ]);

    const router = useRouter()

    // Reset state when navigating to the same page with different query params
    useEffect(() => {
        setEditingPrompt(null);
        setQuestions([{ name: "question1", label: "Question 1", value: "" }]);
    }, [existingPromptId]);

    useEffect(() => {
        const fetchClassrooms = async () => {
            if (teacherId) {
                // Create array of promises for parallel execution
                const promises = [
                    fetch(`/api/classrooms/ids?teacherId=${teacherId}`), // Fetch classroom IDs
                    fetch(`/api/prompt-categories?userId=${teacherId}`),
                    fetch(`/api/profile/subscription-allowance?teacherId=${teacherId}`)
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
                        const { classrooms: classroomData } = await classroomResponse.json();
                        setClassrooms(classroomData as Classroom[]);
                    }                    // Process categories data (second result)
                    const categoryResponse = results[1] as Response;
                    if (categoryResponse.ok) {
                        const { categories: categoryData } = await categoryResponse.json();
                        setCategories(categoryData as PromptCategory[]);
                    }

                    // Process subscription data (third result)
                    const subscriptionResponse = results[2] as Response;
                    if (subscriptionResponse.ok) {
                        const { subscriptionData } = await subscriptionResponse.json();
                        setIsTeacherPremium(subscriptionData.isSubscriptionActive as boolean);
                    }

                    // Process prompt data if it exists (fourth result, optional)
                    if (existingPromptId && results[3]) {
                        const promptResponse = results[3] as Response;
                        if (promptResponse.ok) {
                            const { prompt: promptData } = await promptResponse.json();
                            setQuestions(promptData.questions.map((q: { question: string }, index: number) => ({
                                name: `question${index + 1}`,
                                label: `Question ${index + 1}`,
                                value: q.question || "", // Ensure there's always a value
                            })));
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
            toast('Jot Added!');
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === 'prompts' &&
                    query.queryKey[1] === teacherId,
            });
            router.push('/prompt-library');
        }
    }, [state, router, queryClient, teacherId])

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

    const buttonText = existingPromptId ? 'Update Jot' : 'Create Jot'
    const buttonVerb = existingPromptId ? 'Updating...' : 'Creating...'

    const CreateButton = () => {
        const { pending } = useFormStatus();
        return <Button size={"lg"} disabled={pending} type="submit" className="mx-auto my-5 shadow-md">{pending ? buttonVerb : buttonText}</Button>;
    };

    if (!isLoaded) {
        return (
            <div className="min-h-full flex-center">
                <LoadingAnimation />
            </div>
        )
    }

    return (
        <form action={action} className="grid relative">
            {!isTeacherPremium &&
                <div className="mb-5">
                    <UpgradeAccountBtn
                        teacherId={teacherId}
                    />
                </div>
            }
            <div className="space-y-7">
                {/* Prompt Title */}
                <Card className="mb-8 mt-5 shadow-sm hover:scale-[1.01] transition-transform duration-100">
                    <CardContent>
                        <Label htmlFor="title" className="text-md font-bold ml-1">
                            Title
                        </Label>
                        <Input
                            id="title"
                            className="mt-1 bg-background shadow-none"
                            name="title"
                            autoFocus
                            required
                            defaultValue={editingPrompt?.title || ''}
                        />
                    </CardContent>
                </Card>
                {/* Questions Section */}
                <Card className="shadow-sm hover:scale-[1.01] transition-transform duration-100">
                    <CardContent>
                        {questions.map((question, index) => (
                            <div key={question.name}>
                                <div className="mt-4">
                                    <div className="flex-between">
                                        <Label htmlFor={question.name} className="text-right text-md font-bold ml-1">
                                            {question.label}
                                        </Label>
                                        {questions.length > 1 ?
                                            <p
                                                onClick={() => handleRemoveQuestion(index)}
                                                className="hover:cursor-pointer hover:underline p-1 pt-2 text-[.875rem] text-destructive w-fit leading-none">
                                                <X size={18} />
                                            </p>
                                            :
                                            <p className="opacity-0"><X /></p>
                                        }
                                    </div>
                                    <Textarea
                                        id={question.name}
                                        className="mt-1  bg-background shadow-none"
                                        name={question.name}
                                        value={question.value} // Keep text state for deletion
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        required
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            onClick={() => handleAddQuestion()}
                            className="flex-center block w-fit mx-auto mt-5 "
                        >
                            <>
                                <Plus />Add question
                            </>
                        </Button>
                    </CardContent>
                </Card>

                {/* Associate with a category*/}
                <CategorySection
                    newCategoryName={newCategoryName}
                    setCategories={setCategories}
                    setNewCategoryName={setNewCategoryName}
                    handleAddCategory={handleAddCategory}
                    categories={categories}
                    editingPrompt={editingPrompt as Prompt}
                    isAddingCategory={isAddingCategory}
                    teacherId={teacherId}
                />

                {/* Assign to a classroom */}
                <Card className="shadow-sm hover:scale-[1.01] transition-transform duration-100">
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {classrooms?.length > 0 && (
                                <>
                                    <p className="text-md font-bold">Assign to Classes <span className="text-sm font-normal">(optional)</span></p>
                                    {classrooms.map((classroom: Classroom) => (
                                        <div key={`classroom-assign-${classroom.id}`} className="flex items-center space-x-3 ml-1">
                                            <Checkbox id={`classroom-assign-${classroom.id}`} value={classroom.id} name={`classroom-assign-${classroom.id}`} />
                                            <label
                                                htmlFor={`classroom-assign-${classroom.id}`}
                                                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {classroom.name}
                                            </label>
                                            <span className={`text-xs font-normal ${classroom._count?.users === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                ({classroom._count?.users || 0} {classroom._count?.users === 1 ? 'student' : 'students'})
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:scale-[1.01] transition-transform duration-100">
                    <CardContent className="space-y-4">
                        <p className="text-md font-bold">Other Options</p>
                        <div className="space-y-3">
                            {/* this is making spell check enabled */}
                            <div className="flex items-center space-x-2 mt-4">
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
                        </div>
                    </CardContent>
                </Card>
            </div>

            <input
                type="hidden"
                name="teacherId"
                value={teacherId}
            />
            <input
                id="prompt-type"
                defaultValue='ASSESSMENT'
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

            {state && !state.success && (
                <p className="text-center text-destructive">{state.message}</p>
            )}
            {/* <Separator className="mt-10 mb-3" /> */}
            <div className="my-5 flex-center">
                <CreateButton />
            </div>
        </form>
    )
}
