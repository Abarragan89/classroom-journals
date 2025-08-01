'use client'
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader, TableCaption } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Rubric, RubricGradingInstance, RubricGrade } from '@/types'
import { Button } from '@/components/ui/button'

interface RubricInstanceProps {
    rubric: Rubric;
    responseId?: string;
    existingGrade?: RubricGrade; // Add this to accept saved grades
    onGradeChange?: (grade: RubricGrade) => void;
    onSave?: (grade: RubricGrade) => void;
}

export default function RubricInstance({
    rubric,
    responseId,
    existingGrade,
    onGradeChange,
    onSave
}: RubricInstanceProps) {

    const [gradingInstance, setGradingInstance] = useState<RubricGradingInstance>(() => {
        // If we have an existing grade, initialize with those scores
        if (existingGrade) {
            return {
                id: rubric.id,
                title: rubric.title,
                categories: rubric.categories.map((cat, catIdx) => {
                    // Find the corresponding saved category score
                    const savedCategory = existingGrade.categories.find(saved => saved.name === cat.name);
                    let selectedScore: number | undefined = undefined;

                    if (savedCategory) {
                        // Find which criterion index matches the saved score
                        selectedScore = cat.criteria.findIndex(criterion =>
                            criterion.score === savedCategory.selectedScore
                        );
                        if (selectedScore === -1) selectedScore = undefined;
                    }

                    return {
                        ...cat,
                        selectedScore
                    };
                })
            };
        }

        // Default initialization for new grades
        return {
            id: rubric.id,
            title: rubric.title,
            categories: rubric.categories.map(cat => ({
                ...cat,
                selectedScore: undefined
            }))
        };
    }); console.log('Initial Grading Instance:', gradingInstance)

    const handleClick = (catIdx: number, scoreIdx: number) => {
        const updatedInstance = {
            ...gradingInstance,
            categories: gradingInstance.categories.map((cat, idx) =>
                idx === catIdx
                    ? { ...cat, selectedScore: scoreIdx }
                    : cat
            )
        }
        setGradingInstance(updatedInstance)

        // Calculate and notify about grade changes
        if (onGradeChange) {
            const grade = calculateGrade(updatedInstance)
            onGradeChange(grade)
        }
    }

    const calculateGrade = (instance: RubricGradingInstance): RubricGrade => {
        const categories = instance.categories.map(cat => ({
            name: cat.name,
            selectedScore: cat.selectedScore !== undefined ? cat.criteria[cat.selectedScore].score : 0,
            maxScore: Math.max(...cat.criteria.map(c => c.score))
        }))

        const totalScore = categories.reduce((sum, cat) => sum + cat.selectedScore, 0)
        const maxTotalScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0)

        return {
            rubricId: instance.id,
            responseId: responseId || '',
            categories,
            totalScore,
            maxTotalScore
        }
    }

    const handleSave = () => {
        if (onSave) {
            const grade = calculateGrade(gradingInstance)
            onSave(grade)
        }
    }

    // Get the score levels from the first category's criteria length
    const scoreLevels = rubric.categories[0]?.criteria.map((_, idx) => (idx + 1).toString()) || []
    const currentGrade = calculateGrade(gradingInstance)
    const isComplete = gradingInstance.categories.every(cat => cat.selectedScore !== undefined)

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold">{gradingInstance.title}</h3>
                    {isComplete && (
                        <p className="text-accent font-semibold">
                            Total Score: {currentGrade.totalScore}/{currentGrade.maxTotalScore}
                            ({Math.round((currentGrade.totalScore / currentGrade.maxTotalScore) * 100)}%)
                        </p>
                    )}
                </div>
                {onSave && isComplete && (
                    <Button onClick={handleSave} className="ml-4">
                        {existingGrade ? 'Update Grade' : 'Save Grade'}
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table className="min-w-[920px]">
                    <TableCaption>Grade using this rubric by selecting criteria for each category.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            {[...scoreLevels].reverse().map((level) => (
                                <TableHead key={level} className="text-center">
                                    <span className="text-xl">{level}</span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {gradingInstance.categories.map((category, catIdx) => (
                            <TableRow key={catIdx}>
                                {/* Category Name with Selected Score */}
                                <TableCell className="w-60 relative">
                                    <div className="p-4 rounded-md min-h-[100px] flex items-center">
                                        <div>
                                            <div className="font-semibold text-lg">{category.name}</div>
                                            {category.selectedScore !== undefined && (
                                                <div className="absolute top-0 left-2 text-accent text-lg mt-2 font-bold">
                                                    {category.criteria[category.selectedScore].score}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Criteria Buttons (in reverse order to match template) */}
                                {[...category.criteria].reverse().map((criterion, revIdx) => {
                                    const realIdx = category.criteria.length - 1 - revIdx
                                    const isSelected = category.selectedScore === realIdx
                                    return (
                                        <TableCell key={realIdx}>
                                            <button
                                                onClick={() => handleClick(catIdx, realIdx)}
                                                className={cn(
                                                    'w-full p-4 rounded-md transition-all duration-200 ease-in-out',
                                                    'text-left border-4 shadow-sm min-h-[100px]',
                                                    'focus:outline-none',
                                                    isSelected
                                                        ? 'border-accent bg-accent/10 scale-[0.98]'
                                                        : 'border-border hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] active:translate-y-0'
                                                )}
                                            >
                                                <div className="text-sm leading-relaxed">
                                                    {criterion.description}
                                                </div>
                                            </button>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
