"use client"

import {
    useForm,
    useFieldArray,
    Controller
} from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    Table,
    TableCaption,
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
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { createRubric } from "@/lib/actions/rubric.actions"
import { rubricSchema } from "@/lib/validators"

type RubricFormData = z.infer<typeof rubricSchema>

export default function CreateEditRubric({ teacherId }: { teacherId: string }) {
    const [scoreLevels, setScoreLevels] = useState(["1", "2", "3", "4"])

    const form = useForm<RubricFormData>({
        resolver: zodResolver(rubricSchema),
        defaultValues: {
            categories: [
                {
                    name: "Category 1",
                    criteriaByScore: ["", "", "", ""]
                }
            ],
            title: ""
        }
    })

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
            criteriaByScore: Array(scoreLevels.length).fill("")
        })
    }

    const addScoreLevel = () => {
        const newLevel = (scoreLevels.length + 1).toString()
        setScoreLevels(prev => [...prev, newLevel])

        // Update all categories with a new empty criterion
        categoryFields.forEach((cat, idx) => {
            const updatedCriteria = [...cat.criteriaByScore, ""]
            updateCategory(idx, { ...cat, criteriaByScore: updatedCriteria })
        })
    }

    const deleteScoreLevel = (scoreIdx: number) => {
        const updatedLevels = scoreLevels.filter((_, i) => i !== scoreIdx).map((_, i) => (i + 1).toString())
        setScoreLevels(updatedLevels)

        categoryFields.forEach((cat, idx) => {
            const updatedCriteria = cat.criteriaByScore.filter((_, i) => i !== scoreIdx)
            updateCategory(idx, { ...cat, criteriaByScore: updatedCriteria })
        })
    }

    const onSubmit = async (data: RubricFormData) => {
        // Transform categories to have scores and criteria in the expected format
        const { categories } = {
            categories: data.categories.map(cat => ({
                name: cat.name,
                criteria: cat.criteriaByScore.reverse().map((criteria, i, arr) => ({
                    criteria,
                    score: arr.length - i
                }))
            }))
        };

        // Call the createRubric action
        try {
            await createRubric(teacherId, categories, data.title)
            form.reset()
        } catch (error) {
            console.error('Error creating rubric:', error);
            return {
                success: false, message: 'Error creating rubric. Please try again.'

            }
        }
    }

    return (
        <div className="mt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="my-4">
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Rubric Name"
                                        required={true}
                                        className="w-1/2"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="overflow-x-auto">
                        <Table className="min-w-[920px]">
                            <TableCaption>Create and customize your grading rubric.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    {[...scoreLevels].reverse().map((level, idx) => {
                                        const realIdx = scoreLevels.length - 1 - idx
                                        return (
                                            <TableHead key={level} className="relative">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xl">{level}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteScoreLevel(realIdx)}
                                                        className="text-destructive"
                                                        title="Delete column"
                                                    >
                                                        <Trash2 size={16} />
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
                                                        rows={4}
                                                        className="resize-none"
                                                        placeholder="Criteria"
                                                    />
                                                )}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(catIdx)}
                                                className="text-destructive ml-3"
                                                title="Delete row"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </TableCell>

                                        {/* Criteria By Score */}
                                        {[...scoreLevels].reverse().map((_, revIdx) => {
                                            const realIdx = scoreLevels.length - 1 - revIdx
                                            return (
                                                <TableCell key={realIdx}>
                                                    <Controller
                                                        control={form.control}
                                                        name={`categories.${catIdx}.criteriaByScore.${realIdx}`}
                                                        render={({ field }) => (
                                                            <Textarea
                                                                {...field}
                                                                rows={4}
                                                                className="resize-none"
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

                    <div className="flex gap-4 mt-6">
                        <Button type="button" onClick={addCategory}>Add Category</Button>
                        <Button type="button" onClick={addScoreLevel}>Add Score Level</Button>
                        <Button type="submit" variant="secondary">Submit Rubric</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
