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
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

const rubricSchema = z.object({
    categories: z.array(
        z.object({
            name: z.string().min(1, "Required"),
            criteriaByScore: z.array(z.string())
        })
    ),
    rubricName: z.string().min(1, "Rubric name is required")
})

type RubricFormData = z.infer<typeof rubricSchema>

export default function MyRubricSection() {
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
            rubricName: ""
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

    const onSubmit = (data: RubricFormData) => {
        const payload = {
            categories: data.categories.map(cat => ({
                name: cat.name,
                criteria: cat.criteriaByScore.reverse().map((criteria, i, arr) => ({
                    criteria,
                    score: arr.length - i
                }))
            }))
        };
        console.log("Rubric submitted:", payload)
    }

    return (
        <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl mb-4">Rubric Builder</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="rubricName"
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
