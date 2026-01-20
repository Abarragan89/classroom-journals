'use client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState } from 'react'
import { formatDateLong } from '@/lib/utils'
import { X } from 'lucide-react'
import { RubricGradeDisplay } from '@/types'

interface RubricDisplayProps {
    rubricGrade: RubricGradeDisplay;
    studentName?: string;
    isPrintView?: boolean;
}

export default function RubricDisplay({ rubricGrade, studentName, isPrintView = false }: RubricDisplayProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Parse the JSON data
    const rubricCategories = rubricGrade.rubric.categories as Array<{
        name: string;
        criteria: Array<{ description: string; score: number }>;
    }>

    const gradeCategories = rubricGrade.categories as Array<{
        name: string;
        selectedScore: number;
        maxScore: number;
    }>

    // Get the score levels from the first category
    const scoreLevels = rubricCategories[0]?.criteria.map(c => c.score).sort((a, b) => b - a) || []

    return (
        <>
            {!isPrintView && (
                <Button
                    variant={"link"}
                    onClick={() => setIsOpen(true)}
                >
                    See Rubric
                </Button>
            )}

            {/* Print View - Direct Content */}
            {isPrintView && (
                <div className="w-full text-black bg-white" style={{ margin: 'auto', padding: 0, width: '95%' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                        {/* Header for Print */}
                        <h2 className="font-semibold text-black my-0 text-center">
                            {rubricGrade.rubric.title}
                        </h2>

                        {/* Grade Summary */}
                        <div className='flex justify-between mx-1 mb-2' style={{ fontSize: '12px' }}>
                            <p className='m-0 text-black'>Name:<span className='underline mx-1 text-black'>{studentName}</span></p>
                            <p className='text-black'>Grade:
                                <span className='font-bold ml-1 text-black'>
                                    {rubricGrade.percentageScore}% <span className='font-bold text-xs text-black'>({rubricGrade.totalScore} / {rubricGrade.maxTotalScore})</span>
                                </span>
                            </p>
                        </div>

                        {/* Rubric Table */}
                        <div className="w-full" style={{ margin: 0, padding: 0 }}>
                            <Table
                                className='w-full border-collapse'
                            >
                                <TableHeader>
                                    <TableRow className="border-b border-black">
                                        <TableHead className="w-32 border-r border-black text-black text-xs p-1">Category</TableHead>
                                        {scoreLevels.map(level => (
                                            <TableHead key={level} className="text-center border-r border-black last:border-r-0 text-black text-xs p-1">
                                                {level} {level === 1 ? 'Point' : 'Points'}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rubricCategories.map((category, catIdx) => {
                                        const gradeCategory = gradeCategories.find(gc => gc.name === category.name)

                                        return (
                                            <TableRow key={catIdx} className="border-b border-black">
                                                <TableCell className="font-medium align-top border-r border-black text-black text-xs p-1" style={{ pageBreakInside: 'avoid', wordWrap: 'break-word' }}>
                                                    {category.name}
                                                </TableCell>
                                                {scoreLevels.map(level => {
                                                    const criterion = category.criteria.find(c => c.score === level)
                                                    const isSelected = gradeCategory?.selectedScore === level

                                                    return (
                                                        <TableCell
                                                            key={level}
                                                            className={`align-top text-xs border-r border-black last:border-r-0 m-0 p-1 text-black ${isSelected
                                                                ? 'border-4 border-black rounded-md'
                                                                : ''
                                                                }`}
                                                            style={isSelected ?
                                                                { backgroundColor: '#d1d5db', pageBreakInside: 'avoid', wordWrap: 'break-word', hyphens: 'auto' } :
                                                                { pageBreakInside: 'avoid', wordWrap: 'break-word', hyphens: 'auto' }
                                                            }
                                                        >
                                                            {criterion?.description || ''}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        )
                                    })}
                                    {/* Teacher Comments Row */}
                                    <TableRow style={{ pageBreakInside: 'avoid' }}>
                                        <TableCell
                                            colSpan={scoreLevels.length + 1}
                                            className="font-medium  border-t border-black"
                                            style={{ pageBreakInside: 'avoid' }}
                                        >
                                            <div className="p-1">
                                                <p className="font-semibold mb-1 text-black text-xs">Teacher Comments:</p>
                                                <p className={`whitespace-pre-line text-black text-xs ${!rubricGrade.comment ? 'italic' : ''}`} style={{ wordWrap: 'break-word' }}>
                                                    {rubricGrade.comment || 'No comments...'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal View - Existing Logic */}
            {!isPrintView && isOpen && (
                <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-background border rounded-lg shadow-lg w-[95vw] h-[95vh] max-w-5xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {`Grading Results`}
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-auto p-6">
                            <div>
                                {/* Student Name and Date */}
                                <div className='flex justify-between mx-1 mb-5'>
                                    <p className='m-0'>Name:<span className='underline mx-1'>{studentName}</span></p>

                                    <p>Date: <span className=' mx-1 underline'>{formatDateLong(rubricGrade.gradedAt, 'long')}</span></p>
                                </div>

                                {/* Grade Summary */}
                                <div className='flex justify-between mx-1 mb-0'>
                                    <p className='text-center mt-0'>Assignment: <span>{rubricGrade.rubric.title}</span> </p>
                                    <p>Grade:
                                        <span className={`font-bold ml-1 ${rubricGrade.percentageScore >= 85 ? 'text-success' :
                                            rubricGrade.percentageScore >= 70 ? 'text-warning' :
                                                'text-destructive'
                                            }`}>
                                            {rubricGrade.percentageScore}% <span className='font-bold text-sm'>({rubricGrade.totalScore} / {rubricGrade.maxTotalScore})</span>
                                        </span>
                                    </p>
                                </div>
                                {/* Rubric Table */}
                                <div className="overflow-auto broder rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="">
                                                <TableHead className="w-48 min-w-48 border-r">Category</TableHead>
                                                {scoreLevels.map(level => (
                                                    <TableHead key={level} className="text-center min-w-32 border-r last:border-r-0">
                                                        {level} {level === 1 ? 'Point' : 'Points'}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rubricCategories.map((category, catIdx) => {
                                                const gradeCategory = gradeCategories.find(gc => gc.name === category.name)

                                                return (
                                                    <TableRow key={catIdx} className="border-b">
                                                        <TableCell className="font-medium align-top border-r">
                                                            {category.name}
                                                        </TableCell>
                                                        {scoreLevels.map(level => {
                                                            const criterion = category.criteria.find(c => c.score === level)
                                                            const isSelected = gradeCategory?.selectedScore === level

                                                            return (
                                                                <TableCell
                                                                    key={level}
                                                                    className={`align-top text-sm border-r last:border-r-0 m-0 p-1 ${isSelected
                                                                        ? 'bg-primary/10 border-4 border-primary rounded-md'
                                                                        : ''
                                                                        }`}
                                                                >
                                                                    {criterion?.description || ''}
                                                                </TableCell>
                                                            )
                                                        })}
                                                    </TableRow>
                                                )
                                            })}
                                            {/* Teacher Comments Row */}
                                            <TableRow>
                                                <TableCell
                                                    colSpan={scoreLevels.length + 1}
                                                    className="font-medium bg-muted/50 border-t-2"
                                                >
                                                    <div className="p-2">
                                                        <p className="font-semibold mb-2">Teacher Comments:</p>
                                                        <p className={`whitespace-pre-line ${!rubricGrade.comment ? 'italic text-muted-foreground' : ''}`}>
                                                            {rubricGrade.comment || 'No comments...'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
