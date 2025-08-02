'use client'
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Rubric, RubricGradingInstance, RubricGrade, RubricGradeDisplay } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { gradeRubricWithAI, getTeacherAIAllowance } from '@/lib/actions/openai.action'
import { toast } from "sonner"
import { PrinterIcon } from 'lucide-react'
import RubricDisplay from '@/components/rubric-display'

interface RubricInstanceProps {
    rubric: Rubric;
    responseId?: string;
    existingGrade?: RubricGrade; // Add this to accept saved grades
    onGradeChange?: (grade: RubricGrade) => void;
    onSave?: (grade: RubricGrade) => void;
    isPremiumTeacher?: boolean;
    studentWriting?: string; // Student's writing to be graded by AI
    studentName?: string; // Add student name for print view
}

export default function RubricInstance({
    rubric,
    responseId,
    existingGrade,
    onGradeChange,
    onSave,
    isPremiumTeacher = false,
    studentWriting = '',
    studentName
}: RubricInstanceProps) {

    const [hasChanges, setHasChanges] = useState(false);
    const [comment, setComment] = useState(existingGrade?.comment || '');
    const [isAIGrading, setIsAIGrading] = useState(false);
    const [aiAllowance, setAiAllowance] = useState<number>(0);
    const [isPrintMode, setIsPrintMode] = useState(false);

    // Fetch AI allowance when component mounts
    useEffect(() => {
        async function fetchAllowance() {
            if (isPremiumTeacher) {
                const allowance = await getTeacherAIAllowance();
                setAiAllowance(allowance);
            }
        }
        fetchAllowance();
    }, [isPremiumTeacher]);

    const [gradingInstance, setGradingInstance] = useState<RubricGradingInstance>(() => {
        // If we have an existing grade, initialize with those scores
        if (existingGrade) {
            return {
                id: rubric.id,
                title: rubric.title,
                categories: rubric.categories.map((cat) => {
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

    // Function to check if current state matches the existing grade
    const checkForChanges = (instance: RubricGradingInstance, currentComment?: string) => {
        if (!existingGrade) {
            // If there's no existing grade, any selection or comment counts as a change
            const hasGradeSelections = instance.categories.some(cat => cat.selectedScore !== undefined);
            const hasCommentText = (currentComment || '').trim().length > 0;
            setHasChanges(hasGradeSelections || hasCommentText);
            return;
        }

        // Compare current selections with existing grade
        const currentGrade = calculateGrade(instance);
        const hasGradeChanges = existingGrade.categories.some((savedCat, idx) => {
            const currentCat = currentGrade.categories[idx];
            return currentCat && currentCat.selectedScore !== savedCat.selectedScore;
        });

        // Check if comment has changed
        const commentToCheck = currentComment !== undefined ? currentComment : comment;
        const hasCommentChanges = (existingGrade.comment || '') !== commentToCheck;

        setHasChanges(hasGradeChanges || hasCommentChanges);
    };

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

        // Check for changes after updating the instance
        checkForChanges(updatedInstance);

        // Calculate and notify about grade changes
        if (onGradeChange) {
            const grade = calculateGrade(updatedInstance)
            grade.comment = comment; // Include current comment
            onGradeChange(grade)
        }
    }

    const handleCommentChange = (newComment: string) => {
        setComment(newComment);
        checkForChanges(gradingInstance, newComment);

        // Notify parent about grade changes including comment
        if (onGradeChange) {
            const grade = calculateGrade(gradingInstance);
            grade.comment = newComment;
            onGradeChange(grade);
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
            maxTotalScore,
            comment
        }
    }

    const handleAIGrading = async () => {
        if (!studentWriting.trim()) {
            toast.error('No student writing found to grade');
            return;
        }

        if (aiAllowance <= 0) {
            toast.error('AI grading allowance exhausted. Allowance resets with your next billing cycle.');
            return;
        }

        setIsAIGrading(true);
        try {
            const result = await gradeRubricWithAI(rubric, studentWriting, undefined, responseId);

            if (result.success && result.scores && result.comment) {
                // Update the grading instance with AI scores
                const updatedInstance = {
                    ...gradingInstance,
                    categories: gradingInstance.categories.map((cat, idx) => {
                        // Find the criterion that matches the AI's score for this category
                        const aiScore = result.scores![idx];
                        const criterionIndex = cat.criteria.findIndex(criterion => criterion.score === aiScore);

                        return {
                            ...cat,
                            selectedScore: criterionIndex >= 0 ? criterionIndex : undefined
                        };
                    })
                };

                setGradingInstance(updatedInstance);
                setComment(result.comment);

                // Decrement local allowance
                setAiAllowance(prev => prev - 1);

                // Check for changes and notify parent
                checkForChanges(updatedInstance, result.comment);

                if (onGradeChange) {
                    const grade = calculateGrade(updatedInstance);
                    grade.comment = result.comment;
                    onGradeChange(grade);
                }

                toast.success('AI grading completed successfully!');
            } else {
                toast.error(result.message || 'Failed to grade with AI');
            }
        } catch (error) {
            console.error('Error during AI grading:', error);
            toast.error('Failed to grade with AI. Please try again.');
        } finally {
            setIsAIGrading(false);
        }
    };

    const handleSave = () => {
        if (onSave) {
            const grade = calculateGrade(gradingInstance)
            onSave(grade)
            // Reset hasChanges after successful save
            setHasChanges(false)
        }
    }

    const handlePrint = () => {
        if (!isComplete) {
            toast.error('Please complete the rubric grading before printing');
            return;
        }

        setIsPrintMode(true);

        // Wait for the content to render, then trigger print
        setTimeout(() => {
            window.print();
        }, 300);

        // Reset print mode after print dialog closes
        setTimeout(() => {
            setIsPrintMode(false);
        }, 1000);
    };

    // Transform current grading data to RubricGradeDisplay format for the print view
    // const createRubricGradeDisplay = (): RubricGradeDisplay => {
    //     const currentGrade = calculateGrade(gradingInstance);

    //     return {
    //         id: 'temp-print-id',
    //         categories: currentGrade.categories,
    //         totalScore: currentGrade.totalScore,
    //         maxTotalScore: currentGrade.maxTotalScore,
    //         percentageScore: Math.round((currentGrade.totalScore / currentGrade.maxTotalScore) * 100),
    //         comment: comment,
    //         gradedAt: new Date(),
    //         rubric: {
    //             id: rubric.id,
    //             title: rubric.title,
    //             categories: rubric.categories
    //         }
    //     };
    // };

    // Get the score levels from the first category's criteria length
    const scoreLevels = rubric.categories[0]?.criteria.map((_, idx) => (idx + 1).toString()) || []
    const currentGrade = calculateGrade(gradingInstance)
    const isComplete = gradingInstance.categories.every(cat => cat.selectedScore !== undefined)

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold">{gradingInstance.title}</h3>
                    {isComplete && (
                        <div className='flex items-start justify-start'>
                            <p className="text-accent font-semibold">
                                Total Score: {currentGrade.totalScore}/{currentGrade.maxTotalScore}
                                ({Math.round((currentGrade.totalScore / currentGrade.maxTotalScore) * 100)}%)
                            </p>
                            {/* Print Btn */}
                            <PrinterIcon
                                className="ml-2 hover:text-accent cursor-pointer"
                                size={23}
                                onClick={handlePrint}
                            />
                        </div>
                    )}
                </div>
                {onSave && (
                    <div className="flex gap-3 items-center">

                        {/* AI Grading Button */}
                        {isPremiumTeacher && (
                            <div className="flex flex-col items-center space-y-2">
                                {aiAllowance > 0 ? (
                                    <Button
                                        onClick={handleAIGrading}
                                        disabled={isAIGrading || !studentWriting.trim()}
                                        className="w-full"
                                    >
                                        {isAIGrading ? "Grading with AI..." : `Autograde with AI! (${aiAllowance} credits left)`}
                                    </Button>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-destructive text-sm font-medium">
                                            AI grading allowance exhausted
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            Resets with next billing cycle
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}


                        {isComplete && (existingGrade && !hasChanges ? (
                            <Button disabled className="opacity-50 cursor-not-allowed">
                                No Changes
                            </Button>
                        ) : (
                            <Button onClick={handleSave}>
                                Save Grade
                            </Button>
                        ))}


                    </div>
                )}
            </div>

            <div className="overflow-x-auto mt-3">
                <Table className="min-w-[920px]">
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

            {/* Comment Section */}
            <div className="mt-6 space-y-2">
                <Label htmlFor="rubric-comment" className="text-sm font-medium">
                    Optional Comment
                </Label>
                <Textarea
                    id="rubric-comment"
                    placeholder="Add an optional comment about this rubric grade..."
                    value={comment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {comment.length}/500 characters
                </p>
            </div>

            {/* Print View - Use existing RubricDisplay component */}
            {/* {isPrintMode && (
                <div className="p-6 bg-white text-black">
                    <div>
                        <RubricDisplay
                            rubricGrade={createRubricGradeDisplay()}
                            studentName={studentName}
                            isPrintView={true}
                        />
                    </div>
                </div>
            )} */}
        </div>
    )
}
