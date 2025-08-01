'use client'
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader, TableCaption } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Rubric } from '@/types'

export default function RubricInstance({ rubric }: { rubric: Rubric }) {

    const [selectedScores, setSelectedScores] = useState<number[]>(
        rubric.categories.map(() => -1) // Initialize with -1 for each category
    )

    const handleClick = (catIdx: number, scoreIdx: number) => {
        const updated = [...selectedScores]
        updated[catIdx] = scoreIdx
        setSelectedScores(updated)
    }

    // Get the score levels from the first category's criteria length
    const scoreLevels = rubric.categories[0]?.criteria.map((_, idx) => (idx + 1).toString()) || []

    return (
        <div className="mt-4">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            {[...scoreLevels].reverse().map((level) => (
                                <TableHead key={level} className="text-center">
                                    <span className="text-xl font-bold">{level}</span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rubric.categories.map((category, catIdx) => (
                            <TableRow key={catIdx}>
                                {/* Category Name with Selected Score */}
                                <TableCell className="w-60 relative">
                                    <div className="p-4 rounded-md min-h-[100px] flex items-center">
                                        <div>
                                            <div className="font-semibold text-lg">{category.name}</div>
                                            {selectedScores[catIdx] >= 0 && (
                                                <p className="absolute top-0 right-0 text-accent mt-2 font-bold">{category.criteria[selectedScores[catIdx]].score}/{category.criteria.length}</p>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Criteria Buttons (in reverse order to match template) */}
                                {[...category.criteria].reverse().map((criterion, revIdx) => {
                                    const realIdx = category.criteria.length - 1 - revIdx
                                    const isSelected = selectedScores[catIdx] === realIdx
                                    return (
                                        <TableCell key={realIdx}>
                                            <button
                                                onClick={() => handleClick(catIdx, realIdx)}
                                                className={cn(
                                                    'w-full p-4 rounded-md transition-all duration-200 ease-in-out',
                                                    'text-left border shadow-sm min-h-[100px]',
                                                    'focus:outline-none focus:ring-2 focus:ring-accent/50',
                                                    isSelected
                                                        ? 'border-accent border-4 bg-accent/10 scale-[0.98] shadow-inner'
                                                        : 'border-4 border-transparent hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] active:translate-y-0 text-muted-foreground'
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
