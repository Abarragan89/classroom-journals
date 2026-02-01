"use client"
import {
    useForm,
    useFieldArray,
    Controller
} from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
} from "@/components/ui/table"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { createRubric, deleteRubric, updateRubric } from "@/lib/actions/rubric.actions"
import { rubricSchema } from "@/lib/validators"
import { Rubric, RubricFormData } from "@/types"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { OctagonX } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CreateEditRubric({
    teacherId,
    currentRubric,
    classId,
}: {
    teacherId: string
    currentRubric: Rubric | null
    classId: string
}) {

    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [scoreLevels, setScoreLevels] = useState(["1", "2", "3", "4"])
    const queryClient = useQueryClient();
    const router = useRouter();

    const initialCategories = [
        {
            name: "Introduction",
            criteria: [
                { score: 1, description: "No clear introduction or topic is unclear" },
                { score: 2, description: "Attempts to introduce the topic but lacks clarity or context" },
                { score: 3, description: "Introduces the topic clearly but lacks strong engagement" },
                { score: 4, description: "Engaging and clearly introduces the topic with strong context" },
            ]
        },
        {
            name: "Body",
            criteria: [
                { score: 1, description: "Ideas are unclear, disorganized, or lack support" },
                { score: 2, description: "Ideas are somewhat underdeveloped or poorly organized" },
                { score: 3, description: "Ideas are mostly developed and organized with some supporting evidence" },
                { score: 4, description: "Well-developed ideas supported with detailed evidence and logical organization" },
            ]
        },
        {
            name: "Conclusion",
            criteria: [
                { score: 1, description: "Conclusion is missing or does not summarize the main points" },
                { score: 2, description: "Conclusion is present but weak or disconnected from the body" },
                { score: 3, description: "Conclusion summarizes the points but lacks impact or clarity" },
                { score: 4, description: "Clear and relevant conclusion that summarizes key points" },
            ]
        }
    ];


    const form = useForm<RubricFormData>({
        resolver: zodResolver(rubricSchema),
        defaultValues: {
            categories: currentRubric?.categories ?? initialCategories,
            title: currentRubric?.title ?? ""
        }
    })

    useEffect(() => {
        if (currentRubric) {
            form.reset({
                categories: currentRubric?.categories,
                title: currentRubric?.title
            })

            setScoreLevels(Array.from({ length: currentRubric.categories[0]?.criteria.length }, (_, i) => String(i + 1)))
        }
    }, [currentRubric, form])

    const {
        fields: categoryFields,
        append: appendCategory,
        remove: removeCategory,
        update: updateCategory
    } = useFieldArray({
        control: form.control,
        name: "categories"
    })

    const addCategory = () => {
        appendCategory({
            name: `Category ${categoryFields.length + 1}`,
            criteria: Array.from({ length: scoreLevels.length }, (_, i) => ({
                description: "",
                score: i + 1,
            })),
        })
    }
    const addScoreLevel = () => {
        const newScore = scoreLevels.length + 1
        setScoreLevels(prev => [...prev, newScore.toString()])

        // Update all categories with a new criterion object
        categoryFields.forEach((cat, idx) => {
            const updatedCriteria = [
                ...cat.criteria,
                { score: newScore, description: "" }
            ]
            updateCategory(idx, { ...cat, criteria: updatedCriteria })
        })
    }


    const deleteScoreLevel = (scoreIdx: number) => {
        const updatedLevels = scoreLevels.filter((_, i) => i !== scoreIdx).map((_, i) => (i + 1).toString())
        setScoreLevels(updatedLevels)

        categoryFields.forEach((cat, idx) => {
            const updatedCriteria = cat.criteria.filter((_, i) => i !== scoreIdx)
            updateCategory(idx, { ...cat, criteria: updatedCriteria })
        })
    }

    const onSubmit = async (data: RubricFormData) => {
        try {
            // If currentRubric is provided, update it; otherwise, create a new one
            if (currentRubric) {
                const result = await updateRubric(currentRubric.id, data.categories, data.title);
                if (result?.rubric) {
                    queryClient.setQueryData<Rubric[]>(['rubrics', teacherId], (old) => {
                        if (!old) return old;
                        return old.map(rubricItem =>
                            rubricItem.id === result.rubric.id ? result.rubric as Rubric : rubricItem
                        );
                    });
                }
            } else {
                const result = await createRubric(teacherId, data.categories, data.title);
                if (result?.rubric) {
                    queryClient.setQueryData<Rubric[]>(['rubrics', teacherId], (old) => {
                        if (!old) return [result.rubric as Rubric];
                        return [...old, result.rubric as Rubric];
                    });
                }
            }
            // Navigate `/classroom/${classId}/${teacherId}/my-rubrics`
            toast.success('Rubric saved successfully', {
                action: {
                    label: 'Back to Rubric List',
                    onClick: () => router.back()
                },
                actionButtonStyle: {
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    border: "var(--border)"
                }
            });
        } catch (error) {
            console.error('Error creating rubric:', error);
            return {
                success: false, message: 'Error creating rubric. Please try again.'
            }
        }
    }
    // handle delete rubric
    const handleDeleteRubric = async () => {
        if (!currentRubric) return;

        try {
            await deleteRubric(currentRubric.id)
            queryClient.setQueryData<Rubric[]>(['rubrics', teacherId], (old) => {
                if (!old) return old;
                return old.filter(rubricItem => rubricItem.id !== currentRubric.id);
            });
            toast.success('Rubric deleted successfully');
            router.push(`/classroom/${classId}/${teacherId}/my-rubrics`);
        } catch (error) {
            console.error('Error deleting rubric:', error);
            toast.error('Error deleting rubric. Please try again.');
        }
    }

    return (
        <>
            {/* Dialog to confirm rubric deletion */}
            <ResponsiveDialog
                isOpen={showConfirmDelete}
                setIsOpen={setShowConfirmDelete}
                title="Confirm Delete"
            >
                <p className="mx-4">Are you sure you want to delete this rubric? This action cannot be undone.</p>
                <div className="flex gap-5 justify-center mt-4">
                    <Button
                        onClick={() => setShowConfirmDelete(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            handleDeleteRubric();
                            setShowConfirmDelete(false);
                        }}
                    >
                        Delete Rubric
                    </Button>
                </div>
            </ResponsiveDialog>


            <div className="mt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex justify-start items-center gap-x-5">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter rubric name"
                                                required={true}
                                                className="min-w-[275px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="overflow-x-auto">
                            <div className="flex flex-wrap gap-4 my-5">
                                <Button type="submit">Save Rubric</Button>
                                {/* Button to delete rubric */}
                                {currentRubric && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => setShowConfirmDelete(true)}
                                    >
                                        Delete Rubric
                                    </Button>
                                )}
                            </div>
                            <div className="border rounded-md shadow-lg mt-3 relative">
                                <div className="flex flex-wrap gap-x-8 my-5 text-sm text-primary absolute -top-1 left-3 z-10">
                                    <Button type="button" variant="secondary" onClick={addCategory} className="gap-x-1"><PlusCircle size={17} /> Category</Button>
                                    <Button type="button" variant="secondary" onClick={addScoreLevel} className="gap-x-1"><PlusCircle size={17} /> Score</Button>
                                </div>
                                <Table className="min-w-[920px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                            </TableHead>
                                            {[...scoreLevels].reverse().map((level, idx) => {
                                                const realIdx = scoreLevels.length - 1 - idx
                                                return (
                                                    <TableHead key={level} className="relative min-h-[48px]">
                                                        <div className="flex items-center justify-center gap-1 py-4 ">
                                                            <span className="text-2xl font-bold text-foreground">{level}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteScoreLevel(realIdx)}
                                                                className="text-destructive"
                                                                title="Delete column"
                                                            >
                                                                <OctagonX size={14} />
                                                            </button>
                                                        </div>
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {categoryFields.map((category, catIdx) => (
                                            <TableRow key={category.id}>
                                                {/* Category Name */}
                                                <TableCell className="w-60 flex justify-between">

                                                    <Controller
                                                        control={form.control}
                                                        name={`categories.${catIdx}.name`}
                                                        render={({ field }) => (
                                                            <Textarea
                                                                {...field}
                                                                rows={3}
                                                                className="resize-none font-bold md:text-lg shadow-none"
                                                                placeholder="Criteria"
                                                                required={true}
                                                            />
                                                        )}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCategory(catIdx)}
                                                        className="text-destructive ml-3"
                                                        title="Delete row"
                                                    >
                                                        <OctagonX size={16} />
                                                    </button>
                                                </TableCell>

                                                {/* Criteria By Score */}
                                                {[...scoreLevels].reverse().map((_, revIdx) => {
                                                    const realIdx = scoreLevels.length - 1 - revIdx
                                                    return (
                                                        <TableCell key={realIdx}>
                                                            <Controller
                                                                control={form.control}
                                                                name={`categories.${catIdx}.criteria.${realIdx}.description`}
                                                                render={({ field }) => (
                                                                    <Textarea
                                                                        {...field}
                                                                        rows={4}
                                                                        className="resize-none shadow-none"
                                                                        required={false}
                                                                        placeholder="Criteria"
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}
