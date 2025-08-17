'use client';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"
import { createNewPrompt, getSinglePrompt, updateAPrompt } from "@/lib/actions/prompt.actions";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox"
import { getAllClassroomIds } from "@/lib/actions/classroom.actions";
import { Classroom, Prompt, PromptCategory } from "@/types";
import { addPromptCategory } from "@/lib/actions/prompt.categories";
import { getAllPromptCategories } from "@/lib/server/student-dashboard";
import CategorySection from "../single-prompt-form/category-section";
import { determineSubscriptionAllowance } from "@/lib/actions/profile.action";
import UpgradeAccountBtn from "@/components/buttons/upgrade-account-btn";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CiCircleQuestion } from "react-icons/ci";
import LoadingAnimation from "@/components/loading-animation";

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
                const data = await getAllClassroomIds(teacherId); // Fetch classroom IDs
                setClassrooms(data as Classroom[]);
                const categoryData = await getAllPromptCategories(teacherId) as PromptCategory[]
                setCategories(categoryData)
                const { isSubscriptionActive } = await determineSubscriptionAllowance(teacherId)
                setIsTeacherPremium(isSubscriptionActive as boolean)
                // Get existing prompt if in search params
                if (existingPromptId) {
                    const promptData = await getSinglePrompt(existingPromptId, teacherId) as unknown as Prompt
                    setQuestions(promptData.questions.map((q: { question: string }, index) => ({
                        name: `question${index + 1}`,
                        label: `Question ${index + 1}`,
                        value: q.question || "", // Ensure there's always a value
                    })));
                    setEditingPrompt(promptData)
                }
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
    }, [state, router])

    async function handleAddCategory(categoryName: string) {
        try {
            setIsAddingCategory(true)
            if (!categoryName) return
            const newCategory = await addPromptCategory(categoryName, teacherId) as PromptCategory
            setCategories(prev => [newCategory, ...prev])
            setNewCategoryName('')
        } catch (error) {
            console.log('error adding category ', error)
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
        return <Button disabled={pending} type="submit" className="mx-auto mt-5">{pending ? buttonVerb : buttonText}</Button>;
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
            <div className="mb-3">
                <Label htmlFor="title" className="text-right text-md font-bold">
                    Title
                </Label>
                <Input
                    id="title"
                    className="col-span-3"
                    name="title"
                    required
                    defaultValue={editingPrompt?.title || ''}
                />
            </div>
            {questions.map((question, index) => (
                <div key={question.name}>
                    <div className="mt-4">
                        <Label htmlFor={question.name} className="text-right text-md font-bold">
                            {question.label}
                        </Label>
                        <Textarea
                            id={question.name}
                            className="col-span-3"
                            name={question.name}
                            value={question.value} // Keep text state for deletion
                            onChange={(e) => handleChange(index, e.target.value)}
                            required
                            rows={3}
                        />
                    </div>
                    {questions.length > 1 ?
                        <p onClick={() => handleRemoveQuestion(index)} className="hover:cursor-pointer hover:underline p-1 pt-2 text-[.875rem] text-destructive w-fit leading-none">Delete</p>
                        :
                        <p className="opacity-0">Delete</p>
                    }
                </div>
            ))}

            <div className="relative">
                <Button asChild variant='link' className="w-fit p-0 absolute right-0 top-[0px]">
                    <p onClick={() => handleAddQuestion()} className="hover:cursor-pointer w-fit justify-end"><Plus />Add question</p>
                </Button>
            </div>

            <Separator className="mt-10 mb-5" />

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
            <div className="space-y-3 mt-5">
                {classrooms?.length > 0 && (
                    <>
                        <Separator />
                        <p className="text-md font-bold">Assign <span className="text-sm font-normal">(optional)</span></p>
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
            </div>
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
                            <p>Text editor will spell check</p>
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
