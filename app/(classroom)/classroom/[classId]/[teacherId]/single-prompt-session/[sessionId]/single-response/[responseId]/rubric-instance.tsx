'use client'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Rubric, RubricGradingInstance, RubricGrade } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { gradeRubricWithAI, getTeacherAIAllowance } from '@/lib/actions/openai.action'
import { toast } from "sonner"
import { PrinterIcon, Loader2 } from 'lucide-react'
import { checkout } from '@/lib/stripe/checkout'
import { Badge } from '@/components/ui/badge'
import { useQueryClient } from '@tanstack/react-query'

interface RubricInstanceProps {
    rubric: Rubric;
    responseId?: string;
    existingGrade?: RubricGrade;
    onGradeChange?: (grade: RubricGrade) => void;
    onSave?: (grade: RubricGrade) => void;
    setIsAIGrading: (isGrading: boolean) => void; // Add this prop to control AI grading state in parent
    studentWriting?: string;
    isSaving?: boolean; // Add this prop
    isAIGradingInitial?: boolean; // Add this prop to indicate if AI grading is in progress on initial load
    isAIGrading?: boolean; // Add this prop to indicate if AI grading is currently in progress
}

export default function RubricInstance({
    rubric,
    responseId,
    existingGrade,
    onGradeChange,
    setIsAIGrading,
    onSave,
    studentWriting = '',
    isSaving = false,
    isAIGrading
}: RubricInstanceProps) {

    const [hasChanges, setHasChanges] = useState(false);
    const [comment, setComment] = useState(existingGrade?.comment || '');
    const [aiAllowance, setAiAllowance] = useState<number>(0);
    const queryClient = useQueryClient();

    // Fetch AI allowance when component mounts
    useEffect(() => {
        async function fetchAllowance() {
            const allowance = await getTeacherAIAllowance();
            setAiAllowance(allowance);
        }
        fetchAllowance();
    }, []);

    const [gradingInstance, setGradingInstance] = useState<RubricGradingInstance>(() => {
        // If we have an existing grade, initialize with those scores
        if (existingGrade && rubric.categories) {
            return {
                id: rubric.id,
                title: rubric.title,
                categories: rubric.categories.map((cat, idx) => {
                    // Match by index instead of name to handle duplicate names
                    const savedCategory = existingGrade.categories[idx];
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
            categories: (rubric.categories || []).map(cat => ({
                ...cat,
                selectedScore: undefined
            }))
        };
    });

    // Update state when existingGrade prop changes
    useEffect(() => {
        if (existingGrade && rubric.categories) {
            // Update comment
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setComment(existingGrade.comment || '');

            // Update grading instance
            setGradingInstance({
                id: rubric.id,
                title: rubric.title,
                categories: rubric.categories.map((cat, idx) => {
                    // Match by index instead of name to handle duplicate names
                    const savedCategory = existingGrade.categories[idx];
                    let selectedScore: number | undefined = undefined;

                    if (savedCategory) {
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
            });
        }
    }, [existingGrade, rubric.id, rubric.title, rubric.categories]);


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

        if (!responseId) {
            toast.error('Response ID is required for AI grading');
            return;
        }

        setIsAIGrading(true);
        try {
            // Queue the job without waiting (allows navigation)
            const result = await gradeRubricWithAI(rubric, studentWriting, responseId, undefined, false);
            if (result.success && result.jobId) {
                // Decrement local allowance
                setAiAllowance(prev => prev - 1);
                // set the cache for the response to isAIGrading = true so that it starts polling immediately
                queryClient.setQueryData(['response', responseId], (oldData: any) => {
                    return {
                        ...oldData,
                        isAIGrading: true
                    }
                });
                toast.success('You can leave the page. AI grading is in progress and will update when complete.');
            } else {
                setIsAIGrading(false);
                toast.error(result.message || 'Failed to start AI grading');
            }
        } catch (error) {
            console.error('Error during AI grading:', error);
            setIsAIGrading(false);
            queryClient.setQueryData(['response', responseId], (oldData: any) => {
                return {
                    ...oldData,
                    isAIGrading: true
                }
            });
            toast.error('Failed to grade with AI. Please try again.');
        }
    };

    const handleSave = () => {
        if (onSave) {
            const grade = calculateGrade(gradingInstance)
            onSave(grade)
            // Reset hasChanges after triggering save
            setHasChanges(false)
        }
    }

    // Get the score levels from the first category's criteria length
    const scoreLevels = rubric.categories[0]?.criteria.map((_, idx) => (idx + 1).toString()) || []
    const currentGrade = calculateGrade(gradingInstance)
    const isComplete = gradingInstance.categories.every(cat => cat.selectedScore !== undefined)

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="h3-bold mt-10">{gradingInstance.title}</h3>
                    {isComplete && (
                        <div className='flex items-start justify-start'>
                            <p className="text-muted-foreground font-semibold">
                                Total Score: {currentGrade.totalScore}/{currentGrade.maxTotalScore}
                                ({Math.round((currentGrade.totalScore / currentGrade.maxTotalScore) * 100)}%)
                            </p>
                            {/* Print Btn */}
                            <PrinterIcon
                                className="ml-2 hover:text-accent cursor-pointer"
                                size={23}
                                onClick={() => window.print()}
                            />
                        </div>
                    )}
                </div>
                {onSave && (
                    <div className="flex gap-3 items-center mt-5">
                        {/* AI Grading Button */}
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
                                    <p className="text-muted-foreground text-sm">
                                        <span
                                            onClick={() => {
                                                checkout({
                                                    priceId: process.env.NEXT_PUBLIC_AI_CREDITS_LINK as string,
                                                    mode: "payment"
                                                });
                                            }}
                                            className="text-primary hover:underline hover:cursor-pointer hover:text-accent"
                                        >
                                            Click here to add credits</span>
                                    </p>
                                </div>
                            )}
                        </div>


                        {(existingGrade && !hasChanges ? (
                            <Button disabled className="opacity-50 cursor-not-allowed">
                                {!isComplete ? "Incomplete" : "No Changes"}
                            </Button>
                        ) : (
                            <Button onClick={handleSave} disabled={isSaving || isAIGrading}>
                                {isSaving ? "Saving..." : "Save Grade"}
                            </Button>
                        ))}


                    </div>
                )}
            </div>

            <div className="overflow-x-auto border shadow-md mt-3 relative">
                {/* AI Grading Overlay */}
                {isAIGrading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium">AI is grading.</p>
                            <p className="text-sm font-medium">You can leave this page and come back later.</p>
                        </div>
                    </div>
                )}
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
                            <TableRow key={`${catIdx}-${category.name}`}>
                                {/* Category Name with Selected Score */}
                                <TableCell className="w-60 relative">
                                    <div className="p-4 rounded-md min-h-[100px] flex items-center">
                                        <div>
                                            <div className="font-semibold text-lg">{category.name}</div>
                                            {category.selectedScore !== undefined && (
                                                <Badge variant={"secondary"} className="absolute top-0 left-2 text-xs mt-2">
                                                    Credit: {category.criteria[category.selectedScore].score}
                                                </Badge>
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
                                                disabled={isAIGrading}
                                                className={cn(
                                                    'w-full p-4 rounded-md transition-all duration-200 ease-in-out',
                                                    'text-left border-4 shadow-sm min-h-[100px]',
                                                    'focus:outline-none',
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 scale-[0.98]'
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
                    disabled={isAIGrading}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {comment.length}/500 characters
                </p>
            </div>
        </div>
    )
}
